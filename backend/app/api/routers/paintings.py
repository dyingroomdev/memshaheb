from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user_optional, get_db_session, require_roles
from app.models.painting import Painting
from app.models.museum_artifact import MuseumArtifact
from app.models.wc_link import WCLink, WCProductKind, WCSyncState
from app.models.user import User, UserRole
from app.schemas.painting import PaintingCreate, PaintingListResponse, PaintingRead, PaintingUpdate
from app.utils.lqip import generate_lqip
from app.utils.slugify import slugify

router = APIRouter(prefix="/paintings", tags=["paintings"])


def _ensure_unique_slug(db: Session, base_slug: str, exclude_id: Optional[int] = None) -> str:
    slug = slugify(base_slug) or "painting"
    if exclude_id is not None:
        existing = db.execute(
            select(Painting.slug).where(Painting.slug == slug, Painting.id != exclude_id)
        ).scalar_one_or_none()
    else:
        existing = db.execute(select(Painting.slug).where(Painting.slug == slug)).scalar_one_or_none()
    if not existing:
        return slug

    index = 2
    while True:
        candidate = f"{slug}-{index}"
        stmt = select(Painting.id).where(Painting.slug == candidate)
        if exclude_id is not None:
            stmt = stmt.where(Painting.id != exclude_id)
        exists = db.execute(stmt).scalar_one_or_none()
        if not exists:
            return candidate
        index += 1


def _maybe_generate_lqip(image_url: Optional[str]) -> Optional[str]:
    if not image_url:
        return None
    return generate_lqip(image_url)


def _normalize_timestamp(value: Optional[datetime]) -> Optional[datetime]:
    if value is None:
        return None
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc)


def _apply_reader_scope(query, current_user: User | None):
    if current_user is None or current_user.role == UserRole.READER:
        query = query.filter(Painting.published_at.isnot(None))
        query = query.filter(Painting.published_at <= func.now())
    return query


@router.get("", response_model=PaintingListResponse)
def list_paintings(
    query: Optional[str] = Query(None),
    year: Optional[int] = Query(None),
    medium: Optional[str] = Query(None),
    tags: Optional[str] = Query(None),
    cursor: Optional[str] = Query(None),
    limit: int = Query(20, ge=1, le=50),
    db: Session = Depends(get_db_session),
) -> PaintingListResponse:
    stmt = db.query(Painting).order_by(Painting.id.asc())
    # Only show published paintings for public access
    stmt = stmt.filter(Painting.published_at.isnot(None))
    stmt = stmt.filter(Painting.published_at <= func.now())

    if query:
        like_term = f"%{query.lower()}%"
        stmt = stmt.filter(
            func.lower(Painting.title).like(like_term) | func.lower(Painting.description).like(like_term)
        )
    if year is not None:
        stmt = stmt.filter(Painting.year == year)
    if medium:
        stmt = stmt.filter(func.lower(Painting.medium) == medium.lower())
    if tags:
        tag_list = [tag.strip() for tag in tags.split(",") if tag.strip()]
        if tag_list:
            stmt = stmt.filter(Painting.tags.contains(tag_list))

    if cursor:
        try:
            cursor_id = int(cursor)
        except ValueError:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid cursor")
        stmt = stmt.filter(Painting.id > cursor_id)

    items = stmt.limit(limit + 1).all()
    next_cursor = None
    if len(items) > limit:
        next_cursor = str(items[-1].id)
        items = items[:limit]

    return PaintingListResponse(
        items=[PaintingRead.model_validate(item) for item in items],
        next_cursor=next_cursor,
    )


def _get_painting_by_identifier(db: Session, identifier: str, current_user: User | None) -> Painting:
    stmt = db.query(Painting)
    stmt = _apply_reader_scope(stmt, current_user)

    painting = None
    if identifier.isdigit():
        painting = stmt.filter(Painting.id == int(identifier)).first()
    if not painting:
        painting = stmt.filter(Painting.slug == identifier).first()
    if not painting:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Painting not found")
    return painting


@router.get("/admin", response_model=PaintingListResponse)
def list_paintings_admin(
    query: Optional[str] = Query(None),
    year: Optional[int] = Query(None),
    medium: Optional[str] = Query(None),
    tags: Optional[str] = Query(None),
    cursor: Optional[str] = Query(None),
    limit: int = Query(20, ge=1, le=50),
    db: Session = Depends(get_db_session),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.EDITOR)),
) -> PaintingListResponse:
    stmt = db.query(Painting).order_by(Painting.id.desc())
    # Show all paintings including unpublished for admin users

    if query:
        like_term = f"%{query.lower()}%"
        stmt = stmt.filter(
            func.lower(Painting.title).like(like_term) | func.lower(Painting.description).like(like_term)
        )
    if year is not None:
        stmt = stmt.filter(Painting.year == year)
    if medium:
        stmt = stmt.filter(func.lower(Painting.medium) == medium.lower())
    if tags:
        tag_list = [tag.strip() for tag in tags.split(",") if tag.strip()]
        if tag_list:
            stmt = stmt.filter(Painting.tags.contains(tag_list))

    if cursor:
        try:
            cursor_id = int(cursor)
        except ValueError:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid cursor")
        stmt = stmt.filter(Painting.id > cursor_id)

    items = stmt.limit(limit + 1).all()
    next_cursor = None
    if len(items) > limit:
        next_cursor = str(items[-1].id)
        items = items[:limit]

    return PaintingListResponse(
        items=[PaintingRead.model_validate(item) for item in items],
        next_cursor=next_cursor,
    )


@router.get("/{identifier}", response_model=PaintingRead)
def get_painting(
    identifier: str,
    db: Session = Depends(get_db_session),
    current_user: User | None = Depends(get_current_user_optional),
) -> PaintingRead:
    painting = _get_painting_by_identifier(db, identifier, current_user)
    return PaintingRead.model_validate(painting)


@router.post("", response_model=PaintingRead, status_code=status.HTTP_201_CREATED)
def create_painting(
    payload: PaintingCreate,
    db: Session = Depends(get_db_session),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.EDITOR)),
) -> PaintingRead:
    base_slug = payload.slug or payload.title
    if not base_slug:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Title or slug required")
    slug = _ensure_unique_slug(db, base_slug)

    lqip_data = _maybe_generate_lqip(payload.image_url)

    published_at = _normalize_timestamp(payload.published_at) or datetime.now(timezone.utc)

    painting = Painting(
        title=payload.title,
        slug=slug,
        description=payload.description,
        year=payload.year,
        medium=payload.medium,
        dimensions=payload.dimensions,
        image_url=payload.image_url,
        lqip_data=lqip_data,
        tags=payload.tags,
        wc_product_id=payload.wc_product_id,
        is_featured=payload.is_featured,
        published_at=published_at,
        created_by_id=current_user.id,
        updated_by_id=current_user.id,
    )
    db.add(painting)
    db.commit()
    db.refresh(painting)

    return PaintingRead.model_validate(painting)


@router.patch("/{identifier}", response_model=PaintingRead)
def update_painting(
    identifier: str,
    payload: PaintingUpdate,
    db: Session = Depends(get_db_session),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.EDITOR)),
) -> PaintingRead:
    painting = _get_painting_by_identifier(db, identifier, current_user)
    data = payload.model_dump(exclude_unset=True)

    if "title" in data or "slug" in data:
        base_slug = data.get("slug") or data.get("title") or painting.title
        painting.slug = _ensure_unique_slug(db, base_slug, exclude_id=painting.id)

    if "published_at" in data:
        data["published_at"] = _normalize_timestamp(data["published_at"])

    if "image_url" in data and data["image_url"] != painting.image_url:
        painting.lqip_data = _maybe_generate_lqip(data["image_url"])
    elif not painting.image_url and data.get("image_url") is None:
        painting.lqip_data = None

    for field, value in data.items():
        if field in {"slug"}:
            continue
        setattr(painting, field, value)

    painting.updated_by_id = current_user.id

    db.commit()
    db.refresh(painting)
    return PaintingRead.model_validate(painting)


@router.delete("/{identifier}", status_code=status.HTTP_204_NO_CONTENT)
def delete_painting(
    identifier: str,
    db: Session = Depends(get_db_session),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.EDITOR)),
) -> None:
    painting = _get_painting_by_identifier(db, identifier, current_user)
    # Remove linked artifacts first to avoid FK violations when the painting is deleted
    db.query(MuseumArtifact).filter(MuseumArtifact.painting_id == painting.id).delete(synchronize_session=False)
    link = (
        db.query(WCLink)
        .filter(WCLink.kind == WCProductKind.PAINTING)
        .filter(WCLink.local_fk == painting.id)
        .first()
    )
    if link:
        link.local_fk = None
        link.sync_state = WCSyncState.PENDING
        link.notes = "Painting deleted locally"
    db.delete(painting)
    db.commit()
