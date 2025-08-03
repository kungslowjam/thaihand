from sqlalchemy.orm import Session
import models
import schemas
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def create_user(db: Session, user: schemas.UserCreate):
    db_user = models.User(
        email=user.email,
        username=user.username,
        hashed_password=user.password or ""
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_requests(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Request).offset(skip).limit(limit).all()

def get_request(db: Session, request_id: int):
    return db.query(models.Request).filter(models.Request.id == request_id).first()

def create_request(db: Session, request: schemas.RequestCreate, user_id: int, offer_id: int = None, user_email: str = None):
    carrier_name = None
    carrier_email = None
    carrier_phone = None
    carrier_image = None
    from_location = request.from_location
    to_location = request.to_location
    budget = request.budget
    description = request.description
    image = request.image
    if offer_id:
        offer = db.query(models.Offer).filter(models.Offer.id == offer_id).first()
        if offer:
            user = db.query(models.User).filter(models.User.id == offer.user_id).first()
            if user:
                carrier_name = user.username
                carrier_email = user.email
                carrier_phone = getattr(user, 'phone', None)
                carrier_image = getattr(user, 'image', None)
            # ถ้า request ไม่ได้กรอก ให้ใช้ค่าจาก offer
            if not from_location:
                from_location = offer.route_from
            if not to_location:
                to_location = offer.route_to
            if not budget:
                budget = getattr(offer, 'budget', None) or getattr(offer, 'price', None) or 0
            if not description:
                description = offer.description
            if not image:
                image = offer.image
    # ถ้า budget ยังเป็น None หรือ falsy ให้ default เป็น 0
    if not budget:
        budget = 0
    db_request = models.Request(
        title=request.title,
        from_location=from_location,
        to_location=to_location,
        deadline=request.deadline,
        budget=budget,
        description=description,
        image=image,
        user_id=user_id,
        user_email=user_email,  # เพิ่มบรรทัดนี้
        offer_id=offer_id,
        source=request.source if hasattr(request, 'source') else "marketplace",
        carrier_name=carrier_name,
        carrier_email=carrier_email,
        carrier_phone=carrier_phone,
        carrier_image=carrier_image
    )
    db.add(db_request)
    db.commit()
    db.refresh(db_request)
    # แจ้งเตือนผู้รับฝากหิ้ว
    if offer_id:
        offer = db.query(models.Offer).filter(models.Offer.id == offer_id).first()
        if offer:
            from datetime import datetime
            # เช็คก่อนว่ามี notification สำหรับ offer_id/user_id นี้อยู่แล้วหรือยัง
            from datetime import datetime
            current_time = datetime.now().isoformat()
            existing_notif = db.query(models.Notification).filter(
                models.Notification.user_id == offer.user_id,
                models.Notification.message == "มีคนฝากหิ้วกับคุณ",
                models.Notification.created_at >= current_time
            ).first()
            if not existing_notif:
                print(f"[DEBUG] Create notification for offer_id={offer_id}, user_id={user_id}, request_id={db_request.id}")
                notification = models.Notification(
                    user_id=offer.user_id,
                    message="มีคนฝากหิ้วกับคุณ",
                    is_read=0,
                    created_at=datetime.now().isoformat()
                )
                db.add(notification)
                db.commit()
                print(f"[DEBUG] Notification created with id={notification.id}")
    return db_request

def update_request(db: Session, request_id: int, request: schemas.RequestUpdate):
    db_request = db.query(models.Request).filter(models.Request.id == request_id).first()
    if not db_request:
        return None
    for var, value in vars(request).items():
        if value is not None:
            setattr(db_request, var, value)
    db.commit()
    db.refresh(db_request)
    return db_request

def delete_request(db: Session, request_id: int):
    db_request = db.query(models.Request).filter(models.Request.id == request_id).first()
    if not db_request:
        return None
    db.delete(db_request)
    db.commit()
    return db_request

def get_offers(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Offer).offset(skip).limit(limit).all()

def get_offer(db: Session, offer_id: int):
    return db.query(models.Offer).filter(models.Offer.id == offer_id).first()

def create_offer(db: Session, offer: schemas.OfferCreate, user_id: int):
    db_offer = models.Offer(
        route_from=offer.route_from,
        route_to=offer.route_to,
        flight_date=offer.flight_date,
        close_date=offer.close_date,
        delivery_date=offer.delivery_date,
        rates=offer.rates,
        pickup_place=offer.pickup_place,
        item_types=offer.item_types,
        restrictions=offer.restrictions,
        description=offer.description,
        contact=offer.contact,
        urgent=offer.urgent,
        image=offer.image,
        user_id=user_id
    )
    db.add(db_offer)
    db.commit()
    db.refresh(db_offer)
    return db_offer

def update_offer(db: Session, offer_id: int, offer: schemas.OfferUpdate):
    db_offer = db.query(models.Offer).filter(models.Offer.id == offer_id).first()
    if not db_offer:
        return None
    for var, value in vars(offer).items():
        if value is not None:
            setattr(db_offer, var, value)
    db.commit()
    db.refresh(db_offer)
    return db_offer

def delete_offer(db: Session, offer_id: int):
    db_offer = db.query(models.Offer).filter(models.Offer.id == offer_id).first()
    if not db_offer:
        return None
    db.delete(db_offer)
    db.commit()
    return db_offer

def get_my_orders(db: Session, user_id: int):
    try:
        requests = db.query(models.Request).filter(models.Request.user_id == user_id).all()
        # ตรวจสอบและแก้ไขข้อมูลที่ไม่สมเหตุสมผล
        for request in requests:
            # ตรวจสอบ budget
            if hasattr(request, 'budget') and (request.budget is None or request.budget <= 0):
                request.budget = None
            
            # ตรวจสอบ title
            if not request.title or request.title.strip() == "":
                request.title = "รายการฝากหิ้ว"
            
            # ตรวจสอบ description
            if not request.description or request.description.strip() == "":
                request.description = "ไม่มีรายละเอียดเพิ่มเติม"
            
            # ตรวจสอบ locations
            if not request.from_location or request.from_location.strip() == "":
                request.from_location = "ไม่ระบุ"
            if not request.to_location or request.to_location.strip() == "":
                request.to_location = "ไม่ระบุ"
        
        return requests
    except Exception as e:
        print(f"Error in get_my_orders: {e}")
        # ถ้าเกิด error เพราะ field status ยังไม่มี ให้ query โดยไม่ใช้ field status
        try:
            # Query แบบ manual โดยไม่ใช้ field status
            from sqlalchemy import text
            result = db.execute(text("SELECT * FROM requests WHERE user_id = :user_id"), {"user_id": user_id})
            requests = []
            for row in result:
                request_dict = dict(row._mapping)
                # สร้าง Request object จาก dictionary
                request = models.Request()
                for key, value in request_dict.items():
                    if hasattr(request, key):
                        setattr(request, key, value)
                requests.append(request)
            return requests
        except Exception as e2:
            print(f"Error in fallback get_my_orders: {e2}")
            return []

def get_my_carry_orders(db: Session, user_id: int):
    try:
        offers = db.query(models.Offer).filter(models.Offer.user_id == user_id).all()
        # ตรวจสอบและแก้ไขข้อมูลที่ไม่สมเหตุสมผล
        for offer in offers:
            # ตรวจสอบ title/description
            if not offer.description or offer.description.strip() == "":
                offer.description = "ไม่มีรายละเอียดเพิ่มเติม"
            
            # ตรวจสอบ locations
            if not offer.route_from or offer.route_from.strip() == "":
                offer.route_from = "ไม่ระบุ"
            if not offer.route_to or offer.route_to.strip() == "":
                offer.route_to = "ไม่ระบุ"
        
        return offers
    except Exception as e:
        print(f"Error in get_my_carry_orders: {e}")
        return []

def get_my_carry_order_detail(db: Session, user_id: int, offer_id: int):
    return db.query(models.Offer).filter(models.Offer.user_id == user_id, models.Offer.id == offer_id).first()

def get_routes(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Route).offset(skip).limit(limit).all()

def create_route(db: Session, route: schemas.RouteCreate):
    db_route = models.Route(**route.dict())
    db.add(db_route)
    db.commit()
    db.refresh(db_route)
    return db_route

def delete_route(db: Session, route_id: int):
    db_route = db.query(models.Route).filter(models.Route.id == route_id).first()
    if not db_route:
        return None
    db.delete(db_route)
    db.commit()
    return db_route

def get_notifications(db: Session, user_id: int = None):
    query = db.query(models.Notification)
    if user_id is not None:
        query = query.filter(models.Notification.user_id == user_id)
    return query.order_by(models.Notification.created_at.desc()).all()

def get_notifications_after_id(db: Session, user_id: int, last_id: int = 0):
    """ดึง notification ที่ใหม่กว่า last_id เท่านั้น"""
    return db.query(models.Notification).filter(
        models.Notification.user_id == user_id,
        models.Notification.id > last_id
    ).order_by(models.Notification.created_at.desc()).all()

def get_notifications_after_time(db: Session, user_id: int, last_time: str = "1970-01-01T00:00:00"):
    """ดึง notification ที่ใหม่กว่า last_time และ join ข้อมูล user ของคนฝาก"""
    try:
        notifications = db.query(models.Notification).filter(
            models.Notification.user_id == user_id,
            models.Notification.created_at > last_time
        ).order_by(models.Notification.created_at.asc()).all()
        
        # เพิ่มข้อมูล user ของคนฝากสำหรับแต่ละ notification
        result = []
        for notif in notifications:
            # สร้าง dictionary จาก notification object
            notif_dict = {
                'id': notif.id,
                'user_id': notif.user_id,
                'message': notif.message,
                'is_read': notif.is_read,
                'created_at': notif.created_at
            }
            
            # หา request ที่เกี่ยวข้องกับ notification นี้
            # notification.user_id คือผู้รับ notification (ผู้รับฝาก)
            # เราต้องหาผู้ฝาก (request.user_id) ที่ไม่ใช่ notification.user_id
            request = db.query(models.Request).filter(
                models.Request.offer_id.isnot(None),
                models.Request.user_id != notif.user_id  # แก้ไข: หาผู้ฝากที่ไม่ใช่ผู้รับ
            ).order_by(models.Request.id.desc()).first()
            
            if request:
                # ดึงข้อมูล user ของคนฝาก (request.user_id)
                sender_user = db.query(models.User).filter(models.User.id == request.user_id).first()
                if sender_user:
                    notif_dict['sender_name'] = sender_user.username
                    notif_dict['sender_email'] = sender_user.email
                    # ใช้ default image เพราะ field image ยังไม่มีใน database
                    notif_dict['sender_image'] = "/thaihand-logo.png"
            
            result.append(notif_dict)
        
        print(f"[DEBUG] Found {len(result)} notifications after {last_time} for user {user_id}")
        return result
    except Exception as e:
        print(f"Error in get_notifications_after_time: {e}")
        import traceback
        print(traceback.format_exc())
        return []

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first() 