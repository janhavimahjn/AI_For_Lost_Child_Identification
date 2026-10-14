import base64
import io
import logging
from typing import Dict, List, Optional, Tuple

import torch
from PIL import Image, ImageDraw, ImageFont

from . import face_service

logger = logging.getLogger(__name__)

# ===============================
# MAIN API FUNCTION
# ===============================
def detect_and_recognize_faces_from_bytes(
    image_bytes: bytes,
) -> Tuple[Optional[str], Dict[str, object]]:
    """Returns (base64_png, payload). base64_png is None when no face found or on failure."""

    try:
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    except Exception as e:
        return None, {"success": False, "message": f"Invalid image: {e}"}

    face_db_err = face_service.get_face_db_init_error()
    if face_db_err:
        return None, {
            "success": False,
            "message": f"Face database not initialized (child_embeddings.pkl failed to load): {face_db_err}",
            "faces": [],
            "processed_image_base64": None,
        }

    try:
        mtcnn = face_service.get_mtcnn()
    except Exception as e:
        return None, {"success": False, "message": str(e), "faces": []}

    try:
        boxes, _ = mtcnn.detect(img)
    except Exception as e:
        logger.exception("MTCNN.detect failed")
        return None, {"success": False, "message": f"Face detection failed: {e}", "faces": []}

    if boxes is None or len(boxes) == 0:
        return None, {"success": True, "faces": [], "processed_image_base64": None}

    try:
        face_tensors = mtcnn.extract(img, boxes, None)
    except Exception as e:
        logger.exception("MTCNN.extract failed")
        return None, {"success": False, "message": f"Face extraction failed: {e}", "faces": []}

    if face_tensors is None or not isinstance(face_tensors, torch.Tensor) or face_tensors.numel() == 0:
        return None, {"success": True, "faces": [], "processed_image_base64": None}

    try:
        embeddings = face_service.get_embedding_batch(face_tensors)
    except Exception as e:
        logger.exception("Embedding generation failed")
        return None, {"success": False, "message": f"Face recognition failed: {e}", "faces": []}

    draw = ImageDraw.Draw(img)
    try:
        font = ImageFont.load_default()
    except Exception:
        font = None

    faces_out: List[Dict[str, object]] = []

    for i in range(min(len(boxes), int(embeddings.shape[0]))):
        b = boxes[i]
        if b is None or len(b) != 4:
            continue

        x1, y1, x2, y2 = [int(round(v)) for v in b.tolist()]
        x1 = max(0, x1)
        y1 = max(0, y1)
        x2 = min(img.width - 1, x2)
        y2 = min(img.height - 1, y2)

        match = face_service.match_embedding_dual(embeddings[i])
        name_strict = str(match.get("name_strict") or "Unknown")
        name_ui = str(match.get("name_ui") or "Unknown")
        score = float(match.get("score") or 0.0)
        second_score = float(match.get("second_score") or 0.0)
        confidence = str(match.get("confidence") or "LOW")

        if confidence == "HIGH":
            color = (0, 255, 0)
        elif confidence == "MEDIUM":
            color = (255, 255, 0)
        else:
            color = (255, 0, 0)

        display_name = name_ui
        if name_strict == "Unknown" and name_ui != "Unknown":
            display_name = f"Likely: {name_ui} ({confidence})"
        label = f"{display_name} ({score:.2f})"

        draw.rectangle([x1, y1, x2, y2], outline=color, width=3)
        try:
            draw.text((x1, max(0, y1 - 14)), label, fill=color, font=font)
        except Exception:
            draw.text((x1, max(0, y1 - 14)), label, fill=color)

        faces_out.append(
            {
                "name_strict": name_strict,
                "name_ui": name_ui,
                "score": float(score),
                "second_score": float(second_score),
                "confidence": confidence,
                "bbox": [int(x1), int(y1), int(x2), int(y2)],
            }
        )

    if not faces_out:
        return None, {"success": True, "faces": [], "processed_image_base64": None}

    out_buf = io.BytesIO()
    img.save(out_buf, format="PNG")
    out_b64 = base64.b64encode(out_buf.getvalue()).decode("utf-8")

    return out_b64, {"success": True, "faces": faces_out, "processed_image_base64": out_b64}
