import os
import re
from pathlib import Path
from typing import List, Dict, Any

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from PIL import Image
from sqlalchemy.orm import Session

from app.api.deps import get_db_session, require_roles
from app.core.config import settings
from app.models.media import MediaFile
from app.models.user import User, UserRole
from app.schemas.media import MediaFileRead

router = APIRouter(prefix="/media", tags=["media"])

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB


def _ensure_media_dir():
    """Ensure media directory exists"""
    media_dir = settings.MEDIA_LOCAL_ROOT
    media_dir.mkdir(parents=True, exist_ok=True)
    return media_dir


def _process_image(file_path: Path, max_width: int = 1920, quality: int = 85) -> Path:
    """Resize if needed, keep original format and transparency."""
    if file_path.suffix.lower() == '.svg':
        return file_path
    try:
        with Image.open(file_path) as img:
            if img.width > max_width:
                ratio = max_width / img.width
                new_height = int(img.height * ratio)
                img = img.resize((max_width, new_height), Image.Resampling.LANCZOS)

            save_kwargs = {}
            fmt = img.format or file_path.suffix.replace('.', '').upper()
            if fmt in ("JPG", "JPEG"):
                save_kwargs = {"quality": quality, "optimize": True}
            elif fmt == "PNG":
                save_kwargs = {"optimize": True}

            img.save(file_path, format=fmt, **save_kwargs)
        return file_path
    except Exception:
        return file_path


def _collect_metadata(
    *,
    original_filename: str,
    stored_filename: str,
    content_length: int,
    mime_type: str | None,
) -> Dict[str, Any]:
    return {
        "original_filename": original_filename,
        "stored_filename": stored_filename,
        "file_size": content_length,
        "mime_type": mime_type or "application/octet-stream",
    }


def _serialize_media(media: MediaFile) -> MediaFileRead:
    meta = media.meta or {}
    filename = meta.get("original_filename") or meta.get("stored_filename") or Path(media.url).name
    return MediaFileRead(
        id=media.id,
        filename=filename,
        file_url=media.url,
        file_size=meta.get("file_size"),
        mime_type=meta.get("mime_type"),
        created_at=media.created_at,
    )


def _sanitize_filename(filename: str) -> str:
    name = Path(filename).name  # drop any path
    # replace spaces with underscores and strip invalid chars
    name = re.sub(r"[^A-Za-z0-9._-]+", "_", name)
    return name or f"upload{Path(filename).suffix or ''}"


@router.post("/upload", response_model=MediaFileRead)
async def upload_file(
    file: UploadFile = File(...),
    resize: bool = True,
    db: Session = Depends(get_db_session),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.EDITOR)),
) -> MediaFileRead:
    """Upload and process media file into the local media folder."""

    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")

    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"File type {file_ext} not allowed. Allowed: {', '.join(sorted(ALLOWED_EXTENSIONS))}",
        )

    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large (max 10MB)")

    media_dir = _ensure_media_dir()
    safe_filename = _sanitize_filename(file.filename)
    file_path = media_dir / safe_filename
    counter = 1
    while file_path.exists():
        file_path = media_dir / f"{file_path.stem}-{counter}{file_path.suffix}"
        counter += 1

    with open(file_path, "wb") as destination:
        destination.write(content)

    if resize and file_ext in {".jpg", ".jpeg", ".png", ".gif", ".webp"}:
        file_path = _process_image(file_path)
        safe_filename = file_path.name

    file_url = f"{settings.MEDIA_BASE_URL.rstrip('/')}/{safe_filename}"

    metadata = _collect_metadata(
        original_filename=file.filename,
        stored_filename=safe_filename,
        content_length=file_path.stat().st_size,
        mime_type=file.content_type,
    )

    media_file = MediaFile(
        url=file_url,
        alt=None,
        meta=metadata,
        owner_id=current_user.id,
    )

    db.add(media_file)
    db.commit()
    db.refresh(media_file)

    return _serialize_media(media_file)


@router.get("", response_model=List[MediaFileRead])
def list_media_files(
    limit: int = 50,
    db: Session = Depends(get_db_session),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.EDITOR)),
) -> List[MediaFileRead]:
    """List uploaded media files"""
    files = db.query(MediaFile).order_by(MediaFile.created_at.desc()).limit(limit).all()
    return [_serialize_media(f) for f in files]


@router.delete("/{file_id}")
def delete_media_file(
    file_id: int,
    db: Session = Depends(get_db_session),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.EDITOR)),
):
    """Delete media file"""
    media_file = db.get(MediaFile, file_id)
    if not media_file:
        raise HTTPException(status_code=404, detail="File not found")

    stored_filename = None
    if media_file.meta:
        stored_filename = media_file.meta.get("stored_filename")

    if stored_filename:
        file_path = _ensure_media_dir() / stored_filename
        if file_path.exists():
            file_path.unlink()

    db.delete(media_file)
    db.commit()

    return {"message": "File deleted successfully"}
