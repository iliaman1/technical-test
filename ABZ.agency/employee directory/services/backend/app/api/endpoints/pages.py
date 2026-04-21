from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates

router = APIRouter()
templates = Jinja2Templates(directory="templates")


@router.get("/", response_class=HTMLResponse)
async def get_employee_tree_page(request: Request):
    return templates.TemplateResponse(request, "index.html")


@router.get("/list", response_class=HTMLResponse)
async def get_employee_list_page(request: Request):
    return templates.TemplateResponse(request, "employee_list.html")
