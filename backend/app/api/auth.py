from fastapi import APIRouter, HTTPException, status
from app.models.auth_models import UserLogin, UserSignup
from google.oauth2 import id_token
from google.auth.transport import requests
from pydantic import BaseModel
from app.core.db import users_collection
from app.core.security import hash_password, verify_password, create_access_token

router = APIRouter(
    prefix="/auth",
    tags=["auth"],
)


@router.post("/signup")
async def signup(user: UserSignup):

    existing_user = await users_collection.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered"
        )

    hashed_password = hash_password(user.password)

    new_user = {"name": user.name, "email": user.email, "password": hashed_password}

    result = await users_collection.insert_one(new_user)

    token = create_access_token(
        {"user_id": str(result.inserted_id), "email": user.email}
    )

    return {
        "message": "User created successfully",
        "access_token": token,
        "token_type": "bearer",
    }


@router.post("/login")
async def login(user: UserLogin):

    db_user = await users_collection.find_one({"email": user.email})
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid credentials"
        )

    if not verify_password(user.password, db_user["password"]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid credentials"
        )

    token = create_access_token(
        {"user_id": str(db_user["_id"]), "email": db_user["email"]}
    )

    return {
        "message": "Login successful",
        "token_type": "bearer",
        "access_token": token,
    }

class GoogleLoginRequest(BaseModel):
    credential: str

@router.post("/google")
async def google_login(data: GoogleLoginRequest):
    credential = data.credential
    
    try:
        idinfo = id_token.verify_oauth2_token(
            credential,
            requests.Request(),
        )
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google credential",
        )

    email = idinfo["email"]
    name = idinfo.get("name", email.split("@")[0])
    google_id = idinfo["sub"]

    db_user = await users_collection.find_one({"email": email})

    if not db_user:
        result = await users_collection.insert_one({
            "email": email,
            "name": name,
            "google_id": google_id,
        })
        user_id = str(result.inserted_id)
    else:
        user_id = str(db_user["_id"])

    token = create_access_token(
        {"user_id": user_id, "email": email}
    )

    return {
        "message": "Google login successful",
        "token_type": "bearer",
        "access_token": token,
        "user": {
            "id": user_id,
            "name": name,
            "email": email,
        },
    }