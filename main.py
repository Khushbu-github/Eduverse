from fastapi import FastAPI, Depends, Path, status, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
from pydantic import BaseModel
from routrers import auth_routes
from routrers import student_routes
from routrers import teacher_routes
from routrers import hod_routes
from auth import get_current_user
app=FastAPI()
app.include_router(auth_routes.router)
app.include_router(student_routes.router)
app.include_router(teacher_routes.router)
app.include_router(hod_routes.router)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
       "*"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message":"Hello World"}
@app.get("/protected")
async def protected_route(current_user = Depends(get_current_user)):
    """
    Example protected route that requires authentication.
    Use the Authorize button in Swagger UI to test this.
    """
    return {
        "message": "This is a protected route", 
        "user": current_user.email,
        "user_role": getattr(current_user, 'type', 'unknown')
    }