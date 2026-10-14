from __future__ import annotations

import pickle
from pathlib import Path

import numpy as np
import torch
from facenet_pytorch import InceptionResnetV1, MTCNN
from PIL import Image


def main() -> int:
    PROJECT_ROOT = Path(__file__).resolve().parents[1]
    DATASET_DIR = PROJECT_ROOT / "kids final dataset"
    OUTPUT_PKL = PROJECT_ROOT / "app" / "models" / "child_embeddings.pkl"

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    mtcnn = MTCNN(image_size=160, margin=20, keep_all=True, device=device)
    resnet = InceptionResnetV1(pretrained="vggface2").eval().to(device)

    if not DATASET_DIR.exists() or not DATASET_DIR.is_dir():
        raise RuntimeError(f"Dataset directory not found: {DATASET_DIR}")

    allowed_exts = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}

    out: dict[str, np.ndarray] = {}

    child_dirs = [p for p in sorted(DATASET_DIR.iterdir()) if p.is_dir()]
    if not child_dirs:
        raise RuntimeError(f"No child folders found in: {DATASET_DIR}")

    for child_dir in child_dirs:
        child_name = child_dir.name
        embeddings: list[np.ndarray] = []
        images_used = 0

        image_files = [
            p
            for p in sorted(child_dir.rglob("*"))
            if p.is_file() and p.suffix.lower() in allowed_exts
        ]

        for img_path in image_files:
            try:
                img = Image.open(img_path).convert("RGB")
            except Exception:
                continue

            boxes, _ = mtcnn.detect(img)
            if boxes is None or len(boxes) == 0:
                continue

            faces = mtcnn.extract(img, boxes, save_path=None)
            if faces is None or not isinstance(faces, torch.Tensor) or faces.numel() == 0:
                continue

            with torch.no_grad():
                emb = resnet(faces.to(device))
                emb = emb / torch.norm(emb, dim=1, keepdim=True)

            emb_np = emb.detach().cpu().numpy().astype(np.float32)
            if emb_np.ndim != 2 or emb_np.shape[1] != 512:
                continue

            for i in range(emb_np.shape[0]):
                v = emb_np[i].reshape(-1)
                n = float(np.linalg.norm(v))
                if not np.isfinite(n) or n <= 0:
                    continue
                v = (v / n).astype(np.float32)
                embeddings.append(v)

            images_used += 1

        if not embeddings:
            print(f"{child_name} → images=0 → centroid shape=None → norm=0.000")
            continue

        mat = np.stack(embeddings, axis=0).astype(np.float32)
        centroid = np.mean(mat, axis=0)
        centroid = centroid / np.linalg.norm(centroid)
        centroid = centroid.astype(np.float32).reshape(512,)

        out[child_name] = centroid

        norm_val = float(np.linalg.norm(centroid))
        print(
            f"{child_name} → images={images_used} → centroid shape={centroid.shape} → norm={norm_val:.3f}"
        )

    OUTPUT_PKL.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_PKL, "wb") as f:
        pickle.dump(out, f, protocol=pickle.HIGHEST_PROTOCOL)

    print("Saved child_embeddings.pkl")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
