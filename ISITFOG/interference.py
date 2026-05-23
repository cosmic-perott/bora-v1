import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
import cv2
import numpy as np
from pathlib import Path

MODEL_PATH = Path("models/best_model.pth")
IMG_SIZE = 224
DEVICE = torch.device("mps" if torch.backends.mps.is_available() else "cpu")

# same normalization as training
TRANSFORM = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406],
                         std=[0.229, 0.224, 0.225]),
])

def load_classifier(model_path=MODEL_PATH):
    model = models.resnet18(weights=None)
    model.fc = nn.Sequential(
        nn.Dropout(0.3),
        nn.Linear(512, 1),
        nn.Sigmoid()
    )
    model.load_state_dict(torch.load(model_path, map_location=DEVICE))
    model.eval()
    model.to(DEVICE)
    print(f"Fog classifier loaded from {model_path}")
    return model

def is_foggy(model, frame):
    """
    Takes a single OpenCV frame (BGR numpy array).
    Returns:
        foggy: True if fog detected, False if clear
        confidence: float 0-1, how confident the model is
    """
    image = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
    tensor = TRANSFORM(image).unsqueeze(0).to(DEVICE)
    with torch.no_grad():
        score = model(tensor).item()
    foggy = score >= 0.5
    return foggy, score

if __name__ == "__main__":
    import sys

    if not MODEL_PATH.exists():
        print("No trained model found at models/best_model.pth")
        print("Please run train.py first.")
        sys.exit(1)

    model = load_classifier()

    # test on webcam
    cap = cv2.VideoCapture(0)
    print("Running fog classifier — press Q to quit.")

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        foggy, confidence = is_foggy(model, frame)

        label = f"{'FOGGY' if foggy else 'CLEAR'} ({confidence:.2f})"
        color = (0, 165, 255) if foggy else (0, 255, 0)

        cv2.rectangle(frame, (0, 0), (frame.shape[1], 50), color, -1)
        cv2.putText(frame, label, (10, 35),
                    cv2.FONT_HERSHEY_DUPLEX, 1.0, (0, 0, 0), 2)

        cv2.imshow("Fog Classifier", frame)
        if cv2.waitKey(1) & 0xFF == ord("q"):
            break

    cap.release()
    cv2.destroyAllWindows()
