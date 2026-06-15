from pathlib import Path
from PIL import Image
from torch.utils.data import Dataset, DataLoader, random_split
from torchvision import transforms

DATA_DIR = Path("data")
FOGGY_DIR = DATA_DIR / "foggy"
CLEAR_DIR = DATA_DIR / "clear"

IMG_SIZE = 224

def setup_dirs():
    FOGGY_DIR.mkdir(parents=True, exist_ok=True)
    CLEAR_DIR.mkdir(parents=True, exist_ok=True)
    print(f"Directories ready: {FOGGY_DIR}, {CLEAR_DIR}")

def count_images():
    foggy = list(FOGGY_DIR.glob("*.jpg")) + list(FOGGY_DIR.glob("*.png"))
    clear = list(CLEAR_DIR.glob("*.jpg")) + list(CLEAR_DIR.glob("*.png"))
    print(f"Foggy images: {len(foggy)}")
    print(f"Clear images: {len(clear)}")
    return len(foggy), len(clear)

def get_transforms(training=True):
    if training:
        return transforms.Compose([
            transforms.Resize((IMG_SIZE, IMG_SIZE)),
            transforms.RandomHorizontalFlip(),
            transforms.ColorJitter(brightness=0.3, contrast=0.3, saturation=0.2),
            transforms.RandomRotation(10),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406],
                                 std=[0.229, 0.224, 0.225]),
        ])
    else:
        return transforms.Compose([
            transforms.Resize((IMG_SIZE, IMG_SIZE)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406],
                                 std=[0.229, 0.224, 0.225]),
        ])

class FogDataset(Dataset):
    def __init__(self, training=True):
        self.transform = get_transforms(training)
        self.samples = []

        for img_path in FOGGY_DIR.glob("*.*"):
            if img_path.suffix.lower() in [".jpg", ".jpeg", ".png"]:
                self.samples.append((img_path, 1))

        for img_path in CLEAR_DIR.glob("*.*"):
            if img_path.suffix.lower() in [".jpg", ".jpeg", ".png"]:
                self.samples.append((img_path, 0))

        print(f"Dataset loaded: {len(self.samples)} total images")

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx):
        img_path, label = self.samples[idx]
        image = Image.open(img_path).convert("RGB")
        image = self.transform(image)
        return image, label

def get_dataloaders(val_split=0.2, batch_size=32):
    full_dataset = FogDataset(training=True)

    val_size = int(len(full_dataset) * val_split)
    train_size = len(full_dataset) - val_size

    train_set, val_set = random_split(full_dataset, [train_size, val_size])

    train_loader = DataLoader(train_set, batch_size=batch_size, shuffle=True, num_workers=2)
    val_loader = DataLoader(val_set, batch_size=batch_size, shuffle=False, num_workers=2)

    print(f"Train: {train_size} images | Val: {val_size} images")
    return train_loader, val_loader

if __name__ == "__main__":
    setup_dirs()
    n_foggy, n_clear = count_images()
    else:
        train_loader, val_loader = get_dataloaders()
        images, labels = next(iter(train_loader))
