import random
import sys
from pathlib import Path

from faker import Faker
from sqlalchemy.orm import Session

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.database import SessionLocal
from app.modles import Employee

TOTAL_EMPLOYEES = 50000
HIERARCHY_DEPTH = 5

faker = Faker()


def create_employees_with_hierarchy(db: Session, total_employees: int, depth: int):
    employees = []
    manager_pool = []

    ceo = Employee(
        full_name=faker.name(),
        position="CEO",
        hire_date=faker.date_between(start_date="-10y", end_date="today"),
        salary=random.randint(10000, 20000),
    )
    employees.append(ceo)
    manager_pool.append(ceo)

    current_level_managers = [ceo]

    for level in range(1, depth):
        next_level_managers = []
        if len(employees) >= total_employees:
            break

        for manager in current_level_managers:
            num_subordinates = random.randint(2, 5)
            for _ in range(num_subordinates):
                if len(employees) >= total_employees:
                    break

                new_manager = Employee(
                    full_name=faker.name(),
                    position=f"Manager Level {level}",
                    hire_date=faker.date_between(start_date="-5y", end_date="today"),
                    salary=random.randint(5000, 9000),
                    manager=manager,
                )
                employees.append(new_manager)
                next_level_managers.append(new_manager)
        current_level_managers = next_level_managers
        manager_pool.extend(current_level_managers)

    remining_employees_count = total_employees - len(employees)
    bulk_employees = []

    for i in range(remining_employees_count):
        employee = Employee(
            full_name=faker.name(),
            position="Developer",
            hire_date=faker.date_between(start_date="-3y", end_date="today"),
            salary=random.randint(2000, 4000),
            manager=random.choice(manager_pool),
        )
        bulk_employees.append(employee)

    db.add_all(employees + bulk_employees)
    db.commit()


if __name__ == "__main__":
    db = SessionLocal()
    try:
        create_employees_with_hierarchy(db, TOTAL_EMPLOYEES, HIERARCHY_DEPTH)
    finally:
        db.close()
