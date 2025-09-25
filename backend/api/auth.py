from fastapi import APIRouter, HTTPException, Depends
import requests, os
from dotenv import load_dotenv
from sqlalchemy.orm import Session
from database import get_db
from models import User
from schemas import GoogleAuthRequest, UserResponse

router = APIRouter()

@router.post("/google", response_model=UserResponse)
async def auth_google(auth_request: GoogleAuthRequest, db: Session = Depends(get_db)):
    try:
        # Verify token
        response = requests.get(
            f"https://oauth2.googleapis.com/tokeninfo?access_token={auth_request.token}"
        )
        if response.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid token")
        token_info = response.json()

        load_dotenv()
        GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
        if token_info.get("aud") != GOOGLE_CLIENT_ID:
            raise HTTPException(status_code=401, detail="Token not for this app")

        # Pull user info
        user_email = auth_request.user_info.get("email")
        user_google_id = auth_request.user_info.get("sub")
        user_name = auth_request.user_info.get("name", "")
        user_picture = auth_request.user_info.get("picture", "")

        # Check/create user
        user = db.query(User).filter(User.google_id == user_google_id).first()
        if not user:
            user = User(
                google_id=user_google_id,
                email=user_email,
                name=user_name,
                picture=user_picture,
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        else:
            user.name = user_name
            user.picture = user_picture
            db.commit()
            db.refresh(user)

        return UserResponse(
            id=user.id, email=user.email, name=user.name, picture=user.picture
        )
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))