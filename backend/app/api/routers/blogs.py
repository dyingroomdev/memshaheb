from typing import Optional
from urllib.parse import urlparse

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user_optional, get_db_session, require_roles
from app.core.config import settings
from app.models.blog_category import BlogCategory
from app.models.blog import BlogPost
from app.models.user import User, UserRole
from app.schemas.blog import BlogCreate, BlogListResponse, BlogRead, BlogUpdate
from app.utils.slugify import slugify

router = APIRouter(prefix="/blogs", tags=["blogs"])


def _ensure_unique_slug(db: Session, base_slug: str, exclude_id: Optional[int] = None) -> str:
    slug = slugify(base_slug) or "post"
    stmt = select(BlogPost.id).where(BlogPost.slug == slug)
    if exclude_id is not None:
        stmt = stmt.where(BlogPost.id != exclude_id)
    exists = db.execute(stmt).scalar_one_or_none()
    if not exists:
        return slug

    index = 2
    while True:
        candidate = f"{slug}-{index}"
        stmt = select(BlogPost.id).where(BlogPost.slug == candidate)
        if exclude_id is not None:
            stmt = stmt.where(BlogPost.id != exclude_id)
        exists = db.execute(stmt).scalar_one_or_none()
        if not exists:
            return candidate
        index += 1


def _generate_excerpt(content: str, max_length: int = 240) -> str:
    text = content.strip()
    # crude markdown stripping
    for token in ("#", "*", "_", "`", ">"):
        text = text.replace(token, "")
    text = " ".join(text.split())
    if len(text) <= max_length:
        return text
    return text[: max_length - 1].rstrip() + "…"


def _normalize_media_url(value: Optional[str]) -> Optional[str]:
    if not value:
        return value

    base = settings.MEDIA_BASE_URL.rstrip("/")
    base_parsed = urlparse(base)
    base_path = base_parsed.path.strip("/")

    def _combine(path: str) -> str:
        normalized = path.lstrip("/")
        if base_path and normalized.startswith(f"{base_path}/"):
            normalized = normalized[len(base_path) + 1 :]
        if base_path and normalized == base_path:
            normalized = ""
        if normalized:
            return f"{base}/{normalized}"
        return base

    parsed = urlparse(value)

    if parsed.scheme and parsed.netloc:
        if parsed.netloc == base_parsed.netloc and parsed.scheme == base_parsed.scheme:
            return _combine(parsed.path)
        return _combine(parsed.path)

    return _combine(parsed.path or value)


def _normalize_blog(blog: BlogPost) -> BlogPost:
    normalized_cover = _normalize_media_url(blog.cover_url)
    normalized_og = _normalize_media_url(blog.og_image_url)
    if normalized_cover != blog.cover_url:
        blog.cover_url = normalized_cover
    if normalized_og != blog.og_image_url:
        blog.og_image_url = normalized_og
    return blog


def _apply_reader_scope(query, current_user: User | None):
    if current_user is None or current_user.role == UserRole.READER:
        query = query.filter(BlogPost.published_at.isnot(None))
        query = query.filter(BlogPost.published_at <= func.now())
    return query


def _resolve_category_filter(db: Session, identifier: str) -> BlogCategory:
    stmt = db.query(BlogCategory)
    if identifier.isdigit():
        category = stmt.filter(BlogCategory.id == int(identifier)).first()
    else:
        category = stmt.filter(BlogCategory.slug == identifier).first()
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    return category


def _ensure_category_relation(db: Session, category_id: Optional[int]) -> BlogCategory | None:
    if category_id is None:
        return None
    category = db.get(BlogCategory, int(category_id))
    if not category:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid category")
    return category


def _enforce_author_scope(blog: BlogPost, current_user: User):
    if current_user.role == UserRole.AUTHOR:
        owner_id = blog.author_id or blog.created_by_id
        if owner_id and owner_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Authors can only modify their posts")


@router.get("", response_model=BlogListResponse)
def list_blogs(
    query: Optional[str] = Query(None),
    tags: Optional[str] = Query(None),
    category: Optional[str] = Query(None, description="Category slug or id"),
    cursor: Optional[str] = Query(None),
    limit: int = Query(20, ge=1, le=50),
    db: Session = Depends(get_db_session),
) -> BlogListResponse:
    stmt = db.query(BlogPost).order_by(BlogPost.id.desc())
    # Only show published blogs for public access
    stmt = stmt.filter(BlogPost.published_at.isnot(None))
    stmt = stmt.filter(BlogPost.published_at <= func.now())

    if query:
        like_term = f"%{query.lower()}%"
        stmt = stmt.filter(
            func.lower(BlogPost.title).like(like_term)
            | func.lower(BlogPost.content_md).like(like_term)
            | func.lower(func.coalesce(BlogPost.excerpt, "")).like(like_term)
        )

    if tags:
        tag_list = [tag.strip() for tag in tags.split(",") if tag.strip()]
        if tag_list:
            stmt = stmt.filter(BlogPost.tags.contains(tag_list))

    if category:
        category_obj = _resolve_category_filter(db, category)
        stmt = stmt.filter(BlogPost.category_id == category_obj.id)

    if cursor:
        try:
            cursor_id = int(cursor)
        except ValueError:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid cursor")
        stmt = stmt.filter(BlogPost.id > cursor_id)

    items = stmt.limit(limit + 1).all()
    next_cursor = None
    if len(items) > limit:
        next_cursor = str(items[-1].id)
        items = items[:limit]

    normalized_items = [_normalize_blog(item) for item in items]

    return BlogListResponse(
        items=[BlogRead.model_validate(item) for item in normalized_items],
        next_cursor=next_cursor,
    )


def _get_blog_by_identifier(db: Session, identifier: str, current_user: User | None) -> BlogPost:
    stmt = db.query(BlogPost)
    stmt = _apply_reader_scope(stmt, current_user)

    blog = None
    if identifier.isdigit():
        blog = stmt.filter(BlogPost.id == int(identifier)).first()
    if not blog:
        blog = stmt.filter(BlogPost.slug == identifier).first()
    if not blog:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Blog post not found")
    return blog


@router.get("/admin", response_model=BlogListResponse)
def list_blogs_admin(
    query: Optional[str] = Query(None),
    tags: Optional[str] = Query(None),
    category: Optional[str] = Query(None, description="Category slug or id"),
    cursor: Optional[str] = Query(None),
    limit: int = Query(20, ge=1, le=50),
    db: Session = Depends(get_db_session),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.EDITOR, UserRole.AUTHOR)),
) -> BlogListResponse:
    stmt = db.query(BlogPost).order_by(BlogPost.id.desc())
    # Show all blogs including drafts for admin users
    
    if query:
        like_term = f"%{query.lower()}%"
        stmt = stmt.filter(
            func.lower(BlogPost.title).like(like_term)
            | func.lower(BlogPost.content_md).like(like_term)
            | func.lower(func.coalesce(BlogPost.excerpt, "")).like(like_term)
        )

    if tags:
        tag_list = [tag.strip() for tag in tags.split(",") if tag.strip()]
        if tag_list:
            stmt = stmt.filter(BlogPost.tags.contains(tag_list))

    if category:
        category_obj = _resolve_category_filter(db, category)
        stmt = stmt.filter(BlogPost.category_id == category_obj.id)

    if cursor:
        try:
            cursor_id = int(cursor)
        except ValueError:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid cursor")
        stmt = stmt.filter(BlogPost.id > cursor_id)

    items = stmt.limit(limit + 1).all()
    next_cursor = None
    if len(items) > limit:
        next_cursor = str(items[-1].id)
        items = items[:limit]

    normalized_items = [_normalize_blog(item) for item in items]

    return BlogListResponse(
        items=[BlogRead.model_validate(item) for item in normalized_items],
        next_cursor=next_cursor,
    )


@router.get("/preview/{blog_id}", response_model=BlogRead)
def preview_blog(
    blog_id: int,
    db: Session = Depends(get_db_session),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.EDITOR, UserRole.AUTHOR)),
) -> BlogRead:
    blog = db.get(BlogPost, blog_id)
    if not blog:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Blog post not found")
    blog = _normalize_blog(blog)
    return BlogRead.model_validate(blog)


@router.get("/{identifier}", response_model=BlogRead)
def get_blog(
    identifier: str,
    db: Session = Depends(get_db_session),
    current_user: User | None = Depends(get_current_user_optional),
) -> BlogRead:
    blog = _get_blog_by_identifier(db, identifier, current_user)
    blog = _normalize_blog(blog)
    return BlogRead.model_validate(blog)


@router.post("", response_model=BlogRead, status_code=status.HTTP_201_CREATED)
def create_blog(
    payload: BlogCreate,
    db: Session = Depends(get_db_session),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.EDITOR, UserRole.AUTHOR)),
) -> BlogRead:
    base_slug = payload.slug or payload.title
    if not base_slug:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Title or slug required")
    slug = _ensure_unique_slug(db, base_slug)

    excerpt = payload.excerpt.strip() if payload.excerpt else ""
    if not excerpt:
        excerpt = _generate_excerpt(payload.content_md)

    category = _ensure_category_relation(db, payload.category_id)

    if current_user.role == UserRole.AUTHOR:
        if payload.author_id and payload.author_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Authors can only set themselves")
        author_id = current_user.id
    else:
        author_id = payload.author_id or current_user.id

    blog = BlogPost(
        title=payload.title,
        slug=slug,
        content_md=payload.content_md,
        cover_url=_normalize_media_url(payload.cover_url),
        tags=payload.tags,
        excerpt=excerpt,
        published_at=payload.published_at,
        category_id=category.id if category else None,
        author_id=author_id,
        meta_title=payload.meta_title or payload.title,
        meta_description=payload.meta_description or excerpt,
        canonical_url=payload.canonical_url,
        og_image_url=_normalize_media_url(payload.og_image_url or payload.cover_url),
        created_by_id=current_user.id,
        updated_by_id=current_user.id,
    )
    db.add(blog)
    db.commit()
    db.refresh(blog)
    return BlogRead.model_validate(blog)


@router.patch("/{blog_id}", response_model=BlogRead)
def update_blog(
    blog_id: int,
    payload: BlogUpdate,
    db: Session = Depends(get_db_session),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.EDITOR, UserRole.AUTHOR)),
) -> BlogRead:
    blog = db.get(BlogPost, blog_id)
    if not blog:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Blog post not found")
    _enforce_author_scope(blog, current_user)

    data = payload.model_dump(exclude_unset=True)
    fields_set = payload.model_fields_set

    if "title" in data or "slug" in data:
        base_slug = data.get("slug") or data.get("title") or blog.title
        blog.slug = _ensure_unique_slug(db, base_slug, exclude_id=blog.id)

    if "content_md" in data:
        blog.content_md = data["content_md"]

    if "cover_url" in data:
        blog.cover_url = _normalize_media_url(data["cover_url"])
    if "tags" in data:
        blog.tags = data["tags"]
    if "published_at" in data:
        blog.published_at = data["published_at"]
    if "category_id" in fields_set:
        raw_cat = data.get("category_id", None)
        if raw_cat is None:
            blog.category_id = None
        else:
            category = _ensure_category_relation(db, raw_cat)
            blog.category_id = category.id
    if "author_id" in data:
        if current_user.role == UserRole.AUTHOR and data["author_id"] != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Authors can only set themselves")
        blog.author_id = data["author_id"]
    if "meta_title" in data:
        blog.meta_title = data["meta_title"]
    if "meta_description" in data:
        blog.meta_description = data["meta_description"]
    if "canonical_url" in data:
        blog.canonical_url = data["canonical_url"]
    if "og_image_url" in data:
        blog.og_image_url = _normalize_media_url(data["og_image_url"])

    excerpt_value = data.get("excerpt")
    if excerpt_value is not None:
        excerpt = excerpt_value.strip()
        blog.excerpt = excerpt or _generate_excerpt(blog.content_md)
    elif "content_md" in data and not blog.excerpt:
        blog.excerpt = _generate_excerpt(blog.content_md)

    blog.title = data.get("title", blog.title)
    blog.updated_by_id = current_user.id

    db.commit()
    db.refresh(blog)
    return BlogRead.model_validate(blog)


@router.delete("/{blog_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_blog(
    blog_id: int,
    db: Session = Depends(get_db_session),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.EDITOR, UserRole.AUTHOR)),
) -> None:
    blog = db.get(BlogPost, blog_id)
    if not blog:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Blog post not found")
    _enforce_author_scope(blog, current_user)
    db.delete(blog)
    db.commit()
