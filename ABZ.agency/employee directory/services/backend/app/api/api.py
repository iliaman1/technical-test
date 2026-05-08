from fastapi import APIRouter

from .endpoints import employees, pages, auth, users

api_router = APIRouter()
api_router.include_router(employees.router, prefix="/employees", tags=["employees"])
api_router.include_router(pages.router, tags=["Pages"])
api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
