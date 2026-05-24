<!DOCTYPE html>
<html>
<head>
    <title>Advanced Image Processor (YOLOv8)</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; text-align: center; background: #1e1e24; color: #fff; margin: 20px; }
        .container { max-width: 800px; margin: 0 auto; }
        canvas { background: #111; display: block; margin: 20px auto; border-radius: 8px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
        .btn-frame { display: flex; justify-content: center; gap: 10px; flex-wrap: wrap; margin-top: 15px; }
        button { background: #3b82f6; color: white; border: none; padding: 10px 18px; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 600; transition: background 0.2s; }
        button:hover { background: #2563eb; }
        button:disabled { background: #4b5563; cursor: not-allowed; }
        #status { font-style: italic; color: #9ca3af; margin-top: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <h2>Image Enhancement & Detection Pipeline</h2>
        <canvas id="myCanvas" width="600" height="400"></canvas>
        <div id="status">Loading AI Pipeline Engine...</div>

        <div class="btn-frame">
            <button id="btnUpload" onclick="uploadImage()">Upload Image</button>
            <button id="btnProcess" onclick="processImage()" disabled>Process Image</button>
            <button id="btnShow" onclick="toggleDisplay()" disabled>Show Processed</button>
            <button id="btnSaveOrig" onclick="saveOriginal()" disabled>Save Original</button>
            <button id="btnSaveProc" onclick="saveProcessed()" disabled>Save Processed</button>
        </div>
    </div>

    <input type="file" id="fileInput" style="display:none" accept="image/*" onchange="handleFile(event)">

</body>
</html>
