from datetime import date
from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class EmployeeBase(BaseModel):
    full_name: str
    position: str
    photo_path: str | None = None


class EmployeeCreate(EmployeeBase):
    hire_date: date
    salary: Decimal
    manager_id: int | None = None


class Employee(EmployeeBase):
    id: int
    hire_date: date
    salary: Decimal

    model_config = ConfigDict(from_attributes=True)


class EmployeeUpdate(BaseModel):
    full_name: str | None = None
    position: str | None = None
    photo_path: str | None = None
    hire_date: date | None = None
    salary: Decimal | None = None
    manager_id: int | None = None


class EmployeeWithSubordinates(Employee):
    subordinates: list["EmployeeWithSubordinates"] = []
