import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[0]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.user import User, UserRole
import bcrypt

def create_admin():
    session: Session = SessionLocal()
    try:
        email = "admin@example.com"
        password = "admin123"
        
        # Check if admin exists
        existing = session.query(User).filter(User.email == email).first()
        if existing:
            print(f"Admin already exists: {email}")
            return
        
        # Hash password manually with bcrypt
        password_bytes = password.encode('utf-8')
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password_bytes, salt).decode('utf-8')
        
        admin = User(
            email=email,
            password_hash=hashed,
            role=UserRole.ADMIN,
            display_name="Administrator",
        )
        session.add(admin)
        session.commit()
        print(f"Admin user created: {email}")
        
    except Exception as exc:
        session.rollback()
        print(f"Error creating admin: {exc}")
    finally:
        session.close()

if __name__ == "__main__":
    create_admin()