import torch
import cv2
import torchvision

print(f"PyTorch:     {torch.__version__}")
print(f"CUDA available: {torch.cuda.is_available()}")
print(f"OpenCV:      {cv2.__version__}")
print(f"Torchvision: {torchvision.__version__}")

model = torchvision.models.resnet18(weights="IMAGENET1K_V1")
model.eval()
print("ResNet18 loaded OK")

cap = cv2.VideoCapture(0)
ret, frame = cap.read()
cap.release()
print(f"Camera test: {'OK' if ret else 'no camera found (normal if no webcam connected)'}")
