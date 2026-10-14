# Lost Child Detection API

This project provides a Python backend API using FastAPI and YOLO for detecting objects in images and videos.

## Project Structure

```
.
├── app/
│   ├── __init__.py
│   ├── main.py             # FastAPI application
│   ├── yolo_service.py     # YOLO model loading and detection logic
│   ├── models/
│   │   └── kids_yolo.pt    # <-- PLACE YOUR YOLO MODEL HERE
│   └── static/
│       └── outputs/
│           ├── images/     # Processed images are saved here
│           └── videos/     # Processed videos are saved here
├── requirements.txt        # Python dependencies
└── README.md
```

## Setup Instructions

### 1. Place Your Model

-   Place your trained YOLO model file (e.g., `best.pt`) inside the `app/models/` directory.
-   Rename the model file to `kids_yolo.pt`.

### 2. Install Dependencies

-   It is recommended to use a virtual environment.

    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
    ```

-   Install the required Python packages:

    ```bash
    pip install -r requirements.txt
    ```

### 3. Run the Server

-   Use `uvicorn` to run the FastAPI application. The `--reload` flag enables hot-reloading for development.

    ```bash
    uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
    ```

-   The API will be available at `http://localhost:8000`.

## API Endpoints

### Health Check

-   **GET** `/api/health`
-   **Description**: Checks if the API is running and if the YOLO model was loaded successfully.
-   **Success Response (200)**:
    ```json
    {
      "status": "ok",
      "yolo_model_loaded": true
    }
    ```

### Image Detection

-   **POST** `/api/detect/image`
-   **Description**: Upload an image for object detection.
-   **Request**: `multipart/form-data` with a single `file` field containing the image.
-   **Success Response (200)**:
    ```json
    {
      "success": true,
      "output_image_url": "http://localhost:8000/static/outputs/images/processed_123.png",
      "meta": {
        "detections": [
          {
            "class_id": 0,
            "class_name": "person",
            "confidence": 0.95,
            "bbox": [100, 150, 200, 400]
          }
        ]
      }
    }
    ```

### Video Detection

-   **POST** `/api/detect/video`
-   **Description**: Upload a video for object detection.
-   **Request**: `multipart/form-data` with a single `file` field containing the video (e.g., MP4, AVI).
-   **Success Response (200)**:
    ```json
    {
      "success": true,
      "output_video_url": "http://localhost:8000/static/outputs/videos/processed_abc.mp4",
      "meta": {
        "total_frames": 200,
        "detections_per_frame": [
          {
            "frame_index": 0,
            "detections": [
              {
                "class_id": 0,
                "class_name": "person",
                "confidence": 0.92,
                "bbox": [110, 155, 210, 405]
              }
            ]
          }
        ]
      }
    }
    ```

## Frontend Integration

-   Ensure your frontend application's origin (e.g., `http://localhost:5173`) is included in the `origins` list in `app/main.py` to avoid CORS errors.
-   On your image upload page, send a `POST` request to `/api/detect/image`. Use the returned `output_image_url` in an `<img>` tag to display the result.
-   On your video upload page, send a `POST` request to `/api/detect/video`. Use the returned `output_video_url` in a `<video>` tag to display the result.
