from fastapi import APIRouter

from .endpoints import employees, pages

api_router = APIRouter()
api_router.include_router(employees.router, prefix="/employees", tags=["employees"])
api_router.include_router(pages.router, tags=["Pages"])
