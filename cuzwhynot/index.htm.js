<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: sans-serif; text-align: center; background: #f0f0f0; margin: 20px; }
        canvas { background: gray; display: block; margin: 0 auto; box-shadow: 0 4px 8px rgba(0,0,0,0.2); }
        .btn-frame { margin-top: 15px; }
        button { padding: 8px 12px; margin: 5px; cursor: pointer; font-size: 14px; }
    </style>
</head>
<body>

    <canvas id="myCanvas" width="600" height="400"></canvas>

    <div class="btn-frame">
        <button onclick="uploadImage()">Upload Image</button>
        <button onclick="processImage()">Process Image</button>
        <button onclick="showProcessed()">Show Processed</button>
        <button onclick="saveOriginal()">Save Original</button>
        <button onclick="saveProcessed()">Save Processed</button>
    </div>

    <input type="file" id="fileInput" style="display:none" accept="image/*" onchange="handleFile(event)">

</body>
</html>
