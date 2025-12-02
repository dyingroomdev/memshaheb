from __future__ import annotations

import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[1]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.models.blog import BlogPost
from app.utils.slugify import slugify


def _unique_slug(base: str, taken: set[str], current_slug: str | None = None) -> str:
    """
    Generate a unique slug based on `base`, avoiding entries in `taken`.
    If the current slug is already unique and matches the base slug, keep it.
    """
    base_slug = slugify(base) or "post"

    # If current slug already matches and is unique, keep it.
    if current_slug == base_slug and base_slug not in taken:
        return base_slug

    slug = base_slug
    counter = 2
    while slug in taken:
        slug = f"{base_slug}-{counter}"
        counter += 1
    return slug


def reslug_all_blogs() -> None:
    session: Session = SessionLocal()
    try:
        blogs = session.query(BlogPost).order_by(BlogPost.id.asc()).all()
        taken: set[str] = set()
        updated = 0

        for blog in blogs:
            new_slug = _unique_slug(blog.title or "", taken, blog.slug)
            taken.add(new_slug)

            if blog.slug != new_slug:
                blog.slug = new_slug
                updated += 1

        if updated:
            session.commit()
        print(f"[reslug] inspected {len(blogs)} posts, updated {updated} slugs")
    except Exception as exc:  # pragma: no cover
        session.rollback()
        print(f"[reslug] error: {exc}", file=sys.stderr)
        raise
    finally:
        session.close()


if __name__ == "__main__":
    reslug_all_blogs()
