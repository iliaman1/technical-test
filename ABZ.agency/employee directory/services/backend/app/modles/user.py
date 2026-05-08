from sqlalchemy import Boolean, Column, String
from app.database import Model


class User(Model):
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
