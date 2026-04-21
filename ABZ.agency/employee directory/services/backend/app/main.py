from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from app.api.api import api_router

app = FastAPI(title="Employee Directory API")

app.include_router(api_router)
app.mount("/static", StaticFiles(directory="static"), name="static")


@app.get("/")
def read_root():
    return {"message": "Welcome to Employee Directory API!!!"}
