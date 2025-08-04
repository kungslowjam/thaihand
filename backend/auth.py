from datetime import datetime, timedelta
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
import crud
import models
from database import get_db
import os
from schemas import UserCreate

SECRET_KEY = os.environ.get("NEXTAUTH_SECRET", "changeme")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_jwt_token(token: str = Depends(OAuth2PasswordBearer(tokenUrl="token", auto_error=False)), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub") or payload.get("email")
        user_id = payload.get("user_id")
        provider = payload.get("provider")
        
        if not email and not user_id:
            raise HTTPException(status_code=401, detail="Invalid token: no email or user_id")
        
        # สำหรับ Line login ที่ไม่มี email
        if provider == "line" and user_id and not email:
            # สร้าง pseudo-email สำหรับ Line users
            email = f"{user_id}@line"
        
        if not email:
            raise HTTPException(status_code=401, detail="Invalid token: no email")
        
        # หา user จาก email
        user = crud.get_user_by_email(db, email=email)
        if not user:
            # ถ้ายังไม่มี user ในระบบ ให้สร้างใหม่
            user_data = UserCreate(email=email, username=email)
            if provider == "line":
                user_data.username = f"line_user_{user_id}" if user_id else email
            
            user = crud.create_user(db, user_data)
        
        return {"id": user.id, "email": user.email, "provider": provider}
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

def get_current_user(token: str = Depends(lambda: None), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token:
        raise credentials_exception
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        user_id: str = payload.get("user_id")
        provider: str = payload.get("provider")
        
        if username is None and user_id is None:
            raise credentials_exception
            
        # สำหรับ Line login
        if provider == "line" and user_id:
            username = f"line_user_{user_id}"
        
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = crud.get_user_by_username(db, username=username)
    if user is None:
        raise credentials_exception
    return user 