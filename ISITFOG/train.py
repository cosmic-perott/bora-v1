import torch
import torch.nn as nn
from torchvision import models
from pathlib import Path
from tqdm import tqdm
from dataset import get_dataloaders, count_images

MODELS_DIR = Path("models")
MODELS_DIR.mkdir(exist_ok=True)

EPOCHS = 15
BATCH_SIZE = 32
LEARNING_RATE = 0.0001
DEVICE = torch.device("mps" if torch.backends.mps.is_available() else "cpu")

print(f"Training on: {DEVICE}")

def build_model():
    model = models.resnet18(weights="IMAGENET1K_V1")
    for param in model.parameters():
        param.requires_grad = False
    model.fc = nn.Sequential(
        nn.Dropout(0.3),
        nn.Linear(512, 1),
        nn.Sigmoid()
    )
    return model.to(DEVICE)

def train_one_epoch(model, loader, optimizer, criterion):
    model.train()
    total_loss, correct, total = 0, 0, 0

    for images, labels in tqdm(loader, desc="  training", leave=False):
        images = images.to(DEVICE)
        labels = labels.float().unsqueeze(1).to(DEVICE)

        optimizer.zero_grad()
        outputs = model(images)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()

        total_lo
