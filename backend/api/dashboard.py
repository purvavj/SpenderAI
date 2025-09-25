from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import date
from collections import defaultdict
from database import get_db
from models import Transaction
from schemas import DashboardResponse

router = APIRouter()

@router.get("/dashboard", response_model=DashboardResponse)
async def get_dashboard_data(user_id: int, month: str, db: Session = Depends(get_db)):
    year, month_num = map(int, month.split("-"))
    first_day = date(year, month_num, 1)
    last_day = date(year + (month_num == 12), (month_num % 12) + 1, 1)

    transactions = db.query(Transaction).filter(
        Transaction.user_id == user_id,
        Transaction.date >= first_day,
        Transaction.date < last_day
    ).all()

    category_totals = defaultdict(float)
    total_spent = 0.0

    for tx in transactions:
        category_totals[tx.category] += tx.amount
        total_spent += tx.amount

    category_breakdown = [
        {"category": cat, "amount": amt} for cat, amt in category_totals.items()
    ]

    return {"total_spent": total_spent, "category_breakdown": category_breakdown}