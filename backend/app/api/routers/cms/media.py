import json
from json import JSONDecodeError

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.api.deps import get_db_session, require_roles
from app.core.storage import save_upload
from app.models.media import MediaFile
from app.models.user import User, UserRole
from app.schemas.media import MediaRead, MediaUploadResponse

router = APIRouter(prefix="/media", tags=["media"])


@router.post("", response_model=MediaUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_media(
    file: UploadFile = File(...),
    alt: str | None = Form(None),
    meta: str | None = Form(None),
    db: Session = Depends(get_db_session),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.EDITOR)),
) -> MediaUploadResponse:
    try:
        meta_payload = json.loads(meta) if meta else None
    except JSONDecodeError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid meta JSON")

    storage_result = save_upload(file, owner_id=current_user.id)

    media = MediaFile(
        url=storage_result.url,
        alt=alt,
        meta=meta_payload,
        owner_id=current_user.id,
    )
    db.add(media)
    db.commit()
    db.refresh(media)

    media_read = MediaRead.model_validate(media)
    return MediaUploadResponse(**media_read.model_dump(), signed_url=storage_result.signed_url)


@router.get("", response_model=list[MediaRead])
async def list_media(
    db: Session = Depends(get_db_session),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.EDITOR)),
) -> list[MediaRead]:
    media_files = db.query(MediaFile).filter(MediaFile.owner_id == current_user.id).all()
    return [MediaRead.model_validate(media) for media in media_files]


@router.delete("/{media_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_media(
    media_id: int,
    db: Session = Depends(get_db_session),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.EDITOR)),
) -> None:
    media = db.query(MediaFile).filter(
        MediaFile.id == media_id, MediaFile.owner_id == current_user.id
    ).first()
    if not media:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Media not found")
    
    db.delete(media)
    db.commit()