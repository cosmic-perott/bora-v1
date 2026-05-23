import cv2
import numpy as np
import sys
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(ROOT)

from denoise_filter.filter_v5 import boost_objects
from object_detection_model.objectdetection import load_model, run_detection
from object_detection_post_processsing.matrix_test import check_proximity

YOLO_WEIGHTS  = os.path.join(ROOT, "yolov8_objectdetection_library", "weights", "best.pt")
CAMERA_INDEX  = 0
DISPLAY_W     = 800
DISPLAY_H     = 480

def draw_warning(frame, warning_level, box=None):
    h, w = frame.shape[:2]

    if warning_level == 0:
        return frame

    colors = {
        1: (0, 255, 255),
        2: (0, 165, 255),
        3: (0, 0, 255),
    }
    messages = {
        1: "vehicle there",
        2: "kinda closeee",
        3: "aaa its closerr",
    }

    color = colors[warning_level]
    msg   = messages[warning_level]

    if box is not None:
        x1, y1, x2, y2 = [int(v) for v in box]
        thickness = 3 if warning_level == 3 else 2
        cv2.rectangle(frame, (x1, y1), (x2, y2), color, thickness)

    cv2.rectangle(frame, (0, 0), (w, 60), color, -1)
    cv2.putText(frame, msg, (10, 42),
                cv2.FONT_HERSHEY_DUPLEX, 1.0, (0, 0, 0), 2, cv2.LINE_AA)

    return frame
  
from picamera2 import Picamera2

def run():
    model = load_model(YOLO_WEIGHTS)

    picam2 = Picamera2()
    config = picam2.create_preview_configuration(
        main={"format": "BGR888", "size": (DISPLAY_W, DISPLAY_H)}
    )
    picam2.configure(config)
    picam2.start()

    print("Pipeline run")

    while True:
        frame = picam2.capture_array()
        if frame is None:
            print("frame where")
            break

        frame_h, frame_w = frame.shape[:2]

        # step 1: dehaze
        dehazed = boost_objects(frame)

        # step 2: detect vehicles
        boxes = run_detection(model, dehazed)

        # draw all detections in green
        for (x1, y1, x2, y2) in boxes:
            cv2.rectangle(dehazed,
                          (int(x1), int(y1)), (int(x2), int(y2)),
                          (0, 255, 0), 1)

        # step 3: check proximity and movement
        warning_level, primary_box = check_proximity(boxes, frame_w, frame_h)

        # step 4: draw warning overlay
        output = draw_warning(dehazed, warning_level, primary_box)

        # status bar
        status = f"Vehicles: {len(boxes)}"
        cv2.putText(output, status, (10, frame_h - 10),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (200, 200, 200), 1)

        cv2.imshow("pipiline", output)

        if cv2.waitKey(1) & 0xFF == ord("q"):
            break

    picam2.stop()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    run()
