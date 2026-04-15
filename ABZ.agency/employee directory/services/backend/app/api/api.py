from fastapi import APIRouter

from .endpoints import employees

api_router = APIRouter()
api_router.include_router(employees.router, prefix="/employees", tags=["employees"])
