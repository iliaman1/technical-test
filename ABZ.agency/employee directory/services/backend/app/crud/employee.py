from sqlalchemy.orm import Session, noload
from .. import modles


def get_employee_tree(db: Session):
    return (
        db.query(modles.Employee)
        .options(noload(modles.Employee.subordinates))
        .filter(modles.Employee.manager_id.is_(None))
        .all()
    )
