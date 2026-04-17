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
