from __future__ import annotations

import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[1]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import get_password_hash
from app.db.session import SessionLocal
from app.models.user import User, UserRole


def seed_admin() -> int:
    session: Session = SessionLocal()
    try:
        email = str(settings.INITIAL_ADMIN_EMAIL)
        existing = session.query(User).filter(User.email == email).first()
        if existing:
            print(f"[seed-admin] Admin already exists: {email}")
            return 0

        admin = User(
            email=email,
            password_hash=get_password_hash(str(settings.INITIAL_ADMIN_PASSWORD)),
            role=UserRole.ADMIN,
            display_name=settings.INITIAL_ADMIN_DISPLAY_NAME,
        )
        session.add(admin)
        session.commit()
        print(f"[seed-admin] Admin user created: {email}")
        return 0
    except Exception as exc:  # pragma: no cover
        session.rollback()
        print(f"[seed-admin] Error creating admin: {exc}", file=sys.stderr)
        return 1
    finally:
        session.close()


if __name__ == "__main__":
    raise SystemExit(seed_admin())
