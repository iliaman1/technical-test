from sqlalchemy import Column, Date, ForeignKey, Numeric, String, Integer
from sqlalchemy.orm import relationship

from app.database import Model


class Employee(Model):
    full_name = Column(String, nullable=False, index=True)
    position = Column(String, nullable=False)
    hire_date = Column(Date, nullable=False)
    salary = Column(Numeric(10, 2), nullable=False)

    manager_id = Column(Integer, ForeignKey("employee.id"), nullable=True)

    manager = relationship(
        "Employee", remote_side=lambda: Employee.id, back_populates="subordinates"
    )
    subordinates = relationship("Employee", back_populates="manager")
