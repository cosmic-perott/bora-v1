
        const fs = require('fs');
        const path = require('path');

        const canvas = document.getElementById('myCanvas');
        const ctx = canvas.getContext('2d');
        const statusHud = document.getElementById('status-hud');

        let originalImgData = null;
        let processedImgData = null;
        let showingProcessed = false;
        let worker = null;

        // --- MULTI-THREADED BACKGROUND WORKER LAYER (INLINE BLOB) ---
        const workerCode = `
            // Load script resources directly within isolated worker context scope
            importScripts('https://docs.opencv.org/4.10.0/opencv.js');
            importScripts('https://cdn.jsdelivr.net/npm/onnxruntime-node@1.18.0/dist/ort.min.js'); 
            // Note: If running inside Electron desktop environment, use path-resolved 
            // node_modules/onnxruntime-node/dist/ort.bin or standard Web ORT fallback asset paths.

            let yoloSession = null;

            cv['onRuntimeInitialized'] = async () => {
                try {
                    // Initialize the YOLOv8 Inference Session with standard execution parameters
                    // Assumes best.onnx is located at project workspace root directory
                    yoloSession = await ort.InferenceSession.create('./best.onnx');
                    postMessage({ type: 'ENGINE_READY' });
                } catch(e) {
                    postMessage({ type: 'LOG_ERROR', error: 'ONNX Init failed: ' + e.message });
                }
            };

            self.onmessage = async function(e) {
                if (e.data.type === 'EXECUTE_PIPELINE') {
                    const { width, height, rgbaBuffer } = e.data;
                    try {
                        postMessage({ type: 'PROGRESS_UPDATE', text: 'Running Contrast Enhancement & Filtering...' });
                        
                        // 1. Allocate working baseline source matrix container
                        let srcMat = new cv.Mat(height, width, cv.CV_8UC4);
                        srcMat.data.set(rgbaBuffer);

                        let rgbMat = new cv.Mat();
                        cv.cvtColor(srcMat, rgbMat, cv.COLOR_RGBA2RGB);

                        // 2. Perform BORA Filter Contrast/Sharpening Transformations
                        let enhancedMat = boostObjects(rgbMat);

                        postMessage({ type: 'PROGRESS_UPDATE', text: 'Running YOLOv8 Object Detection & Non-Maximum Suppression...' });

                        // 3. Process Neural Network Prediction Passes and draw annotations
                        let annotatedMat = await runObjectDetection(enhancedMat);

                        // 4. Return structural pixel context mapping elements back to host thread
                        let finalRgbaMat = new cv.Mat();
                        cv.cvtColor(annotatedMat, finalRgbaMat, cv.COLOR_RGB2RGBA);

                        const outBuffer = new Uint8ClampedArray(finalRgbaMat.data);

                        postMessage({
                            type: 'PIPELINE_COMPLETE',
                            imgDataPayload: { width: width, height: height, buffer: outBuffer }
                        }, [outBuffer.buffer]);

                        // Internal Thread Heap Memory Deallocations
                        srcMat.delete(); rgbMat.delete(); enhancedMat.delete(); annotatedMat.delete(); finalRgbaMat.delete();
                    } catch(err) {
                        postMessage({ type: 'LOG_ERROR', error: err.message });
                    }
                }
            };

            function boostObjects(src) {
                let bgr = new cv.Mat();
                let lab = new cv.Mat();
                cv.cvtColor(src, bgr, cv.COLOR_RGB2BGR);
                cv.cvtColor(bgr, lab, cv.COLOR_BGR2Lab);

                let channels = new cv.MatVector();
                cv.split(lab, channels);

                // High-gain Contrast Limited Adaptive Histogram Equalization
                let clahe = new cv.CLAHE(5.0, new cv.Size(8, 8));
                let lChannel = channels.get(0);
                clahe.apply(lChannel, lChannel);
                channels.set(0, lChannel);

                cv.merge(channels, lab);
                cv.cvtColor(lab, bgr, cv.COLOR_Lab2BGR);

                // Sobel Spatial Edge Filter Isolation Mapping
                let gray = new cv.Mat();
                cv.cvtColor(bgr, gray, cv.COLOR_BGR2GRAY);
                let gradX = new cv.Mat();
                let gradY = new cv.Mat();
                cv.Sobel(gray, gradX, cv.CV_16S, 1, 0, 3);
                cv.Sobel(gray, gradY, cv.CV_16S, 0, 1, 3);

                let absGradX = new cv.Mat();
                let absGradY = new cv.Mat();
                cv.convertScaleAbs(gradX, absGradX);
                cv.convertScaleAbs(gradY, absGradY);

                let edges = new cv.Mat();
                cv.addWeighted(absGradX, 0.5, absGradY, 0.5, 0, edges);

                let edges3Ch = new cv.MatVector();
                edges3Ch.push_back(edges); edges3Ch.push_back(edges); edges3Ch.push_back(edges);
                let mergedEdges = new cv.Mat();
                cv.merge(edges3Ch, mergedEdges);

                // Weighted Feature Boundary Superimposition Layer Blend
                let boosted = new cv.Mat();
                cv.addWeighted(bgr, 1.0, mergedEdges, 0.6, 0, boosted);

                let blur = new cv.Mat();
                cv.GaussianBlur(boosted, blur, new cv.Size(0, 0), 2);
                
                let finalBgr = new cv.Mat();
                cv.addWeighted(boosted, 1.4, blur, -0.4, 0, finalBgr);

                let finalRgb = new cv.Mat();
                cv.cvtColor(finalBgr, finalRgb, cv.COLOR_BGR2RGB);

                bgr.delete(); lab.delete(); channels.delete(); clahe.delete(); lChannel.delete();
                gray.delete(); gradX.delete(); gradY.delete(); absGradX.delete(); absGradY.delete();
                edges.delete(); edges3Ch.delete(); mergedEdges.delete(); boosted.delete(); blur.delete(); finalBgr.delete();

                return finalRgb;
            }

            async function runObjectDetection(src) {
                if (!yoloSession) return src.clone();

                let resized = new cv.Mat();
                cv.resize(src, resized, new cv.Size(640, 640));

                // Flatten matrix structure elements into CHW format configuration tensors
                const tensorData = new Float32Array(1 * 3 * 640 * 640);
                let idx = 0;
                for (let c = 0; c < 3; c++) {
                    for (let r = 0; r < 640; r++) {
                        for (let col = 0; col < 640; col++) {
                            tensorData[idx++] = resized.ucharPtr(r, col)[c] / 255.0;
                        }
                    }
                }

                const inputTensor = new ort.Tensor('float32', tensorData, [1, 3, 640, 640]);
                const outputMap = await yoloSession.run({ [yoloSession.inputNames[0]]: inputTensor });
                const output = outputMap[yoloSession.outputNames[0]];

                let annotated = src.clone();
                const outData = output.data;
                const totalPredictions = 8400;
                let candidateBoxes = [];

                // Filter prediction array indices
                for (let i = 0; i < totalPredictions; i++) {
                    let maxConfidence = 0;
                    for (let c = 4; c < 84; c++) {
                        let conf = outData[c * totalPredictions + i];
                        if (conf > maxConfidence) maxConfidence = conf;
                    }

                    if (maxConfidence > 0.45) {
                        let cx = outData[0 * totalPredictions + i] * (src.cols / 640);
                        let cy = outData[1 * totalPredictions + i] * (src.rows / 640);
                        let w  = outData[2 * totalPredictions + i] * (src.cols / 640);
                        let h  = outData[3 * totalPredictions + i] * (src.rows / 640);

                        candidateBoxes.push({
                            x: Math.round(cx - w / 2),
                            y: Math.round(cy - h / 2),
                            w: w, h: h, score: maxConfidence
                        });
                    }
                }

                // --- NON-MAXIMUM SUPPRESSION (NMS) FILTER ROUTINE ---
                candidateBoxes.sort((a, b) => b.score - a.score);
                let pickedBoxes = [];

                while (candidateBoxes.length > 0) {
                    let current = candidateBoxes.shift();
                    pickedBoxes.push(current);

                    candidateBoxes = candidateBoxes.filter(box => {
                        let interX1 = Math.max(current.x, box.x);
                        let interY1 = Math.max(current.y, box.y);
                        let interX2 = Math.min(current.x + current.w, box.x + box.w);
                        let interY2 = Math.min(current.y + current.h, box.y + box.h);

                        let interW = Math.max(0, interX2 - interX1);
                        let interH = Math.max(0, interY2 - interY1);
                        let interArea = interW * interH;

                        let unionArea = (current.w * current.h) + (box.w * box.h) - interArea;
                        return (interArea / unionArea) < 0.45; // IoU threshold match limits
                    });
                }

                // Apply NMS bounding geometry boxes over native mat elements
                pickedBoxes.forEach(b => {
                    cv.rectangle(annotated, new cv.Point(b.x, b.y), new cv.Point(b.x + Math.round(b.w), b.y + Math.round(b.h)), [0, 255, 0, 255], 2);
                });

                resized.delete();
                return annotated;
            }
        `;

        // Create internal runtime blob instance
        const blob = new Blob([workerCode], { type: 'application/javascript' });
        worker = new Worker(URL.createObjectURL(blob));

        worker.onmessage = function(e) {
            const { type, text, error, imgDataPayload } = e.data;

            if (type === 'ENGINE_READY') {
                statusHud.innerText = "System components online. Upload image to begin.";
            } else if (type === 'PROGRESS_UPDATE') {
                statusHud.innerText = text;
            } else if (type === 'LOG_ERROR') {
                statusHud.innerText = `Error State: ${error}`;
                alert(`Pipeline Error: ${error}`);
            } else if (type === 'PIPELINE_COMPLETE') {
                statusHud.innerText = "Processing sequence finalized.";
                
                // Construct structural view output context properties
                processedImgData = ctx.createImageData(imgDataPayload.width, imgDataPayload.height);
                processedImgData.data.set(imgDataPayload.buffer);

                document.getElementById('btnShow').disabled = false;
                document.getElementById('btnSaveProc').disabled = false;
                toggleDisplay(true); // Default rendering focuses onto processed output
            }
        };

        // --- HOST WINDOW INTERFACE DECORATOR ACTIONS ---

        function uploadImage() {
            document.getElementById('fileInput').click();
        }

        function handleFile(event) {
            const file = event.target.files[0];
            if (!file) return;

            const img = new Image();
            img.onload = function() {
                // Instatitate a workspace rendering sandbox canvas element
                let offscreen = document.createElement('canvas');
                offscreen.width = img.width;
                offscreen.height = img.height;
                let oCtx = offscreen.getContext('2d');
                oCtx.drawImage(img, 0, 0);

                originalImgData = oCtx.getImageData(0, 0, img.width, img.height);
                processedImgData = null;
                showingProcessed = false;

                document.getElementById('btnProcess').disabled = false;
                document.getElementById('btnSaveOrig').disabled = false;
                document.getElementById('btnShow').disabled = true;
                document.getElementById('btnSaveProc').disabled = true;
                document.getElementById('btnShow').innerText = "Show Processed";

                renderToMainViewCanvas(originalImgData);
                statusHud.innerText = "Source image staging array populated.";
            };
            img.src = file.path; // Desktop full path access integration map
        }

        function processImage() {
            if (!originalImgData) return;
            
            statusHud.innerText = "Dispatching calculations off thread context...";
            
            // Fast transfer zero-copy backing buffers to background context processing structures
            const clonedBuffer = new Uint8ClampedArray(originalImgData.data);
            worker.postMessage({
                type: 'EXECUTE_PIPELINE',
                width: originalImgData.width,
                height: originalImgData.height,
                rgbaBuffer: clonedBuffer
            }, [clonedBuffer.buffer]);
        }

        function toggleDisplay(forceShowProcessed = false) {
            if (!processedImgData) return;

            showingProcessed = forceShowProcessed ? true : !showingProcessed;
            document.getElementById('btnShow').innerText = showingProcessed ? "Show Original" : "Show Processed";
            renderToMainViewCanvas(showingProcessed ? processedImgData : originalImgData);
        }

        function renderToMainViewCanvas(imgData) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            let renderScratchpad = document.createElement('canvas');
            renderScratchpad.width = imgData.width;
            renderScratchpad.height = imgData.height;
            renderScratchpad.getContext('2d').putImageData(imgData, 0, 0);

            // Thumbnail scaling calculation preserving baseline source aspect proportions
            let scalarRatio = Math.min(600 / imgData.width, 400 / imgData.height);
            let wTarget = imgData.width * scalarRatio;
            let hTarget = imgData.height * scalarRatio;
            let targetX = (600 - wTarget) / 2;
            let targetY = (400 - hTarget) / 2;

            ctx.drawImage(renderScratchpad, 0, 0, imgData.width, imgData.height, targetX, targetY, wTarget, hTarget);
        }

        function saveOriginal() { persistArrayBufferToDisk(originalImgData, 'original'); }
        function saveProcessed() { persistArrayBufferToDisk(processedImgData, 'processed'); }

        function persistArrayBufferToDisk(imgData, filenamePrefix) {
            if (!imgData) return;

            const targetStorageFolder = path.join(__dirname, 'test_storage');
            if (!fs.existsSync(targetStorageFolder)) {
                fs.mkdirSync(targetStorageFolder, { recursive: true });
            }

            let exportCanvas = document.createElement('canvas');
            exportCanvas.width = imgData.width;
            exportCanvas.height = imgData.height;
            exportCanvas.getContext('2d').putImageData(imgData, 0, 0);

            const dataUrlString = exportCanvas.toDataURL('image/png');
            const cleanBase64Payload = dataUrlString.replace(/^data:image\/png;base64,/, "");
            const destinationPath = path.join(targetStorageFolder, `${filenamePrefix}_${Date.now()}.png`);

            fs.writeFileSync(destinationPath, cleanBase64Payload, 'base64');
            alert(`Resource successfully exported to:\n${destinationPath}`);
        }
    
