from typing import Optional
from urllib.parse import urlparse

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_db_session, require_roles
from app.core.config import settings
from app.models.blog_category import BlogCategory
from app.models.home_section import HomeSection, HomeSectionKind
from app.models.user import User, UserRole
from app.schemas.home_section import HomeSectionCreate, HomeSectionRead, HomeSectionUpdate

router = APIRouter(prefix="/home/sections", tags=["home-sections"])


def _normalize_media_url(value: Optional[str]) -> Optional[str]:
    if not value:
        return value
    base = settings.MEDIA_BASE_URL.rstrip("/")
    parsed = urlparse(value)
    if parsed.scheme and parsed.netloc:
        return value
    normalized_path = value.lstrip("/")
    return f"{base}/{normalized_path}"


def _ensure_category(db: Session, category_id: Optional[int]) -> BlogCategory | None:
    if category_id is None:
        return None
    category = db.get(BlogCategory, category_id)
    if not category:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid category_id")
    return category


@router.get("", response_model=list[HomeSectionRead])
def list_sections(db: Session = Depends(get_db_session)) -> list[HomeSectionRead]:
    sections = (
        db.query(HomeSection)
        .filter(HomeSection.enabled.is_(True))
        .order_by(HomeSection.sort_order.asc(), HomeSection.id.asc())
        .all()
    )
    items = []
    for section in sections:
        if section.image_url:
            section.image_url = _normalize_media_url(section.image_url)
        items.append(HomeSectionRead.model_validate(section))
    return items


@router.get("/admin", response_model=list[HomeSectionRead])
def list_sections_admin(
    db: Session = Depends(get_db_session),
    _: User = Depends(require_roles(UserRole.ADMIN, UserRole.EDITOR)),
) -> list[HomeSectionRead]:
    sections = db.query(HomeSection).order_by(HomeSection.sort_order.asc(), HomeSection.id.asc()).all()
    items = []
    for section in sections:
        if section.image_url:
            section.image_url = _normalize_media_url(section.image_url)
        items.append(HomeSectionRead.model_validate(section))
    return items


@router.post("", response_model=HomeSectionRead, status_code=status.HTTP_201_CREATED)
def create_section(
    payload: HomeSectionCreate,
    db: Session = Depends(get_db_session),
    _: User = Depends(require_roles(UserRole.ADMIN, UserRole.EDITOR)),
) -> HomeSectionRead:
    if payload.kind == HomeSectionKind.CATEGORY:
        _ensure_category(db, payload.category_id)
    section = HomeSection(
        kind=payload.kind,
        title=payload.title,
        subtitle=payload.subtitle,
        image_url=_normalize_media_url(payload.image_url),
        target_url=payload.target_url,
        category_id=payload.category_id,
        sort_order=payload.sort_order,
        enabled=payload.enabled,
    )
    db.add(section)
    db.commit()
    db.refresh(section)
    return HomeSectionRead.model_validate(section)


@router.patch("/{section_id}", response_model=HomeSectionRead)
def update_section(
    section_id: int,
    payload: HomeSectionUpdate,
    db: Session = Depends(get_db_session),
    _: User = Depends(require_roles(UserRole.ADMIN, UserRole.EDITOR)),
) -> HomeSectionRead:
    section = db.get(HomeSection, section_id)
    if not section:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Section not found")

    data = payload.model_dump(exclude_unset=True)
    if "kind" in data:
        section.kind = data["kind"]
    if section.kind == HomeSectionKind.CATEGORY:
        if "category_id" in data:
            _ensure_category(db, data["category_id"])
            section.category_id = data["category_id"]
    if "title" in data:
        section.title = data["title"]
    if "subtitle" in data:
        section.subtitle = data["subtitle"]
    if "image_url" in data:
        section.image_url = _normalize_media_url(data["image_url"])
    if "target_url" in data:
        section.target_url = data["target_url"]
    if "sort_order" in data and data["sort_order"] is not None:
        section.sort_order = data["sort_order"]
    if "enabled" in data and data["enabled"] is not None:
        section.enabled = data["enabled"]

    db.commit()
    db.refresh(section)
    return HomeSectionRead.model_validate(section)


@router.delete("/{section_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_section(
    section_id: int,
    db: Session = Depends(get_db_session),
    _: User = Depends(require_roles(UserRole.ADMIN, UserRole.EDITOR)),
) -> None:
    section = db.get(HomeSection, section_id)
    if not section:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Section not found")
    db.delete(section)
    db.commit()
