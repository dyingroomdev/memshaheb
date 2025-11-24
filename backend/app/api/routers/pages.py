from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db_session, require_roles
from app.models.page import Page, PageSection
from app.models.user import User, UserRole
from app.schemas.page import (
    PageCreate,
    PageRead,
    PageSectionCreate,
    PageSectionRead,
    PageSectionUpdate,
    PageUpdate,
    PageWithSections,
)

router = APIRouter(prefix="/pages", tags=["pages"])


@router.get("", response_model=list[PageRead])
def list_pages(db: Session = Depends(get_db_session)) -> list[PageRead]:
    pages = (
        db.query(Page)
        .filter(Page.is_active.is_(True))
        .order_by(Page.created_at.asc())
        .all()
    )
    return [PageRead.model_validate(p) for p in pages]


@router.get("/{slug}", response_model=PageWithSections)
def get_page(slug: str, db: Session = Depends(get_db_session)) -> PageWithSections:
    page = (
        db.query(Page)
        .filter(Page.slug == slug, Page.is_active.is_(True))
        .first()
    )
    if not page:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Page not found")
    # sections ordered by order asc
    _ = page.sections
    page.sections.sort(key=lambda s: s.order)
    return PageWithSections.model_validate(page)


# Admin endpoints

@router.get("/admin", response_model=list[PageRead])
def list_pages_admin(
    db: Session = Depends(get_db_session),
    _: User = Depends(require_roles(UserRole.ADMIN, UserRole.EDITOR)),
) -> list[PageRead]:
    pages = db.query(Page).order_by(Page.created_at.asc()).all()
    return [PageRead.model_validate(p) for p in pages]


@router.get("/admin/slug/{slug}", response_model=PageWithSections)
def get_page_admin_by_slug(
    slug: str,
    db: Session = Depends(get_db_session),
    _: User = Depends(require_roles(UserRole.ADMIN, UserRole.EDITOR)),
) -> PageWithSections:
    page = db.query(Page).filter(Page.slug == slug).first()
    if not page:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Page not found")
    page.sections.sort(key=lambda s: s.order)
    return PageWithSections.model_validate(page)


@router.post("/admin", response_model=PageRead, status_code=status.HTTP_201_CREATED)
def create_page(
    payload: PageCreate,
    db: Session = Depends(get_db_session),
    _: User = Depends(require_roles(UserRole.ADMIN, UserRole.EDITOR)),
) -> PageRead:
    existing = db.query(Page).filter(Page.slug == payload.slug).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Slug already exists")
    page = Page(**payload.model_dump())
    db.add(page)
    db.commit()
    db.refresh(page)
    return PageRead.model_validate(page)


@router.put("/admin/{page_id}", response_model=PageRead)
def update_page(
    page_id: int,
    payload: PageUpdate,
    db: Session = Depends(get_db_session),
    _: User = Depends(require_roles(UserRole.ADMIN, UserRole.EDITOR)),
) -> PageRead:
    page = db.get(Page, page_id)
    if not page:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Page not found")
    data = payload.model_dump(exclude_unset=True)
    if "slug" in data:
        existing = db.query(Page).filter(Page.slug == data["slug"], Page.id != page_id).first()
        if existing:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Slug already exists")
    for field, value in data.items():
        setattr(page, field, value)
    db.commit()
    db.refresh(page)
    return PageRead.model_validate(page)


@router.put("/admin/slug/{slug}", response_model=PageRead)
def update_page_by_slug(
    slug: str,
    payload: PageUpdate,
    db: Session = Depends(get_db_session),
    _: User = Depends(require_roles(UserRole.ADMIN, UserRole.EDITOR)),
) -> PageRead:
    page = db.query(Page).filter(Page.slug == slug).first()
    if not page:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Page not found")
    data = payload.model_dump(exclude_unset=True)
    if "slug" in data:
        existing = db.query(Page).filter(Page.slug == data["slug"], Page.id != page.id).first()
        if existing:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Slug already exists")
    for field, value in data.items():
        setattr(page, field, value)
    db.commit()
    db.refresh(page)
    return PageRead.model_validate(page)


@router.delete("/admin/{page_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_page(
    page_id: int,
    db: Session = Depends(get_db_session),
    _: User = Depends(require_roles(UserRole.ADMIN, UserRole.EDITOR)),
) -> None:
    page = db.get(Page, page_id)
    if not page:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Page not found")
    db.delete(page)
    db.commit()


@router.get("/admin/{page_id}/sections", response_model=list[PageSectionRead])
def list_sections(
    page_id: int,
    db: Session = Depends(get_db_session),
    _: User = Depends(require_roles(UserRole.ADMIN, UserRole.EDITOR)),
) -> list[PageSectionRead]:
    sections = (
        db.query(PageSection)
        .filter(PageSection.page_id == page_id)
        .order_by(PageSection.order.asc())
        .all()
    )
    return [PageSectionRead.model_validate(s) for s in sections]


@router.post("/admin/{page_id}/sections", response_model=PageSectionRead, status_code=status.HTTP_201_CREATED)
def create_section(
    page_id: int,
    payload: PageSectionCreate,
    db: Session = Depends(get_db_session),
    _: User = Depends(require_roles(UserRole.ADMIN, UserRole.EDITOR)),
) -> PageSectionRead:
    if payload.page_id != page_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="page_id mismatch")
    page = db.get(Page, page_id)
    if not page:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Page not found")
    section = PageSection(**payload.model_dump())
    db.add(section)
    db.commit()
    db.refresh(section)
    return PageSectionRead.model_validate(section)


@router.post("/admin/slug/{slug}/sections", response_model=PageSectionRead, status_code=status.HTTP_201_CREATED)
def create_section_by_slug(
    slug: str,
    payload: PageSectionCreate,
    db: Session = Depends(get_db_session),
    _: User = Depends(require_roles(UserRole.ADMIN, UserRole.EDITOR)),
) -> PageSectionRead:
    page = db.query(Page).filter(Page.slug == slug).first()
    if not page:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Page not found")
    if payload.page_id != page.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="page_id mismatch")
    section = PageSection(**payload.model_dump())
    db.add(section)
    db.commit()
    db.refresh(section)
    return PageSectionRead.model_validate(section)


@router.put("/admin/sections/{section_id}", response_model=PageSectionRead)
def update_section(
    section_id: int,
    payload: PageSectionUpdate,
    db: Session = Depends(get_db_session),
    _: User = Depends(require_roles(UserRole.ADMIN, UserRole.EDITOR)),
) -> PageSectionRead:
    section = db.get(PageSection, section_id)
    if not section:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Section not found")
    data = payload.model_dump(exclude_unset=True)
    for field, value in data.items():
        setattr(section, field, value)
    db.commit()
    db.refresh(section)
    return PageSectionRead.model_validate(section)


@router.delete("/admin/sections/{section_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_section(
    section_id: int,
    db: Session = Depends(get_db_session),
    _: User = Depends(require_roles(UserRole.ADMIN, UserRole.EDITOR)),
) -> None:
    section = db.get(PageSection, section_id)
    if not section:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Section not found")
    db.delete(section)
    db.commit()
