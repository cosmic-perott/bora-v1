import torch
import cv2
import torchvision

model = torchvision.models.resnet18(weights="IMAGENET1K_V1")
model.eval()

cap = cv2.VideoCapture(0)
ret, frame = cap.read()
cap.release()
print(f"Camera test: {'OK' if ret else 'no camera found'}")
