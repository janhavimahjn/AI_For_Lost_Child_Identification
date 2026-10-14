import logging
import pickle
from pathlib import Path
from typing import Dict, List, Optional, Tuple

import numpy as np
import torch
from facenet_pytorch import InceptionResnetV1, MTCNN

logger = logging.getLogger(__name__)

PKL_PATH = Path(__file__).parent / "models" / "child_embeddings.pkl"

_DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

_CACHED_MTCNN: Optional[MTCNN] = None
_CACHED_RESNET: Optional[InceptionResnetV1] = None

_FACE_DB_INIT_ERROR: Optional[str] = None
_CENTROIDS: Dict[str, np.ndarray] = {}

MIN_SCORE = 0.55
MIN_GAP = 0.08


def _l2_normalize(x: torch.Tensor, eps: float = 1e-10) -> torch.Tensor:
    return x / (torch.norm(x, p=2, dim=-1, keepdim=True) + eps)


def get_device() -> torch.device:
    return _DEVICE


def get_mtcnn() -> MTCNN:
    global _CACHED_MTCNN
    if _CACHED_MTCNN is None:
        _CACHED_MTCNN = MTCNN(
            image_size=160,
            margin=20,
            keep_all=True,
            device=_DEVICE,
        )
    return _CACHED_MTCNN


def get_facenet() -> InceptionResnetV1:
    global _CACHED_RESNET
    if _CACHED_RESNET is None:
        _CACHED_RESNET = InceptionResnetV1(pretrained="vggface2").eval().to(_DEVICE)
    return _CACHED_RESNET


def _load_centroid_pickle() -> Dict[str, np.ndarray]:
    if not PKL_PATH.exists():
        raise RuntimeError(f"Missing child_embeddings.pkl at: {PKL_PATH}")

    data = None
    last_err: Optional[Exception] = None
    try:
        with open(PKL_PATH, "rb") as f:
            data = pickle.load(f)
    except Exception as e:
        last_err = e
        try:
            with open(PKL_PATH, "rb") as f:
                data = pickle.load(f, encoding="latin1")
        except Exception as e2:
            last_err = e2

    if data is None:
        raise RuntimeError(f"Failed to load child_embeddings.pkl: {last_err}")
    if not isinstance(data, dict):
        raise RuntimeError("child_embeddings.pkl must contain a dict{name: centroid_embedding}")

    out: Dict[str, np.ndarray] = {}
    for name, emb in data.items():
        if emb is None:
            continue
        try:
            arr = np.asarray(emb, dtype=np.float32)
        except Exception:
            continue

        # Kaggle-style: list/array of per-image embeddings (N, 512)
        if arr.ndim == 2 and arr.shape[1] == 512 and arr.shape[0] > 0:
            centroid = np.mean(arr, axis=0)
            centroid = centroid / np.linalg.norm(centroid)
            out[str(name)] = centroid.astype(np.float32)
            continue

        # Precomputed centroid (512,)
        vec = arr.reshape(-1)
        if vec.size == 512:
            vec = vec / np.linalg.norm(vec)
        out[str(name)] = vec.astype(np.float32)

    return out


def _build_centroids(face_db: Dict[str, np.ndarray]) -> Dict[str, np.ndarray]:
    centroids: Dict[str, np.ndarray] = {}
    for name, emb in (face_db or {}).items():
        if emb is None:
            continue
        vec = np.asarray(emb, dtype=np.float32).reshape(-1)
        if vec.size != 512:
            continue
        # Already normalized in _load_centroid_pickle, but keep a strict safety normalize.
        vec = vec / np.linalg.norm(vec)
        centroids[str(name)] = vec.astype(np.float32)

    return centroids


def _init_face_db() -> None:
    global _CENTROIDS
    global _FACE_DB_INIT_ERROR

    _CENTROIDS = _build_centroids(_load_centroid_pickle())
    _FACE_DB_INIT_ERROR = None
    logger.info("Loaded child_embeddings.pkl with keys: %s", list(_CENTROIDS.keys()))


_init_face_db()


def get_face_db_init_error() -> Optional[str]:
    return _FACE_DB_INIT_ERROR


def get_embedding_batch(face_tensors: torch.Tensor) -> torch.Tensor:
    """Return L2-normalized 512-D embeddings for a batch of aligned faces.

    face_tensors: (N, 3, 160, 160) float tensor (typically from MTCNN.extract)
    returns: (N, 512) torch tensor on CPU
    """
    if face_tensors is None or not isinstance(face_tensors, torch.Tensor) or face_tensors.numel() == 0:
        return torch.empty((0, 512), dtype=torch.float32)

    if face_tensors.dim() == 3:
        face_tensors = face_tensors.unsqueeze(0)

    model = get_facenet()
    with torch.no_grad():
        emb = model(face_tensors.to(_DEVICE))
        # Kaggle-identical normalization
        emb = emb / torch.norm(emb, dim=1, keepdim=True)
    if isinstance(emb, torch.Tensor):
        try:
            logger.info("Embedding shape: %s", tuple(emb.shape))
        except Exception:
            pass
    return emb.detach().cpu()


def match_embedding(
    emb_512: torch.Tensor,
) -> Tuple[str, float]:
    """Match a single L2-normalized embedding against identity centroids using cosine similarity.

    Mirrors Kaggle logic:
    - cosine similarity = dot product between L2-normalized vectors
    - MIN_SCORE and MIN_GAP decide Unknown
    """

    result = match_embedding_dual(emb_512)
    return str(result["name_strict"]), float(result["score"])


def _confidence_level(score: float) -> str:
    if float(score) >= 0.75:
        return "HIGH"
    if float(score) >= 0.60:
        return "MEDIUM"
    return "LOW"


def match_embedding_dual(emb_512: torch.Tensor) -> Dict[str, object]:
    """Return strict + UI match results for a single embedding.

    Strict mode mirrors Kaggle logic with MIN_SCORE + MIN_GAP.
    UI mode ignores MIN_GAP, and returns TOP-1 if score >= MIN_SCORE.
    """

    if not _CENTROIDS:
        return {
            "name_strict": "Unknown",
            "name_ui": "Unknown",
            "score": 0.0,
            "second_score": 0.0,
            "confidence": "LOW",
        }

    if emb_512 is None or not isinstance(emb_512, torch.Tensor) or emb_512.numel() == 0:
        return {
            "name_strict": "Unknown",
            "name_ui": "Unknown",
            "score": 0.0,
            "second_score": 0.0,
            "confidence": "LOW",
        }

    emb_512 = emb_512.reshape(-1).float()
    if emb_512.numel() != 512:
        return {
            "name_strict": "Unknown",
            "name_ui": "Unknown",
            "score": 0.0,
            "second_score": 0.0,
            "confidence": "LOW",
        }

    emb_np = emb_512.detach().cpu().numpy().astype(np.float32).reshape(-1)
    n = float(np.linalg.norm(emb_np))
    if not np.isfinite(n) or n <= 0:
        return {
            "name_strict": "Unknown",
            "name_ui": "Unknown",
            "score": 0.0,
            "second_score": 0.0,
            "confidence": "LOW",
        }
    emb_np = emb_np / (n + 1e-10)

    scores: List[Tuple[str, float]] = []
    for name, centroid in _CENTROIDS.items():
        c = np.asarray(centroid, dtype=np.float32).reshape(-1)
        if c.size != 512:
            continue
        score = float(np.dot(emb_np, c))
        if not np.isfinite(score):
            score = 0.0
        scores.append((str(name), score))

    scores.sort(key=lambda x: x[1], reverse=True)
    if not scores:
        return {
            "name_strict": "Unknown",
            "name_ui": "Unknown",
            "score": 0.0,
            "second_score": 0.0,
            "confidence": "LOW",
        }

    best_name, best_score = scores[0]
    second_score = scores[1][1] if len(scores) > 1 else 0.0

    try:
        logger.info("Embedding shape: %s", tuple(emb_512.shape))
    except Exception:
        pass
    logger.info("Top scores: %s", scores[:3])
    logger.info("Best score: %s", float(best_score))
    logger.info("Second score: %s", float(second_score))
    logger.info("Matched name: %s", str(best_name))

    name_ui = "Unknown"
    if float(best_score) >= float(MIN_SCORE):
        name_ui = str(best_name)

    name_strict = "Unknown"
    if float(best_score) >= float(MIN_SCORE) and (float(best_score) - float(second_score)) >= float(MIN_GAP):
        name_strict = str(best_name)

    return {
        "name_strict": name_strict,
        "name_ui": name_ui,
        "score": float(best_score),
        "second_score": float(second_score),
        "confidence": _confidence_level(float(best_score)),
    }
