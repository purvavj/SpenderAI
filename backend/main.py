from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
import requests
from database import get_db
from models import User, Transaction
from sqlalchemy.orm import Session
from datetime import date
from typing import List
from collections import defaultdict 

# Import schemas from the new file
from schemas import (
    GoogleAuthRequest, UserResponse, 
    TransactionCreate, TransactionUpdate, TransactionResponse,
    CategorySpending, DashboardResponse
)

# Create FastAPI app
app = FastAPI(title="Finance App API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Test route
@app.get("/")
def read_root():
    return {"message": "Welcome to the Spender App Backend"}

# Google auth endpoint
@app.post("/auth/google", response_model=UserResponse)
async def auth_google(auth_request: GoogleAuthRequest, db: Session = Depends(get_db)):
    try:
        # Verify the access token by calling Google's tokeninfo endpoint
        response = requests.get(
            f"https://oauth2.googleapis.com/tokeninfo?access_token={auth_request.token}"
        )
        
        if response.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        token_info = response.json()
        
        # Get Google Client ID from environment
        import os
        from dotenv import load_dotenv
        load_dotenv()
        GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
        
        # Check if token is for our app
        if token_info.get('aud') != GOOGLE_CLIENT_ID:
            raise HTTPException(status_code=401, detail="Token not for this app")
        
        # Get user info
        user_email = auth_request.user_info.get('email')
        user_google_id = auth_request.user_info.get('sub')
        user_name = auth_request.user_info.get('name', '')
        user_picture = auth_request.user_info.get('picture', '')
        
        # Check if user already exists
        user = db.query(User).filter(User.google_id == user_google_id).first()
        
        if not user:
            # Create new user
            user = User(
                google_id=user_google_id,
                email=user_email,
                name=user_name,
                picture=user_picture
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            print(f"🆕 New user created: {user_email}")
        else:
            # Update existing user info (in case it changed)
            user.name = user_name
            user.picture = user_picture
            db.commit()
            db.refresh(user)
            print(f"🔄 User updated: {user_email}")
        
        return UserResponse(
            id=user.id,
            email=user.email,
            name=user.name,
            picture=user.picture
        )
        
    except Exception as e:
        print(f"Auth error: {e}")
        raise HTTPException(status_code=401, detail=str(e))

# Dashboard endpoint - Pie chart data
@app.get("/api/dashboard")
async def get_dashboard_data(
    user_id: int,
    month: str,  # Format: YYYY-MM
    db: Session = Depends(get_db)
):
    year, month_num = map(int, month.split('-'))
    
    # Get first and last day of month
    first_day = date(year, month_num, 1)
    if month_num == 12:
        last_day = date(year + 1, 1, 1)
    else:
        last_day = date(year, month_num + 1, 1)
    
    # Get all transactions for the month
    transactions = db.query(Transaction).filter(
        Transaction.user_id == user_id,
        Transaction.date >= first_day,
        Transaction.date < last_day
    ).all()
    
    # Calculate category breakdown
    category_totals = defaultdict(float)
    total_spent = 0
    
    for transaction in transactions:
        category_totals[transaction.category] += transaction.amount
        total_spent += transaction.amount
    
    # Convert to list of CategorySpending objects
    category_breakdown = [
        {"category": category, "amount": amount}
        for category, amount in category_totals.items()
    ]
    
    return {
        "total_spent": total_spent,
        "category_breakdown": category_breakdown
        # "transactions": transactions
    }

# Update the existing get_transactions endpoint to use query parameters
@app.get("/api/transactions", response_model=List[TransactionResponse])
async def get_transactions(
    user_id: int,
    month: str,
    db: Session = Depends(get_db)
):
    year, month_num = map(int, month.split('-'))
    
    # Get first and last day of month
    first_day = date(year, month_num, 1)
    if month_num == 12:
        last_day = date(year + 1, 1, 1)
    else:
        last_day = date(year, month_num + 1, 1)
    
    transactions = db.query(Transaction).filter(
        Transaction.user_id == user_id,
        Transaction.date >= first_day,
        Transaction.date < last_day
    ).order_by(Transaction.date.desc())  # Most recent first
    
    return transactions.all()

# Update the create_transaction endpoint to use query parameters
@app.post("/api/transactions", response_model=TransactionResponse)
async def create_transaction(
    transaction: TransactionCreate, 
    user_id: int,
    db: Session = Depends(get_db)
):
    db_transaction = Transaction(
        name=transaction.name,
        amount=transaction.amount,
        category=transaction.category,
        date=transaction.date,
        user_id=user_id
    )
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    return db_transaction

@app.patch("/api/transactions/{transaction_id}", response_model=TransactionResponse)
async def update_transaction(
    transaction_id: int,
    transaction: TransactionUpdate,
    user_id: int,
    db: Session = Depends(get_db)
):
    db_transaction = db.query(Transaction).filter(
        Transaction.id == transaction_id,
        Transaction.user_id == user_id
    ).first()
    
    if not db_transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    # Update fields
    for field, value in transaction.dict(exclude_unset=True).items():
        setattr(db_transaction, field, value)
    
    db.commit()
    db.refresh(db_transaction)
    return db_transaction