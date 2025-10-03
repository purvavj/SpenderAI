from pydantic import BaseModel, ConfigDict  
import datetime as dt
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
    date: dt.date

class TransactionUpdate(BaseModel):
    name: Optional[str] = None
    amount: Optional[float] = None
    category: Optional[str] = None
    date: Optional[dt.date] = None

    # This is the new, correct Pydantic V2 syntax
    model_config = ConfigDict(from_attributes=True) # <--- 2. Use model_config

class TransactionResponse(TransactionCreate):
    id: int
    user_id: int

    # Also update this one to the new syntax
    model_config = ConfigDict(from_attributes=True) # <--- 3. Use model_config

# Dashboard schemas
class CategorySpending(BaseModel):
    category: str
    amount: float

class DashboardResponse(BaseModel):
    total_spent: float
    category_breakdown: List[CategorySpending]