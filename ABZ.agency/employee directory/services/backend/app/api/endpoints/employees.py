from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import crud, schemas, modles
from app.database import get_db
from app.api import deps


router = APIRouter()


@router.get("/", response_model=list[schemas.Employee])
def read_employees(
    db: Session = Depends(get_db),
    sort_by: str | None = None,
    order: str = "asc",
    search: str | None = None,
    current_user: modles.User = Depends(deps.get_current_user),
):
    return crud.employee.get_all_employees(db, sort_by, order, search)


@router.get("/tree", response_model=list[schemas.Employee])
def read_employee_tree(db: Session = Depends(get_db)):
    return crud.employee.get_employee_tree(db)


@router.get("/{employee_id}/subordinates", response_model=list[schemas.Employee])
def read_employee_subordinates(employee_id: int, db: Session = Depends(get_db)):
    return crud.employee.get_subordinates(db, employee_id)
