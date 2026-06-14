from ultralytics import YOLO
import cv2

def load_model(weights_path):
    return YOLO(weights_path)

def run_detection(model, frame, conf=0.4):
    results = model.track(frame, conf=conf, tracker="bytetrack.yaml",verbose=False, persist=True)
    boxes = []
    for r in results:
        if r.boxes.id is None:
            continue
        for box, track_id in zip(r.boxes, r.boxes.id.tolist()):
            x1, y1, x2, y2 = box.xyxy[0].tolist()
            boxes.append((x1, y1, x2, y2, int(track_id)))
    return boxes
    
def run_light_detection(model, frame, conf=0.3):
    results = model(frame, conf=conf, verbose=False)
    boxes = []
    for r in results:
        for box in r.boxes:
            x1, y1, x2, y2 = box.xyxy[0].tolist()
            boxes.append((x1, y1, x2, y2))
    return boxes
