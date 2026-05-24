
        const fs = require('fs');
        const path = require('path');
        
        const canvas = document.getElementById('myCanvas');
        const ctx = canvas.getContext('2d');
        const statusText = document.getElementById('status');

        let originalImgData = null;
        let processedImgData = null;
        let showingProcessed = false;

        // Initialize our Background Worker Thread
        const pipelineWorker = new Worker('worker.js');

        pipelineWorker.onmessage = function(e) {
            const { type, data, error, message } = e.data;

            if (type === 'READY') {
                statusText.innerText = "Pipeline Engine Ready.";
            } else if (type === 'STATUS') {
                statusText.innerText = message;
            } else if (type === 'SUCCESS') {
                statusText.innerText = "Processing Complete!";
                processedImgData = data; // Received ImageData array from worker
                document.getElementById('btnShow').disabled = false;
                document.getElementById('btnSaveProc').disabled = false;
                toggleDisplay(true); // Automatically switch view to processed
            } else if (type === 'ERROR') {
                statusText.innerText = `Error: ${error}`;
                alert(error);
            }
        };

        function uploadImage() { document.getElementById('fileInput').click(); }

        function handleFile(event) {
            const file = event.target.files[0];
            if (!file) return;

            const img = new Image();
            img.onload = function() {
                // Resize internal dimensions to match source image
                canvas.width = 600;
                canvas.height = 400;
                
                // Draw and capture native pixels
                let tempCanvas = document.createElement('canvas');
                tempCanvas.width = img.width;
                tempCanvas.height = img.height;
                let tempCtx = tempCanvas.getContext('2d');
                tempCtx.drawImage(img, 0, 0);
                
                originalImgData = tempCtx.getImageData(0, 0, img.width, img.height);
                processedImgData = null;
                showingProcessed = false;

                document.getElementById('btnProcess').disabled = false;
                document.getElementById('btnSaveOrig').disabled = false;
                document.getElementById('btnShow').disabled = true;
                document.getElementById('btnSaveProc').disabled = true;

                displayImageData(originalImgData);
                statusText.innerText = "Image Loaded successfully.";
            }
            img.src = file.path;
        }

        function processImage() {
            if (!originalImgData) return;
            // Send pixel payload to background thread. 
            // Transfer ownership of a copy array to avoid main thread clone memory hits.
            const pixelBuffer = new Uint8ClampedArray(originalImgData.data);
            pipelineWorker.postMessage({
                type: 'PROCESS',
                width: originalImgData.width,
                height: originalImgData.height,
                buffer: pixelBuffer
            }, [pixelBuffer.buffer]);
        }

        function toggleDisplay(forceProcessed = false) {
            if (!processedImgData) return;
            showingProcessed = forceProcessed || !showingProcessed;
            document.getElementById('btnShow').innerText = showingProcessed ? "Show Original" : "Show Processed";
            displayImageData(showingProcessed ? processedImgData : originalImgData);
        }

        function displayImageData(imgData) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Render scaling using an offscreen canvas component
            let offscreen = document.createElement('canvas');
            offscreen.width = imgData.width;
            offscreen.height = imgData.height;
            offscreen.getContext('2d').putImageData(imgData, 0, 0);

            let ratio = Math.min(600 / imgData.width, 400 / imgData.height);
            let w = imgData.width * ratio;
            let h = imgData.height * ratio;
            let x = (600 - w) / 2;
            let y = (400 - h) / 2;

            ctx.drawImage(offscreen, 0, 0, imgData.width, imgData.height, x, y, w, h);
        }

        function saveOriginal() { saveToFile(originalImgData, 'original'); }
        function saveProcessed() { saveToFile(processedImgData, 'processed'); }

        function saveToFile(imgData, prefix) {
            if (!imgData) return;
            const folder = path.join(__dirname, 'test_storage');
            if (!fs.existsSync(folder)) fs.mkdirSync(folder);

            let outCanvas = document.createElement('canvas');
            outCanvas.width = imgData.width;
            outCanvas.height = imgData.height;
            outCanvas.getContext('2d').putImageData(imgData, 0, 0);

            const base64Data = outCanvas.toDataURL('image/png').replace(/^data:image\/png;base64,/, "");
            const fullPath = path.join(folder, `${prefix}_${Date.now()}.png`);

            fs.writeFileSync(fullPath, base64Data, 'base64');
            alert(`File saved to:\n${fullPath}`);
        }
