from sqlalchemy.orm import Session

from .. import modles, schemas
from app.core.security import verify_password, get_password_hash


def get_user_by_email(db: Session, email: str):
    return db.query(modles.User).filter(modles.User.email == email).first()


def authenticate_user(db: Session, email: str, password: str):
    user = get_user_by_email(db, email)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):  # type: ignore
        return None
    return user


def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = modles.User(email=user.email, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user
