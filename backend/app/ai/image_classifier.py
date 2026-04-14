import json
import torch
import torch.nn as nn
import torch.nn.functional as F
from PIL import Image
from torchvision import transforms, models
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "cnn_image_classifier.pth"
CLASSES_PATH = BASE_DIR / "class_names.json"

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

with open(CLASSES_PATH, "r") as f:
    class_names = json.load(f)

model = models.resnet18(weights=None)
model.fc = nn.Linear(model.fc.in_features, len(class_names))
model.load_state_dict(torch.load(MODEL_PATH, map_location=device))
model.to(device)
model.eval()

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor()
])

def classify_image(image_path: str):
    image = Image.open(image_path).convert("RGB")
    image_tensor = transform(image).unsqueeze(0).to(device)

    with torch.no_grad():
        outputs = model(image_tensor)
        probs = F.softmax(outputs, dim=1)
        conf, pred = torch.max(probs, 1)

    predicted_class = class_names[pred.item()]
    confidence = float(conf.item())

    if confidence < 0.60:
        predicted_class = "other"

    return {
        "image_category": predicted_class,
        "image_confidence": confidence
    }