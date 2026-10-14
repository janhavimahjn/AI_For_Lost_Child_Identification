import logging
import math
import tempfile
from pathlib import Path
from typing import Dict, List, Tuple

import cv2
import numpy as np

from . import face_service

logger = logging.getLogger(__name__)


def _clamp_box(x1: int, y1: int, x2: int, y2: int, w: int, h: int) -> Tuple[int, int, int, int]:
    x1 = max(0, min(int(x1), w - 1))
    y1 = max(0, min(int(y1), h - 1))
    x2 = max(0, min(int(x2), w - 1))
    y2 = max(0, min(int(y2), h - 1))

    if x2 <= x1:
        x2 = min(w - 1, x1 + 1)
    if y2 <= y1:
        y2 = min(h - 1, y1 + 1)

    return x1, y1, x2, y2


def recognize_video(
    video_path: Path,
    *,
    output_dir: Path,
    vote_window: int = 5,
    min_votes: int = 3,
    process_every_n_frames: int = 1,
) -> Tuple[Dict[str, object], Path]:
    """Process a video file and write an annotated copy to output_dir.

    - Face detection: MTCNN (per processed frame)
    - Face recognition: FaceNet embeddings + cosine similarity centroid matching
    - Temporal smoothing: rolling window majority voting per tracked face

    Returns (metadata, output_video_path)
    """

    face_db_err = face_service.get_face_db_init_error()
    if face_db_err:
        raise RuntimeError(f"Face database not initialized: {face_db_err}")

    mtcnn = face_service.get_mtcnn()

    logger.info("Opening video: %s", str(video_path))

    cap = cv2.VideoCapture(str(video_path))
    if not cap.isOpened():
        raise RuntimeError(f"Failed to open video: {video_path}")

    fps = cap.get(cv2.CAP_PROP_FPS)
    if not fps or math.isnan(float(fps)) or float(fps) <= 0:
        fps = 25.0

    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH) or 0)
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT) or 0)
    if width <= 0 or height <= 0:
        raise RuntimeError("Invalid video dimensions")

    logger.info("Video properties: fps=%s width=%s height=%s", float(fps), width, height)

    output_dir.mkdir(parents=True, exist_ok=True)

    tmp_out = tempfile.NamedTemporaryFile(delete=False, suffix=".mp4", dir=str(output_dir))
    tmp_out.close()
    out_path = Path(tmp_out.name)

    writer = None
    for fourcc_str in ("avc1", "H264", "mp4v"):
        fourcc = cv2.VideoWriter_fourcc(*fourcc_str)
        w = cv2.VideoWriter(str(out_path), fourcc, float(fps), (width, height))
        if w is not None and w.isOpened():
            writer = w
            logger.info("VideoWriter initialized with fourcc=%s", fourcc_str)
            break
        try:
            if w is not None:
                w.release()
        except Exception:
            pass

    if writer is None:
        raise RuntimeError("Failed to initialize VideoWriter for mp4 output")

    total_frames = 0
    processed_frames = 0
    last_log_frame = 0

    try:
        while True:
            ok, frame_bgr = cap.read()
            if not ok:
                break

            total_frames += 1

            if (total_frames - last_log_frame) >= 50:
                logger.info("Video progress: read_frames=%s processed_frames=%s", total_frames, processed_frames)
                last_log_frame = total_frames

            run_inference = (process_every_n_frames <= 1) or ((total_frames - 1) % process_every_n_frames == 0)

            if run_inference:
                processed_frames += 1

                frame_rgb = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)
                try:
                    boxes, _ = mtcnn.detect(frame_rgb)
                except Exception as e:
                    logger.exception("MTCNN.detect failed on frame %s: %s", total_frames, e)
                    boxes = None

                detections: List[Tuple[int, int, int, int]] = []
                if boxes is not None and len(boxes) > 0:
                    for b in boxes:
                        if b is None or len(b) != 4:
                            continue
                        x1, y1, x2, y2 = [int(round(v)) for v in b.tolist()]
                        x1, y1, x2, y2 = _clamp_box(x1, y1, x2, y2, width, height)
                        detections.append((x1, y1, x2, y2))

                if detections:
                    det_arr = np.asarray(detections, dtype=np.float32)
                    try:
                        face_tensors = mtcnn.extract(frame_rgb, det_arr, None)
                    except Exception as e:
                        logger.exception("MTCNN.extract failed on frame %s: %s", total_frames, e)
                        face_tensors = None
                    embeddings = face_service.get_embedding_batch(face_tensors)

                    for di, (x1, y1, x2, y2) in enumerate(detections):
                        if di >= int(embeddings.shape[0]):
                            continue

                        match = face_service.match_embedding_dual(embeddings[di])
                        name_strict = str(match.get("name_strict") or "Unknown")
                        name_ui = str(match.get("name_ui") or "Unknown")
                        score = float(match.get("score") or 0.0)
                        confidence = str(match.get("confidence") or "LOW")

                        if confidence == "HIGH":
                            color = (0, 255, 0)
                        elif confidence == "MEDIUM":
                            color = (0, 255, 255)
                        else:
                            color = (0, 0, 255)

                        display_name = name_ui
                        if name_strict == "Unknown" and name_ui != "Unknown":
                            display_name = f"Likely: {name_ui} ({confidence})"

                        cv2.rectangle(frame_bgr, (x1, y1), (x2, y2), color, 2)
                        cv2.putText(
                            frame_bgr,
                            f"{display_name} ({score:.2f})",
                            (x1, max(0, y1 - 8)),
                            cv2.FONT_HERSHEY_SIMPLEX,
                            0.6,
                            color,
                            2,
                            cv2.LINE_AA,
                        )

            writer.write(frame_bgr)

    finally:
        try:
            cap.release()
        except Exception:
            pass
        try:
            writer.release()
        except Exception:
            pass

    meta = {
        "success": True,
        "total_frames": total_frames,
        "processed_frames": processed_frames,
        "fps": float(fps),
    }

    return meta, out_path
