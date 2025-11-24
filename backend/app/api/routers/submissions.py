from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db_session, require_roles
from app.models.submission import Submission
from app.models.user import User, UserRole
from app.schemas.submission import SubmissionCreate, SubmissionRead, SubmissionUpdate

router = APIRouter(prefix="/submissions", tags=["submissions"])


@router.post("", response_model=SubmissionRead, status_code=status.HTTP_201_CREATED)
def create_submission(
    payload: SubmissionCreate,
    db: Session = Depends(get_db_session),
) -> SubmissionRead:
    submission = Submission(
        name=payload.name,
        email=payload.email,
        title=payload.title,
        content=payload.content,
        status="pending",
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)
    return SubmissionRead.model_validate(submission)


@router.get("/admin", response_model=list[SubmissionRead])
def list_submissions(
    db: Session = Depends(get_db_session),
    _: User = Depends(require_roles(UserRole.ADMIN, UserRole.EDITOR)),
) -> list[SubmissionRead]:
    submissions = db.query(Submission).order_by(Submission.created_at.desc()).all()
    return [SubmissionRead.model_validate(s) for s in submissions]


@router.put("/admin/{submission_id}", response_model=SubmissionRead)
def update_submission(
    submission_id: int,
    payload: SubmissionUpdate,
    db: Session = Depends(get_db_session),
    _: User = Depends(require_roles(UserRole.ADMIN, UserRole.EDITOR)),
) -> SubmissionRead:
    submission = db.get(Submission, submission_id)
    if not submission:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Submission not found")
    data = payload.model_dump(exclude_unset=True)
    for field, value in data.items():
        setattr(submission, field, value)
    db.commit()
    db.refresh(submission)
    return SubmissionRead.model_validate(submission)
