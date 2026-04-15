from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import crud, schemas
from app.database import SessionLocal


router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/tree", response_model=list[schemas.Employee])
def read_employee_tree(db: Session = Depends(get_db)):
    return crud.employee.get_employee_tree(db)
