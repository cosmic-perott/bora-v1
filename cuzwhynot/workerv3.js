const fs = require('fs');
        const path = require('path');
        const cv = require('opencv-wasm');
        const ort = require('onnxruntime-node');

        let originalMat = null;
        let processedMat = null;
        let currentDisplayMat = null;
        let yoloSession = null;

        const canvas = document.getElementById('myCanvas');
        const ctx = canvas.getContext('2d');

        // Initialize YOLOv8 ONNX Session
        async function loadModel() {
            try {
                // Ensure you put your exported best.onnx in your project directory
                yoloSession = await ort.InferenceSession.create('./best.onnx');
                console.log("YOLO Model Loaded Successfully.");
            } catch (e) {
                console.error("Failed to load YOLO model", e);
            }
        }
        loadModel();

        function uploadImage() {
            document.getElementById('fileInput').click();
        }

        function handleFile(event) {
            const file = event.target.files[0];
            if (!file) return;

            const img = new Image();
            img.onload = function() {
                // Read into temporary Canvas to convert to OpenCV Matrix
                let tempCanvas = document.createElement('canvas');
                tempCanvas.width = img.width;
                tempCanvas.height = img.height;
                let tempCtx = tempCanvas.getContext('2d');
                tempCtx.drawImage(img, 0, 0);
                
                let src = cv.imread(tempCanvas);
                originalMat = new cv.Mat();
                cv.cvtColor(src, originalMat, cv.COLOR_RGBA2RGB); // Keep RGB format internally
                src.delete();

                displayImage(originalMat);
            }
            img.src = file.path; // Electron exposes native path directly
        }

        // Equivalent to boost_objects Python method
        function boostObjects(src) {
            let lab = new cv.Mat();
            let bgr = new cv.Mat();
            cv.cvtColor(src, bgr, cv.COLOR_RGB2BGR); // Convert to BGR for standard cv2 ops
            cv.cvtColor(bgr, lab, cv.COLOR_BGR2Lab);

            let channels = new cv.MatVector();
            cv.split(lab, channels);

            // CLAHE processing
            let clahe = new cv.CLAHE(5.0, new cv.Size(8, 8));
            let lChannel = channels.get(0);
            clahe.apply(lChannel, lChannel);
            channels.set(0, lChannel);

            let boostedLab = new cv.Mat();
            cv.merge(channels, boostedLab);
            cv.cvtColor(boostedLab, bgr, cv.COLOR_Lab2BGR);

            // Sobel Edges Filter
            let gray = new cv.Mat();
            cv.cvtColor(bgr, gray, cv.COLOR_BGR2GRAY);
            let gradX = new cv.Mat();
            let gradY = new cv.Mat();
            cv.Sobel(gray, gradX, cv.CV_64F, 1, 0, 3);
            cv.Sobel(gray, gradY, cv.CV_64F, 0, 1, 3);

            let magnitude = new cv.Mat();
            // Manual magnitude calculation (simulating cv2.magnitude)
            cv.multiply(gradX, gradX, gradX);
            cv.multiply(gradY, gradY, gradY);
            cv.add(gradX, gradY, magnitude);
            
            let edges = new cv.Mat();
            magnitude.convertTo(edges, cv.CV_32F);
            cv.sqrt(edges, edges);
            cv.normalize(edges, edges, 0, 255, cv.NORM_MINMAX, cv.CV_8U);

            let edges3Ch = new cv.MatVector();
            edges3Ch.push_back(edges); edges3Ch.push_back(edges); edges3Ch.push_back(edges);
            let mergedEdges = new cv.Mat();
            cv.merge(edges3Ch, mergedEdges);

            // Weighted additions for sharpening/boosting
            let boosted = new cv.Mat();
            cv.addWeighted(bgr, 1.0, mergedEdges, 0.6, 0, boosted);

            let blur = new cv.Mat();
            cv.GaussianBlur(boosted, blur, new cv.Size(0, 0), 2);
            
            let finalBgr = new cv.Mat();
            cv.addWeighted(boosted, 1.4, blur, -0.4, 0, finalBgr);

            let finalRgb = new cv.Mat();
            cv.cvtColor(finalBgr, finalRgb, cv.COLOR_BGR2RGB);

            // Cleanup Mats
            lab.delete(); bgr.delete(); channels.delete(); lChannel.delete(); boostedLab.delete();
            gray.delete(); gradX.delete(); gradY.delete(); magnitude.delete(); edges.delete();
            edges3Ch.delete(); mergedEdges.delete(); boosted.delete(); blur.delete();

            return finalRgb;
        }

        // YOLOv8 Object Detection Inference
        async function objectDetection(src) {
            if (!yoloSession) {
                alert("Model is still loading, please wait...");
                return src.clone();
            }

            // 1. Resize image to YOLOv8 standard input dimensions (640x640)
            let resized = new cv.Mat();
            cv.resize(src, resized, new cv.Size(640, 640));

            // 2. Normalize and Float32 flatten to fit [1, 3, 640, 640] shape tensor
            const data = new Float32Array(1 * 3 * 640 * 640);
            let idx = 0;
            for (let c = 0; c < 3; c++) {
                for (let r = 0; r < 640; r++) {
                    for (let col = 0; col < 640; col++) {
                        // Access pixel channels separately (R, G, B order)
                        let pixel = resized.ucharPtr(r, col);
                        data[idx++] = pixel[c] / 255.0; 
                    }
                }
            }

            const inputTensor = new ort.Tensor('float32', data, [1, 3, 640, 640]);
            const feeds = { [yoloSession.inputNames[0]]: inputTensor };
            
            // 3. Inference run
            const outputMap = await yoloSession.run(feeds);
            const output = outputMap[yoloSession.outputNames[0]];

            // 4. Bounding Box & Annotations Render Logic
            let annotatedMat = src.clone();
            
            // YOLOv8 outputs are structured in an [1, 84, 8400] shape matrix 
            // Loop predictions, filter by confidence, and render directly onto `annotatedMat` using cv.rectangle
            const outputData = output.data; 
            const totalPredictions = 8400; 

            for (let i = 0; i < totalPredictions; i++) {
                let maxConf = 0;
                let classId = -1;
                
                // YOLOv8 class elements start from index position 4 up to total classes
                for (let c = 4; c < 84; c++) {
                    let conf = outputData[c * totalPredictions + i];
                    if (conf > maxConf) {
                        maxConf = conf;
                        classId = c - 4;
                    }
                }

                if (maxConf > 0.45) { // Confidence Threshold
                    let cx = outputData[0 * totalPredictions + i] * (src.cols / 640);
                    let cy = outputData[1 * totalPredictions + i] * (src.rows / 640);
                    let w  = outputData[2 * totalPredictions + i] * (src.cols / 640);
                    let h  = outputData[3 * totalPredictions + i] * (src.rows / 640);

                    let x = Math.round(cx - w/2);
                    let y = Math.round(cy - h/2);

                    cv.rectangle(annotatedMat, new cv.Point(x, y), new cv.Point(x + Math.round(w), y + Math.round(h)), [0, 255, 0, 255], 2);
                }
            }

            resized.delete();
            return annotatedMat;
        }

        async function processImage() {
            if (!originalMat) {
                alert("Upload an image first");
                return;
            }

            console.log("BOOSTING...");
            let boosted = boostObjects(originalMat);
            
            console.log("DETECTING...");
            processedMat = await objectDetection(boosted);
            
            boosted.delete();
            console.log("DONE");
            alert("Processing complete");
        }

        function showProcessed() {
            if (!processedMat) {
                alert("Process image first");
                return;
            }
            displayImage(processedMat);
        }

        function saveOriginal() {
            if (!originalMat) return alert("No image to save");
            saveMatToFile(originalMat, `original_${Date.now()}.png`);
        }

        function saveProcessed() {
            if (!processedMat) return alert("No processed image");
            saveMatToFile(processedMat, `processed_${Date.now()}.png`);
        }

        function saveMatToFile(mat, filename) {
            const folder = path.join(__dirname, 'test_storage');
            if (!fs.existsSync(folder)) fs.mkdirSync(folder);

            let tempCanvas = document.createElement('canvas');
            cv.imshow(tempCanvas, mat);
            
            const dataUrl = tempCanvas.toDataURL('image/png');
            const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");
            const fullPath = path.join(folder, filename);

            fs.writeFileSync(fullPath, base64Data, 'base64');
            alert(`Saved to:\n${fullPath}`);
        }

        // Scales and displays OpenCV matrices maintaining aspect ratio
        function displayImage(mat) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            let tempCanvas = document.createElement('canvas');
            cv.imshow(tempCanvas, mat);

            // Thumbnail scaling math (600x400 bounding container box)
            let ratio = Math.min(600 / mat.cols, 400 / mat.rows);
            let newWidth = mat.cols * ratio;
            let newHeight = mat.rows * ratio;

            let xOffset = (600 - newWidth) / 2;
            let yOffset = (400 - newHeight) / 2;

            ctx.drawImage(tempCanvas, 0, 0, mat.cols, mat.rows, xOffset, yOffset, newWidth, newHeight);
        }
