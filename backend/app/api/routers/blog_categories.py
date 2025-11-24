from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_db_session, require_roles
from app.models.blog_category import BlogCategory
from app.models.user import User, UserRole
from app.schemas.blog import BlogCategoryCreate, BlogCategoryRead, BlogCategoryUpdate
from app.utils.slugify import slugify

router = APIRouter(prefix="/blog-categories", tags=["blog-categories"])


def _ensure_unique_slug(db: Session, base_slug: str, exclude_id: Optional[int] = None) -> str:
    slug = slugify(base_slug) or "category"
    stmt = select(BlogCategory.id).where(BlogCategory.slug == slug)
    if exclude_id is not None:
        stmt = stmt.where(BlogCategory.id != exclude_id)
    exists = db.execute(stmt).scalar_one_or_none()
    if not exists:
        return slug

    index = 2
    while True:
        candidate = f"{slug}-{index}"
        stmt = select(BlogCategory.id).where(BlogCategory.slug == candidate)
        if exclude_id is not None:
            stmt = stmt.where(BlogCategory.id != exclude_id)
        exists = db.execute(stmt).scalar_one_or_none()
        if not exists:
            return candidate
        index += 1


@router.get("", response_model=list[BlogCategoryRead])
def list_categories(
    query: Optional[str] = Query(None, description="Filter by name"),
    db: Session = Depends(get_db_session),
) -> list[BlogCategoryRead]:
    stmt = db.query(BlogCategory).order_by(BlogCategory.name.asc())
    if query:
        like_term = f"%{query.lower()}%"
        stmt = stmt.filter(BlogCategory.name.ilike(like_term))
    items = stmt.all()
    return [BlogCategoryRead.model_validate(item) for item in items]


@router.post("", response_model=BlogCategoryRead, status_code=status.HTTP_201_CREATED)
def create_category(
    payload: BlogCategoryCreate,
    db: Session = Depends(get_db_session),
    _: User = Depends(require_roles(UserRole.ADMIN, UserRole.EDITOR)),
) -> BlogCategoryRead:
    base_slug = payload.slug or payload.name
    if not base_slug:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Name or slug required")
    slug = _ensure_unique_slug(db, base_slug)
    category = BlogCategory(name=payload.name, slug=slug, description=payload.description)
    db.add(category)
    db.commit()
    db.refresh(category)
    return BlogCategoryRead.model_validate(category)


@router.patch("/{category_id}", response_model=BlogCategoryRead)
def update_category(
    category_id: int,
    payload: BlogCategoryUpdate,
    db: Session = Depends(get_db_session),
    _: User = Depends(require_roles(UserRole.ADMIN, UserRole.EDITOR)),
) -> BlogCategoryRead:
    category = db.get(BlogCategory, category_id)
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")

    data = payload.model_dump(exclude_unset=True)
    if "name" in data:
        category.name = data["name"]
    if "slug" in data and data["slug"]:
        category.slug = _ensure_unique_slug(db, data["slug"], exclude_id=category.id)
    elif "name" in data and not data.get("slug"):
        category.slug = _ensure_unique_slug(db, data["name"], exclude_id=category.id)

    if "description" in data:
        category.description = data["description"]

    db.commit()
    db.refresh(category)
    return BlogCategoryRead.model_validate(category)


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(
    category_id: int,
    db: Session = Depends(get_db_session),
    _: User = Depends(require_roles(UserRole.ADMIN, UserRole.EDITOR)),
) -> None:
    category = db.get(BlogCategory, category_id)
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    db.delete(category)
    db.commit()
