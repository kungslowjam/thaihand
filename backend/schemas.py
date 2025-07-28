from pydantic import BaseModel

class UserBase(BaseModel):
    username: str

class UserCreate(BaseModel):
    email: str
    username: str
    password: str | None = None

class UserOut(UserBase):
    id: int
    class Config:
        orm_mode = True

class UserLogin(BaseModel):
    username: str
    password: str 

class RequestBase(BaseModel):
    title: str
    from_location: str
    to_location: str
    deadline: str
    budget: int
    description: str
    image: str | None = None
    user_id: int
    user_email: str | None = None
    offer_id: int | None = None
    source: str = "marketplace"
    carrier_name: str | None = None
    carrier_email: str | None = None
    carrier_phone: str | None = None
    carrier_image: str | None = None

class RequestCreate(BaseModel):
    title: str
    from_location: str
    to_location: str
    deadline: str
    budget: int
    description: str
    image: str | None = None
    offer_id: int | None = None
    source: str = "marketplace"
    carrier_name: str | None = None
    carrier_email: str | None = None
    carrier_phone: str | None = None
    carrier_image: str | None = None

class RequestUpdate(BaseModel):
    title: str | None = None
    from_location: str | None = None
    to_location: str | None = None
    deadline: str | None = None
    budget: int | None = None
    description: str | None = None
    image: str | None = None
    offer_id: int | None = None
    source: str | None = None
    carrier_name: str | None = None
    carrier_email: str | None = None
    carrier_phone: str | None = None
    carrier_image: str | None = None

class RequestOut(RequestBase):
    id: int
    class Config:
        orm_mode = True 

class OfferBase(BaseModel):
    route_from: str
    route_to: str
    flight_date: str
    close_date: str
    delivery_date: str
    rates: str
    pickup_place: str
    item_types: str
    restrictions: str
    description: str
    contact: str
    urgent: str
    image: str | None = None

class OfferCreate(OfferBase):
    pass

class OfferUpdate(BaseModel):
    route_from: str | None = None
    route_to: str | None = None
    flight_date: str | None = None
    close_date: str | None = None
    delivery_date: str | None = None
    rates: str | None = None
    pickup_place: str | None = None
    item_types: str | None = None
    restrictions: str | None = None
    description: str | None = None
    contact: str | None = None
    urgent: str | None = None
    image: str | None = None

class OfferOut(OfferBase):
    id: int
    class Config:
        orm_mode = True 

class RouteBase(BaseModel):
    from_location: str
    to_location: str
    date: str
    max_weight: int
    item_types: str
    user_id: int

class RouteCreate(RouteBase):
    pass

class RouteOut(RouteBase):
    id: int
    class Config:
        orm_mode = True 

class NotificationBase(BaseModel):
    user_id: int
    message: str
    is_read: int = 0
    created_at: str

class NotificationOut(NotificationBase):
    id: int
    class Config:
        orm_mode = True 