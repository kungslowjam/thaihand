from fastapi import FastAPI, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from datetime import datetime
import models
import schemas
import crud
import auth
import database
from database import engine, get_db
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from routers import router as api_router
from pydantic import ValidationError
import traceback

fastapi_app = FastAPI()

import os

# เพิ่ม CORS middleware
allowed_origins = os.getenv("ALLOWED_ORIGINS", "https://thaihand.shop,https://www.thaihand.shop").split(",")
fastapi_app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global error handling
@fastapi_app.exception_handler(ValidationError)
async def validation_exception_handler(request: Request, exc: ValidationError):
    return JSONResponse(
        status_code=422,
        content={"detail": "ข้อมูลไม่ถูกต้อง", "errors": exc.errors()}
    )

@fastapi_app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )

@fastapi_app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    print(f"Unhandled exception: {exc}")
    print(traceback.format_exc())
    return JSONResponse(
        status_code=500,
        content={"detail": "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์"}
    )

fastapi_app.include_router(api_router, prefix="/api")

app = fastapi_app

models.Base.metadata.create_all(bind=engine)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# เปลี่ยน @app.* เป็น @fastapi_app.*
@fastapi_app.post("/auth/register", response_model=schemas.UserOut)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    try:
        db_user = crud.get_user_by_username(db, username=user.username)
        if db_user:
            raise HTTPException(status_code=400, detail="Username already registered")
        return crud.create_user(db, user)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating user: {str(e)}")

@fastapi_app.post("/auth/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    try:
        user = crud.get_user_by_username(db, username=form_data.username)
        if not user or not crud.verify_password(form_data.password, user.hashed_password):
            raise HTTPException(status_code=401, detail="Incorrect username or password")
        access_token = auth.create_access_token(data={"sub": user.username})
        return {"access_token": access_token, "token_type": "bearer"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error during login: {str(e)}")

@fastapi_app.get("/users/me", response_model=schemas.UserOut)
def read_users_me(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        current_user = auth.get_current_user(token, db)
        return current_user
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting user info: {str(e)}")

@fastapi_app.get("/api/users/me")
def get_current_user_info(user=Depends(auth.verify_jwt_token)):
    return user

@fastapi_app.get("/health")
def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()} 