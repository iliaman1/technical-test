from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates


router = APIRouter()
templates = Jinja2Templates(directory="templates")


@router.get("/", response_class=HTMLResponse)
async def get_employee_tree_page(request: Request):
    return templates.TemplateResponse(request, "index.html")


@router.get("/login", response_class=HTMLResponse)
async def get_login_page(request: Request):
    return templates.TemplateResponse(request, "login.html")


@router.get("/list", response_class=HTMLResponse)
async def get_employee_list_page(request: Request):
    return templates.TemplateResponse(request, "employee_list.html")


@router.get("/create", response_class=HTMLResponse)
async def get_create_employee_page(request: Request):
    return templates.TemplateResponse(request, "employee_form.html")


@router.get("/edit/{employee_id}", response_class=HTMLResponse)
async def get_edit_employee_page(request: Request, employee_id: int):
    return templates.TemplateResponse(request, "employee_form.html")
