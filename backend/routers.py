from fastapi import APIRouter, Depends, HTTPException, Request, Body
from sqlalchemy.orm import Session
from database import get_db
import crud, schemas
from auth import verify_jwt_token, create_access_token
import requests
from models import User
from fastapi.responses import JSONResponse
import json
import models
import asyncio

router = APIRouter()

# Auth
@router.post("/auth/login")
def login():
    return {"message": "login"}

@router.post("/auth/register")
def register():
    return {"message": "register"}

@router.post("/auth/exchange")
async def exchange_token(request: Request):
    try:
        data = await request.json()
        access_token = data.get("accessToken")
        provider = data.get("provider")  # เพิ่ม field provider ใน frontend ด้วย
        
        print(f"Exchange token request - Provider: {provider}")
        print(f"Exchange token request - Access token: {access_token[:20] if access_token else 'None'}...")
        
        if not access_token:
            return JSONResponse(status_code=400, content={"detail": "No accessToken provided"})
        user_email = None
        if provider == "google":
            # Verify Google token
            print("Verifying Google token...")
            resp = requests.get(f"https://www.googleapis.com/oauth2/v3/tokeninfo?access_token={access_token}")
            print(f"Google API response status: {resp.status_code}")
            if resp.status_code != 200:
                print(f"Google API error: {resp.text}")
                return JSONResponse(status_code=401, content={"detail": "Invalid Google token"})
            user_info = resp.json()
            user_email = user_info.get("email")
            print(f"Google user email: {user_email}")
        elif provider == "line":
            # Verify Line token
            print("Verifying Line token...")
            resp = requests.get("https://api.line.me/v2/profile", headers={"Authorization": f"Bearer {access_token}"})
            print(f"Line API response status: {resp.status_code}")
            if resp.status_code != 200:
                print(f"Line API error: {resp.text}")
                return JSONResponse(status_code=401, content={"detail": "Invalid Line token"})
            user_info = resp.json()
            user_id = user_info.get("userId")
            if not user_id:
                return JSONResponse(status_code=401, content={"detail": "No userId in Line profile"})
            user_email = f"{user_id}@line.me"  # ใช้ userId เป็น pseudo-email เหมือน frontend
            print(f"Line user email: {user_email}")
        else:
            return JSONResponse(status_code=400, content={"detail": "Unknown provider"})
        if not user_email:
            return JSONResponse(status_code=401, content={"detail": "No email in token"})
        # --- เพิ่มส่วนนี้: สร้าง user ในฐานข้อมูลถ้ายังไม่มี ---
        from database import SessionLocal
        from models import User
        db = SessionLocal()
        user = db.query(User).filter(User.email == user_email).first()
        if not user:
            new_user = User(email=user_email, username=user_email, hashed_password="")
            db.add(new_user)
            db.commit()
            print(f"Created new user: {user_email}")
        else:
            print(f"User already exists: {user_email}")
        db.close()
        # --- จบส่วนเพิ่ม ---
        # สร้าง JWT ของ backend
        jwt_token = create_access_token({"sub": user_email})
        print(f"Generated JWT token for: {user_email}")
        return {"accessToken": jwt_token}
    except Exception as e:
        print(f"Exchange token error: {str(e)}")
        return JSONResponse(status_code=500, content={"detail": str(e)})

# NextAuth endpoints
@router.get("/auth/providers")
def get_providers():
    return {
        "google": {
            "id": "google",
            "name": "Google",
            "type": "oauth",
            "signinUrl": "/api/auth/signin/google",
            "callbackUrl": "/api/auth/callback/google"
        },
        "line": {
            "id": "line", 
            "name": "Line",
            "type": "oauth",
            "signinUrl": "/api/auth/signin/line",
            "callbackUrl": "/api/auth/callback/line"
        }
    }

@router.get("/auth/session")
def get_session():
    return {"user": None, "expires": None}

@router.get("/auth/signin")
def signin():
    return {"url": "/login"}

@router.post("/auth/signout")
def signout():
    return {"url": "/"}

@router.get("/auth/callback/{provider}")
def callback(provider: str):
    return {"provider": provider, "status": "success"}

@router.get("/auth/error")
def auth_error():
    return {"error": "Authentication error"}

@router.post("/auth/_log")
def auth_log():
    return {"ok": True}

# Marketplace
@router.get("/marketplace")
def get_marketplace():
    return {"message": "marketplace list"}

# Orders
@router.get("/orders")
def get_orders():
    return {"message": "orders list"}

# Users
@router.get("/users/me")
def get_user():
    return {"message": "user info"}

# Notifications
@router.get("/notifications")
def read_notifications(user_email: str = None, db: Session = Depends(get_db)):
    try:
        if not user_email:
            return []
        user = db.query(models.User).filter(models.User.email == user_email).first()
        if not user:
            return []
        return crud.get_notifications_after_time(db, user.id, "1970-01-01T00:00:00")
    except Exception as e:
        print(f"Error in read_notifications: {e}")
        import traceback
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail="เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์")

@router.get("/requests", response_model=list[schemas.RequestOut])
def read_requests(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_requests(db, skip=skip, limit=limit)

@router.post("/requests", response_model=schemas.RequestOut)
def create_request(request: schemas.RequestCreate, db: Session = Depends(get_db), user=Depends(verify_jwt_token)):
    user_id = user.get('id')
    user_email = user.get('email')
    print(f"DEBUG: user_id from token = {user_id} (type: {type(user_id)}) user_email = {user_email}")
    if not isinstance(user_id, int) or user_id is None:
        raise HTTPException(status_code=400, detail="User id not found or invalid (None or not int)")
    return crud.create_request(db, request, user_id, offer_id=request.offer_id, user_email=user_email)

@router.get("/requests/{request_id}", response_model=schemas.RequestOut)
def read_request(request_id: int, db: Session = Depends(get_db)):
    try:
        print(f"DEBUG_READ_REQUEST: Looking for request_id = {request_id}")
        db_request = crud.get_request(db, request_id)
        print(f"DEBUG_READ_REQUEST: Found request = {db_request}")
        if db_request is None:
            print(f"DEBUG_READ_REQUEST: Request {request_id} not found")
            raise HTTPException(status_code=404, detail="Request not found")
        return db_request
    except Exception as e:
        print(f"Error in read_request: {e}")
        import traceback
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail="เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์")

@router.put("/requests/{request_id}", response_model=schemas.RequestOut)
def update_request(request_id: int, request: schemas.RequestUpdate, db: Session = Depends(get_db), user=Depends(verify_jwt_token)):
    db_request = crud.update_request(db, request_id, request)
    if db_request is None:
        raise HTTPException(status_code=404, detail="Request not found")
    return db_request

@router.delete("/requests/{request_id}")
def delete_request(request_id: int, db: Session = Depends(get_db), user=Depends(verify_jwt_token)):
    db_request = crud.delete_request(db, request_id)
    if db_request is None:
        raise HTTPException(status_code=404, detail="Request not found")
    return {"ok": True}

# เพิ่ม API สำหรับ approve/reject requests
@router.patch("/requests/{request_id}/status")
def update_request_status(request_id: int, status_update: dict, db: Session = Depends(get_db), user=Depends(verify_jwt_token)):
    try:
        new_status = status_update.get("status")
        if new_status not in ["รออนุมัติ", "อนุมัติ", "ปฏิเสธ", "สำเร็จ"]:
            raise HTTPException(status_code=400, detail="Invalid status")
        
        db_request = crud.get_request(db, request_id)
        if db_request is None:
            raise HTTPException(status_code=404, detail="Request not found")
        
        # อัปเดตสถานะ
        db_request.status = new_status
        db.commit()
        db.refresh(db_request)
        
        return {"ok": True, "status": new_status}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating status: {str(e)}")

@router.get("/offers")
def read_offers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    offers = crud.get_offers(db, skip=skip, limit=limit)
    result = []
    for offer in offers:
        user = db.query(models.User).filter(models.User.id == offer.user_id).first()
        try:
            rates = json.loads(offer.rates) if offer.rates else []
        except Exception:
            rates = []
        
        # คำนวณน้ำหนักที่ใช้แล้วจาก requests ที่เชื่อมกับ offer นี้
        requests_for_offer = db.query(models.Request).filter(models.Request.offer_id == offer.id).all()
        used_weight = len(requests_for_offer)  # ใช้จำนวน requests เป็นตัวแทนน้ำหนักที่ใช้แล้ว
        
        # กำหนด maxWeight จาก rates หรือใช้ค่าเริ่มต้น
        max_weight = 10  # ค่าเริ่มต้น
        if rates and len(rates) > 0:
            # ถ้า rates มีข้อมูล ให้ใช้ค่าสูงสุดจาก rates
            try:
                max_weight = max(float(rate.get('weight', '0').replace('kg', '')) for rate in rates if rate.get('weight'))
            except:
                max_weight = 10
        
        result.append({
            "id": offer.id,
            "routeFrom": offer.route_from,
            "routeTo": offer.route_to,
            "flightDate": offer.flight_date,
            "closeDate": offer.close_date,
            "deliveryDate": offer.delivery_date,
            "rates": rates,
            "pickupPlace": offer.pickup_place,
            "itemTypes": offer.item_types,
            "restrictions": offer.restrictions,
            "description": offer.description,
            "contact": offer.contact,
            "urgent": offer.urgent,
            "image": offer.image,
            "user_id": offer.user_id,
            "user_name": user.username if user else None,
            "user_email": user.email if user else None,
            "maxWeight": max_weight,
            "usedWeight": used_weight,
        })
    return result

@router.post("/offers", response_model=schemas.OfferOut)
def create_offer(offer: schemas.OfferCreate, db: Session = Depends(get_db), user=Depends(verify_jwt_token)):
    user_id = user.get('id')
    return crud.create_offer(db, offer, user_id)

@router.get("/offers/{offer_id}", response_model=schemas.OfferOut)
def read_offer(offer_id: int, db: Session = Depends(get_db)):
    try:
        print(f"DEBUG_READ_OFFER: Looking for offer_id = {offer_id}")
        db_offer = crud.get_offer(db, offer_id)
        print(f"DEBUG_READ_OFFER: Found offer = {db_offer}")
        if db_offer is None:
            print(f"DEBUG_READ_OFFER: Offer {offer_id} not found")
            raise HTTPException(status_code=404, detail="Offer not found")
        return db_offer
    except Exception as e:
        print(f"Error in read_offer: {e}")
        import traceback
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail="เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์")

@router.put("/offers/{offer_id}", response_model=schemas.OfferOut)
def update_offer(offer_id: int, offer: schemas.OfferUpdate, db: Session = Depends(get_db), user=Depends(verify_jwt_token)):
    db_offer = crud.update_offer(db, offer_id, offer)
    if db_offer is None:
        raise HTTPException(status_code=404, detail="Offer not found")
    return db_offer

@router.delete("/offers/{offer_id}")
def delete_offer(offer_id: int, db: Session = Depends(get_db), user=Depends(verify_jwt_token)):
    db_offer = crud.delete_offer(db, offer_id)
    if db_offer is None:
        raise HTTPException(status_code=404, detail="Offer not found")
    return {"ok": True}

@router.get("/my-orders", response_model=list[schemas.RequestOut])
def my_orders(email: str, db: Session = Depends(get_db)):
    try:
        print("DEBUG_MY_ORDERS: email =", email)
        user = db.query(User).filter(User.email == email).first()
        print("DEBUG_MY_ORDERS: user =", user)
        if not user:
            print("DEBUG_MY_ORDERS: user not found for email", email)
            return []
        
        # แปลง user.id เป็น int ถ้าเป็น string
        user_id = int(user.id) if isinstance(user.id, str) else user.id
        result = crud.get_my_orders(db, user_id)
        print("DEBUG_MY_ORDERS: user_id =", user_id, "result count =", len(result))
        
        # ตรวจสอบและแก้ไขข้อมูลที่ไม่สมเหตุสมผล
        for r in result:
            print(f"DEBUG_MY_ORDERS: request id={r.id} user_id={r.user_id} user_email={r.user_email} title={r.title}")
            # ตรวจสอบ budget
            if hasattr(r, 'budget') and (r.budget is None or r.budget <= 0):
                r.budget = None
            
            # ตรวจสอบ title
            if not r.title or r.title.strip() == "":
                r.title = "รายการฝากหิ้ว"
            
            # ตรวจสอบ description
            if not r.description or r.description.strip() == "":
                r.description = "ไม่มีรายละเอียดเพิ่มเติม"
            
            # ตรวจสอบ locations
            if not r.from_location or r.from_location.strip() == "":
                r.from_location = "ไม่ระบุ"
            if not r.to_location or r.to_location.strip() == "":
                r.to_location = "ไม่ระบุ"
        
        return result
    except Exception as e:
        print(f"Error in my_orders: {e}")
        import traceback
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail="เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์")

@router.get("/my-carry-orders", response_model=list[schemas.OfferOut])
def my_carry_orders(email: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return []
    return crud.get_my_carry_orders(db, user.id)

@router.get("/my-carry-orders/{offer_id}", response_model=schemas.OfferOut)
def my_carry_order_detail(offer_id: int, user_id: int, db: Session = Depends(get_db)):
    db_offer = crud.get_my_carry_order_detail(db, user_id, offer_id)
    if db_offer is None:
        raise HTTPException(status_code=404, detail="Offer not found")
    return db_offer 

@router.get("/routes", response_model=list[schemas.RouteOut])
def read_routes(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_routes(db, skip=skip, limit=limit)

@router.post("/routes", response_model=schemas.RouteOut)
def create_route(route: schemas.RouteCreate, db: Session = Depends(get_db), user=Depends(verify_jwt_token)):
    return crud.create_route(db, route)

@router.delete("/routes/{route_id}")
def delete_route(route_id: int, db: Session = Depends(get_db), user=Depends(verify_jwt_token)):
    db_route = crud.delete_route(db, route_id)
    if db_route is None:
        raise HTTPException(status_code=404, detail="Route not found")
    return {"ok": True} 

@router.get("/offers/{offer_id}/requests", response_model=list[schemas.RequestOut])
def get_requests_for_offer(offer_id: int, db: Session = Depends(get_db)):
    return db.query(models.Request).filter(models.Request.offer_id == offer_id).all() 

@router.get("/notifications/longpoll")
async def longpoll_notifications(user_email: str, last_time: str = "1970-01-01T00:00:00", db: Session = Depends(get_db)):
    try:
        user = db.query(User).filter(User.email == user_email).first()
        if not user:
            return {"notifications": []}
        user_id = user.id
        timeout = 25
        interval = 2  # เพิ่ม interval เป็น 2 วินาที
        waited = 0
        
        # ตรวจสอบว่า last_time เป็น timestamp ที่ถูกต้องหรือไม่
        try:
            from datetime import datetime
            datetime.fromisoformat(last_time.replace('Z', '+00:00'))
        except:
            last_time = "1970-01-01T00:00:00"
        
        while waited < timeout:
            new_notifs = crud.get_notifications_after_time(db, user_id, last_time)
            if new_notifs:
                # กรองเฉพาะ notification ที่ใหม่กว่า last_time จริงๆ
                filtered_notifs = []
                for notif in new_notifs:
                    try:
                        notif_time = notif.get('created_at', '')
                        if notif_time and notif_time > last_time:
                            filtered_notifs.append(notif)
                    except:
                        continue
                
                if filtered_notifs:
                    return {"notifications": filtered_notifs}
            await asyncio.sleep(interval)
            waited += interval
        
        return {"notifications": []}
    except Exception as e:
        print(f"Error in longpoll_notifications: {e}")
        import traceback
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail="เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์") 