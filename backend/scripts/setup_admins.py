from __future__ import annotations

from pathlib import Path
import sys

ROOT_DIR = Path(__file__).resolve().parents[1]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from sqlalchemy.orm import Session

from app.core.security import get_password_hash
from app.db.session import SessionLocal
from app.models.user import User, UserRole

TARGET_ADMINS = [
    {
        "email": "admin@memshaheb.com",
        "password": "ChangeMePlease!123",
        "display_name": "Memshaheb Admin",
    },
    {
        "email": "admin@dyingroom.xyz",
        "password": "Citylights2@",
        "display_name": "Dyingroom Admin",
    },
]

TEST_ADMIN_EMAILS = {"admin@example.com"}


def setup_admins() -> None:
    session: Session = SessionLocal()
    try:
        removed = session.query(User).filter(User.email.in_(TEST_ADMIN_EMAILS)).delete(synchronize_session=False)
        if removed:
            print(f"Removed {removed} test admin(s)")

        for admin in TARGET_ADMINS:
            user = session.query(User).filter(User.email == admin["email"]).one_or_none()
            password_hash = get_password_hash(admin["password"])

            if user:
                user.password_hash = password_hash
                user.role = UserRole.ADMIN
                user.display_name = admin["display_name"]
                print(f"Updated existing admin: {admin['email']}")
            else:
                new_user = User(
                    email=admin["email"],
                    password_hash=password_hash,
                    role=UserRole.ADMIN,
                    display_name=admin["display_name"],
                )
                session.add(new_user)
                print(f"Created admin: {admin['email']}")

        session.commit()
        print("Admin setup completed.")
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


if __name__ == "__main__":
    setup_admins()
