from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import date
from typing import List
from database import get_db
from models import Transaction
from schemas import TransactionCreate, TransactionUpdate, TransactionResponse

router = APIRouter()

@router.get("/transactions", response_model=List[TransactionResponse])
async def get_transactions(user_id: int, month: str, db: Session = Depends(get_db)):
    year, month_num = map(int, month.split("-"))
    first_day = date(year, month_num, 1)
    last_day = date(year + (month_num == 12), (month_num % 12) + 1, 1)

    return db.query(Transaction).filter(
        Transaction.user_id == user_id,
        Transaction.date >= first_day,
        Transaction.date < last_day
    ).order_by(Transaction.date.desc()).all()

@router.post("/transactions", response_model=TransactionResponse)
async def create_transaction(transaction: TransactionCreate, user_id: int, db: Session = Depends(get_db)):
    db_transaction = Transaction(
        name=transaction.name,
        amount=transaction.amount,
        category=transaction.category,
        date=transaction.date,
        user_id=user_id,
    )
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    return db_transaction

@router.patch("/transactions/{transaction_id}", response_model=TransactionResponse)
async def update_transaction(
    transaction_id: int,
    transaction: TransactionUpdate,
    user_id: int = Query(...),
    db: Session = Depends(get_db)
):
    print(f"DEBUG: transaction_id={transaction_id}, user_id={user_id}, transaction={transaction}")
    
    db_transaction = db.query(Transaction).filter(
        Transaction.id == transaction_id,
        Transaction.user_id == user_id,
    ).first()
    if not db_transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")

    for field, value in transaction.dict(exclude_unset=True).items():
        setattr(db_transaction, field, value)

    db.commit()
    db.refresh(db_transaction)
    return db_transaction