import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[0]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import get_password_hash
from app.db.session import SessionLocal
from app.models.user import User, UserRole

def create_admin():
    session: Session = SessionLocal()
    email = str(settings.INITIAL_ADMIN_EMAIL)
    password = str(settings.INITIAL_ADMIN_PASSWORD)
    display_name = settings.INITIAL_ADMIN_DISPLAY_NAME or "Administrator"

    try:
        existing = session.query(User).filter(User.email == email).first()
        if existing:
            # Update password/display name to match env so rerunning resets creds
            existing.password_hash = get_password_hash(password)
            existing.display_name = display_name
            existing.role = UserRole.ADMIN
            session.commit()
            print(f"Admin already existed; updated credentials for: {email}")
            return

        admin = User(
            email=email,
            password_hash=get_password_hash(password),
            role=UserRole.ADMIN,
            display_name=display_name,
        )
        session.add(admin)
        session.commit()
        print(f"Admin user created: {email}")

    except Exception as exc:
        session.rollback()
        print(f"Error creating admin: {exc}")
        raise
    finally:
        session.close()

if __name__ == "__main__":
    create_admin()
