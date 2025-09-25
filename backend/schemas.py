from pydantic import BaseModel
from datetime import date
from typing import List, Optional

# Auth schemas
class GoogleAuthRequest(BaseModel):
    token: str
    user_info: dict = None

class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    picture: str

# Transaction schemas
class TransactionCreate(BaseModel):
    name: str
    amount: float
    category: str
    date: date

class TransactionUpdate(BaseModel):
    name: Optional[str] = None
    amount: Optional[float] = None
    category: Optional[str] = None
    date: Optional[date] = None

class TransactionResponse(TransactionCreate):
    id: int
    user_id: int

    class Config:
        from_attributes = True

# Dashboard schemas (we'll add these next)
class CategorySpending(BaseModel):
    category: str
    amount: float

class DashboardResponse(BaseModel):
    total_spent: float
    category_breakdown: List[CategorySpending]
    # transactions: List[TransactionResponse]