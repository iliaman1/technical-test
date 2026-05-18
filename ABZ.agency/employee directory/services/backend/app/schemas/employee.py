from datetime import date
from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class EmployeeBase(BaseModel):
    full_name: str
    position: str


class EmployeeCreate(EmployeeBase):
    hire_date: date
    salary: Decimal
    manager_id: int | None = None


class Employee(EmployeeBase):
    id: int
    hire_date: date
    salary: Decimal

    model_config = ConfigDict(from_attributes=True)


class EmployeeWithSubordinates(Employee):
    subordinates: list["EmployeeWithSubordinates"] = []
