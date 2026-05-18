from fastapi import APIRouter, Depends, HTTPException
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


@router.post("/", response_model=schemas.Employee)
def create_employee(
    *,
    db: Session = Depends(get_db),
    employee_in: schemas.EmployeeCreate,
    current_user: modles.User = Depends(deps.get_current_user),
):
    return crud.employee.create_employee(db=db, employee=employee_in)


@router.get("/{employee_id}", response_model=schemas.Employee)
def read_single_employee(
    *,
    db: Session = Depends(get_db),
    employee_id: int,
    current_user: modles.User = Depends(deps.get_current_user),
):
    employee = crud.employee.get_employee(db=db, employee_id=employee_id)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    return employee


@router.put("/{employee_id}", response_model=schemas.Employee)
def update_employee(
    *,
    db: Session = Depends(get_db),
    employee_id: int,
    employee_in: schemas.EmployeeCreate,
    current_user: modles.User = Depends(deps.get_current_user),
):
    db_employee = crud.employee.get_employee(db=db, employee_id=employee_id)
    if not db_employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    return crud.employee.update_employee(
        db=db, db_employee=db_employee, employee_in=employee_in
    )


@router.delete("/{employee_id}", response_model=schemas.Employee)
def delete_employee(
    *,
    db: Session = Depends(get_db),
    employee_id: int,
    current_user: modles.User = Depends(deps.get_current_user),
):
    db_employee = crud.employee.get_employee(db=db, employee_id=employee_id)
    if not db_employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    crud.employee.delete_employee(db=db, db_employee=db_employee)
    return db_employee
