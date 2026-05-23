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
        total_loss += loss.item()
        preds = (outputs >= 0.5).float()
        correct += (preds == labels).sum().item()
        total += labels.size(0)
    return total_loss / len(loader), correct / total

def evaluate(model, loader, criterion):
    model.eval()
    total_loss, correct, total = 0, 0, 0
    with torch.no_grad():
        for images, labels in tqdm(loader, desc="  validating", leave=False):
            images = images.to(DEVICE)
            labels = labels.float().unsqueeze(1).to(DEVICE)
            outputs = model(images)
            loss = criterion(outputs, labels)
            total_loss += loss.item()
            preds = (outputs >= 0.5).float()
            correct += (preds == labels).sum().item()
            total += labels.size(0)
    return total_loss / len(loader), correct / total

def train():
    n_foggy, n_clear = count_images()
    if n_foggy == 0 or n_clear == 0:
        print("\nNo images found in data/foggy or data/clear.")
        print("Please add images before training.")
        return

    train_loader, val_loader = get_dataloaders(batch_size=BATCH_SIZE)
    model = build_model()
    criterion = nn.BCELoss()
    optimizer = torch.optim.Adam(model.fc.parameters(), lr=LEARNING_RATE)
    scheduler = torch.optim.lr_scheduler.StepLR(optimizer, step_size=5, gamma=0.5)

    best_val_acc = 0.0
    print(f"\nStarting training for {EPOCHS} epochs...\n")

    for epoch in range(1, EPOCHS + 1):
        train_loss, train_acc = train_one_epoch(model, train_loader, optimizer, criterion)
        val_loss, val_acc = evaluate(model, val_loader, criterion)
        scheduler.step()
        print(f"Epoch {epoch:02d}/{EPOCHS} | "
              f"Train loss: {train_loss:.4f} acc: {train_acc:.4f} | "
              f"Val loss: {val_loss:.4f} acc: {val_acc:.4f}")
        if val_acc > best_val_acc:
            best_val_acc = val_acc
            torch.save(model.state_dict(), MODELS_DIR / "best_model.pth")
            print(f"  saved best model (val acc: {val_acc:.4f})")

    print(f"\nTraining complete. Best val accuracy: {best_val_acc:.4f}")
    print(f"Model saved to models/best_model.pth")

    print("\nUnfreezing all layers for fine-tuning...")
    for param in model.parameters():
        param.requires_grad = True
    optimizer = torch.optim.Adam(model.parameters(), lr=LEARNING_RATE / 10)

    for epoch in range(1, 6):
        train_loss, train_acc = train_one_epoch(model, train_loader, optimizer, criterion)
        val_loss, val_acc = evaluate(model, val_loader, criterion)
        print(f"Fine-tune {epoch}/5 | "
              f"Train loss: {train_loss:.4f} acc: {train_acc:.4f} | "
              f"Val loss: {val_loss:.4f} acc: {val_acc:.4f}")
        if val_acc > best_val_acc:
            best_val_acc = val_acc
            torch.save(model.state_dict(), MODELS_DIR / "best_model.pth")
            print(f"  saved best model (val acc: {val_acc:.4f})")

    print(f"\nDone! Final best val accuracy: {best_val_acc:.4f}")
    print("Ready to run inference.py")

if __name__ == "__main__":
    train()
