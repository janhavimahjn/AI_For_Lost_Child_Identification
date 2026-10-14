import logging
import shutil
import tempfile
from pathlib import Path
import math
import numpy as np
import json
from fastapi import FastAPI, UploadFile, File, HTTPException, Request
from fastapi.encoders import jsonable_encoder
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from . import image_face_service
from . import video_face_service

# --- Basic Configuration ---
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- FastAPI App Initialization ---
app = FastAPI(title="Face Recognition API")

# --- CORS Configuration ---
origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    # Add your frontend domain here when you deploy
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Static File Serving ---
BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR / "static"
OUTPUT_IMAGES_DIR = STATIC_DIR / "outputs" / "images"
OUTPUT_VIDEOS_DIR = STATIC_DIR / "outputs" / "videos"

# Create output directories if they don't exist
OUTPUT_IMAGES_DIR.mkdir(parents=True, exist_ok=True)
OUTPUT_VIDEOS_DIR.mkdir(parents=True, exist_ok=True)

# Mount the static directory to serve files
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

# --- API Endpoints ---

@app.get("/api/health")
def health():
    """Health check endpoint."""
    return {"status": "ok"}


@app.get("/api/outputs/videos/{filename}")
def get_output_video(filename: str):
    if not filename or "/" in filename or "\\" in filename:
        raise HTTPException(status_code=400, detail="Invalid filename")

    video_path = OUTPUT_VIDEOS_DIR / filename
    if not video_path.exists() or not video_path.is_file():
        raise HTTPException(status_code=404, detail="Video not found")

    return FileResponse(
        path=str(video_path),
        media_type="video/mp4",
        headers={"Content-Disposition": f"inline; filename=\"{video_path.name}\""},
    )

@app.post("/face/recognize/image")
async def recognize_face_image(file: UploadFile = File(...)):
    def _sanitize_for_json(obj):
        if isinstance(obj, (float, np.floating)):
            val = float(obj)
            return val if math.isfinite(val) else None
        if isinstance(obj, (int, np.integer)):
            return int(obj)
        if isinstance(obj, np.ndarray):
            return _sanitize_for_json(obj.tolist())
        if isinstance(obj, set):
            return _sanitize_for_json(list(obj))
        if isinstance(obj, dict):
            return {k: _sanitize_for_json(v) for k, v in obj.items()}
        if isinstance(obj, list):
            return [_sanitize_for_json(v) for v in obj]
        if isinstance(obj, tuple):
            return [_sanitize_for_json(v) for v in obj]
        return obj

    def _safe_json_response(payload):
        encoded = jsonable_encoder(payload)
        encoded = _sanitize_for_json(encoded)
        try:
            json.dumps(encoded, allow_nan=False)
        except ValueError:
            encoded = {"success": False, "message": "Response contained non-JSON-compliant values."}
        return JSONResponse(content=encoded, status_code=200)

    if not (file.content_type or "").startswith("image/"):
        return _safe_json_response({"success": False, "message": "Invalid file type. Please upload an image."})

    try:
        image_bytes = await file.read()
    except Exception as e:
        return _safe_json_response({"success": False, "message": f"Failed to read uploaded file: {e}"})
    finally:
        try:
            file.file.close()
        except Exception:
            pass

    try:
        processed_b64, payload = image_face_service.detect_and_recognize_faces_from_bytes(image_bytes)
        if isinstance(payload, dict):
            payload.setdefault("processed_image_base64", processed_b64)
        return _safe_json_response(payload)
    except Exception as e:
        logger.exception("Error during image-face detection")
        return _safe_json_response({"success": False, "message": f"Image face detection failed: {e}"})


@app.post("/api/detect/image-face")
async def detect_image_face(file: UploadFile = File(...)):
    return await recognize_face_image(file)


@app.post("/api/detect/image")
async def detect_image_compat(file: UploadFile = File(...)):
    return await recognize_face_image(file)


@app.post("/face/recognize/video")
async def recognize_face_video(request: Request, file: UploadFile = File(...)):
    content_type = (file.content_type or "").lower()
    suffix = Path(file.filename or "").suffix.lower()
    is_video = content_type.startswith("video/")
    is_octet_stream = content_type in {"application/octet-stream", "binary/octet-stream"}
    is_video_ext = suffix in {".mp4", ".mov", ".avi", ".mkv", ".webm", ".m4v"}
    if not (is_video or (is_octet_stream and is_video_ext)):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Expected a video. content_type={file.content_type}, filename={file.filename}",
        )

    tmp_path = None
    try:
        logger.info("Video upload received: filename=%s content_type=%s", file.filename, file.content_type)
        with tempfile.NamedTemporaryFile(delete=False, suffix=Path(file.filename).suffix) as tmp_file:
            shutil.copyfileobj(file.file, tmp_file)
            tmp_path = Path(tmp_file.name)

        logger.info("Saved uploaded video to temp path: %s", str(tmp_path))

        meta, out_path = video_face_service.recognize_video(
            tmp_path,
            output_dir=OUTPUT_VIDEOS_DIR,
        )

        logger.info("Video processing complete. Output: %s", str(out_path))

        base_url = str(request.base_url).rstrip("/")
        output_url = f"{base_url}/api/outputs/videos/{out_path.name}"

        return {"success": True, "output_video_url": output_url, "meta": meta}
    except Exception as e:
        logger.exception("Error during video face recognition")
        raise HTTPException(status_code=500, detail=f"Video face recognition failed: {e}")
    finally:
        if tmp_path is not None and isinstance(tmp_path, Path) and tmp_path.exists():
            try:
                tmp_path.unlink()
            except Exception:
                pass
        try:
            file.file.close()
        except Exception:
            pass


@app.post("/api/detect/video-face")
async def detect_video_face(request: Request, file: UploadFile = File(...)):
    return await recognize_face_video(request, file)


@app.post("/api/detect/video")
async def detect_video_compat(request: Request, file: UploadFile = File(...)):
    return await recognize_face_video(request, file)

if __name__ == "__main__":
    import uvicorn
    # This block allows running the app directly for development
    # Use the command 'uvicorn app.main:app --reload' for production-like Gunicorn/Uvicorn setup
    uvicorn.run(app, host="0.0.0.0", port=8000)
