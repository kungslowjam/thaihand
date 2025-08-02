from sqlalchemy import Column, Integer, String
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    image = Column(String, nullable=True)  # เพิ่ม field เก็บรูป profile

class Request(Base):
    __tablename__ = "requests"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    from_location = Column(String)
    to_location = Column(String)
    deadline = Column(String)
    budget = Column(Integer)
    description = Column(String)
    image = Column(String, nullable=True)
    user_id = Column(Integer)
    user_email = Column(String)  # เพิ่มบรรทัดนี้
    offer_id = Column(Integer)  # เพิ่ม field นี้
    source = Column(String, default="marketplace")  # เพิ่ม field นี้
    carrier_name = Column(String, nullable=True)
    carrier_email = Column(String, nullable=True)
    carrier_phone = Column(String, nullable=True)
    carrier_image = Column(String, nullable=True)
    status = Column(String, default="รออนุมัติ")  # เพิ่ม field status

class Offer(Base):
    __tablename__ = "offers"
    id = Column(Integer, primary_key=True, index=True)
    route_from = Column(String)
    route_to = Column(String)
    flight_date = Column(String)
    close_date = Column(String)
    delivery_date = Column(String)
    rates = Column(String)  # JSON string หรือ text
    pickup_place = Column(String)
    item_types = Column(String)  # JSON string หรือ text
    restrictions = Column(String)  # JSON string หรือ text
    description = Column(String)
    contact = Column(String)
    urgent = Column(String)
    image = Column(String, nullable=True)
    user_id = Column(Integer) 

class Route(Base):
    __tablename__ = "routes"
    id = Column(Integer, primary_key=True, index=True)
    from_location = Column(String)
    to_location = Column(String)
    date = Column(String)
    max_weight = Column(Integer)
    item_types = Column(String)  # JSON string หรือ text
    user_id = Column(Integer) 

class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer)
    message = Column(String)
    is_read = Column(Integer, default=0)
    created_at = Column(String) 