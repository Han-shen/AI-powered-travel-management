from datetime import date, datetime
from typing import Optional, List

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class SignupRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    name: str = Field(min_length=1, strip_whitespace=True)
    email: EmailStr
    password: str = Field(min_length=6)


class LoginRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


class TripCreate(BaseModel):
    destination: str
    start_date: date
    end_date: date
    travelers: int = 1
    notes: Optional[str] = ""
    budget: Optional[float] = 0


class TripUpdate(BaseModel):
    destination: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    travelers: Optional[int] = None
    notes: Optional[str] = None
    budget: Optional[float] = None


class ItineraryCreate(BaseModel):
    trip_id: str
    day: int
    time: str
    location: str
    description: str


class ItineraryUpdate(BaseModel):
    day: Optional[int] = None
    time: Optional[str] = None
    location: Optional[str] = None
    description: Optional[str] = None


class ExpenseCreate(BaseModel):
    trip_id: str
    amount: float
    category: str
    date: date
    note: Optional[str] = ""


class ExpenseUpdate(BaseModel):
    amount: Optional[float] = None
    category: Optional[str] = None
    date: Optional[date] = None
    note: Optional[str] = None


class AIGenerateRequest(BaseModel):
    destination: str
    days: int = Field(ge=1, le=30)
    interests: List[str] = []


class DocumentMeta(BaseModel):
    id: str
    trip_id: str
    tag: str
    filename: str
    original_name: str
    uploaded_at: datetime
