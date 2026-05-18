from sqlalchemy import or_
from sqlalchemy.orm import Session, noload
from app import modles
from app import schemas


def get_employee_tree(db: Session):
    return (
        db.query(modles.Employee)
        .options(noload(modles.Employee.subordinates))
        .filter(modles.Employee.manager_id.is_(None))
        .all()
    )


def get_subordinates(db: Session, employee_id: int):
    employee = (
        db.query(modles.Employee).filter(modles.Employee.id == employee_id).first()
    )

    return employee.subordinates if employee else []


def get_all_employees(
    db: Session,
    sort_by: str | None = None,
    order: str = "asc",
    search: str | None = None,
):
    query = db.query(modles.Employee)
    if search:
        search_term = f"{search}"
        query = query.filter(
            or_(
                modles.Employee.full_name.ilike(search_term),
                modles.Employee.position.ilike(search_term),
            )
        )

    allowed_sort_columns = {
        "full_name": modles.Employee.full_name,
        "position": modles.Employee.position,
        "hire_date": modles.Employee.hire_date,
        "salary": modles.Employee.salary,
    }

    if sort_by and sort_by in allowed_sort_columns:
        column_to_sort = allowed_sort_columns[sort_by]
        if order == "desc":
            query = query.order_by(column_to_sort.desc())
        else:
            query = query.order_by(column_to_sort.asc())

    return query.all()


def get_employee(db: Session, employee_id: int):
    return db.query(modles.Employee).filter(modles.Employee.id == employee_id).first()


def create_employee(db: Session, employee: schemas.EmployeeCreate):
    db_employee = modles.Employee(**employee.model_dump())
    db.add(db_employee)
    db.commit()
    db.refresh(db_employee)
    return db_employee


def update_employee(
    db: Session, db_employee: modles.Employee, employee_in: schemas.EmployeeCreate
):
    employee_data = employee_in.model_dump(exclude_unset=True)
    for key, value in employee_data.items():
        setattr(db_employee, key, value)
    db.add(db_employee)
    db.commit()
    db.refresh(db_employee)
    return db_employee


def delete_employee(db: Session, db_employee: modles.Employee):
    db.delete(db_employee)
    db.commit()
    return db_employee
