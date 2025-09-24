from sqlalchemy.orm import Session
from .models import User
from .schemas import UserCreate, UserOut

def get_user(db: Session, google_id: str):
    return db.query(User).filter(User.google_id == google_id).first()

def create_user(db: Session, user: UserCreate):
    db_user = User(google_id=user.google_id, email=user.email)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user