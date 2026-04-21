from sqlalchemy.orm import Session, noload
from .. import modles


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


def get_all_employees(db: Session, sort_by: str | None = None, order: str = "asc"):
    query = db.query(modles.Employee)
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
