from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db_session, require_roles
from app.models.user import User, UserRole
from app.models.site_settings import SiteSettings
from app.models.painting import Painting
from app.models.blog import BlogPost
from app.models.submission import Submission

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/summary")
def analytics_summary(
    db: Session = Depends(get_db_session),
    _: User = Depends(require_roles(UserRole.ADMIN, UserRole.EDITOR)),
):
    settings = db.query(SiteSettings).order_by(SiteSettings.id.asc()).first()
    total_views = settings.manual_total_views if settings else 0
    paintings_count = db.query(Painting).count()
    blogs_count = db.query(BlogPost).count()
    submissions_count = db.query(Submission).count()

    return {
        "total_views": total_views,
        "paintings": paintings_count,
        "blog_posts": blogs_count,
        "submissions": submissions_count,
        "google_analytics_id": settings.google_analytics_id if settings else None,
        "ga_view_sample": settings.ga_view_sample if settings else None,
    }
