from ultralytics import YOLO
import cv2

def load_model(weights_path):
    model = YOLO(weights_path)
    return model

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

if __name__ == "__main__":
    model = load_model("runs/detect/train/weights/best.pt")
    image_path = "yolo_car_200/images/train/000000567149.jpg"
    frame = cv2.imread(image_path)
    boxes = run_detection(model, frame)
    print(f"Detected {len(boxes)} vehicles")
    results = model(image_path)
    annotated = results[0].plot()
    cv2.imshow("Detection", annotated)
    cv2.waitKey(0)
    cv2.destroyAllWindows()
    cv2.imwrite("output.jpg", annotated)
