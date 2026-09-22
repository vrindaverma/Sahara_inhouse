from datetime import datetime, timedelta, timezone

import bcrypt
import jwt

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from app.database import get_db
from app.auth_models import User


router = APIRouter()

SECRET_KEY = "change-this-before-production"
ALGORITHM = "HS256"
TOKEN_EXPIRE_HOURS = 24

security = HTTPBearer()


# =========================
# Request Models
# =========================

class RegisterRequest(BaseModel):
    full_name: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


# =========================
# Helpers
# =========================

def hash_password(password: str) -> str:
    return bcrypt.hashpw(
        password.encode("utf-8"),
        bcrypt.gensalt()
    ).decode("utf-8")


def verify_password(
    password: str,
    password_hash: str
) -> bool:

    return bcrypt.checkpw(
        password.encode("utf-8"),
        password_hash.encode("utf-8")
    )


def create_token(user: User):

    payload = {
        "sub": str(user.id),
        "email": user.email,
        "exp": datetime.now(timezone.utc)
        + timedelta(hours=TOKEN_EXPIRE_HOURS)
    }

    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM
    )


# =========================
# Register
# =========================

@router.post("/register")
def register(
    data: RegisterRequest,
    db: Session = Depends(get_db)
):

    name = data.full_name.strip()
    email = data.email.lower().strip()

    if len(name) < 2:
        raise HTTPException(
            status_code=400,
            detail="Please enter your full name."
        )

    if len(data.password) < 8:
        raise HTTPException(
            status_code=400,
            detail="Password must contain at least 8 characters."
        )

    existing = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="An account with this email already exists."
        )

    user = User(
        full_name=name,
        email=email,
        password_hash=hash_password(data.password)
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "message": "Account created successfully.",
        "user": {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email
        }
    }


# =========================
# Login
# =========================

@router.post("/login")
def login(
    data: LoginRequest,
    db: Session = Depends(get_db)
):

    email = data.email.lower().strip()

    user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="No account found with this email."
        )

    if not verify_password(
        data.password,
        user.password_hash
    ):
        raise HTTPException(
            status_code=401,
            detail="Incorrect password."
        )

    token = create_token(user)

    return {
        "access_token": token,
        "token_type": "bearer",

        "user": {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email
        }
    }


# =========================
# Current User
# =========================

@router.get("/me")
def current_user(
    credentials: HTTPAuthorizationCredentials
    = Depends(security),

    db: Session = Depends(get_db)
):

    try:

        payload = jwt.decode(
            credentials.credentials,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        user_id = int(payload["sub"])

    except Exception:

        raise HTTPException(
            status_code=401,
            detail="Invalid or expired session."
        )

    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:

        raise HTTPException(
            status_code=401,
            detail="User no longer exists."
        )

    return {
        "id": user.id,
        "full_name": user.full_name,
        "email": user.email
    }