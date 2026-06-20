from fastapi import APIRouter
from database.connection import db
from models.user import User
from services.security import hash_password
from models.login import Login
from services.security import verify_password
from services.jwt_handler import create_access_token
from fastapi import HTTPException
import random
from services.email_service import send_otp_email

router = APIRouter()



@router.post("/register")
def register(user: User):

    existing_user = db.users.find_one({
        "email": user.email
    })

    if existing_user:
        raise HTTPException(
            status_code=409,
            detail="User already exists"
        )

    user_data = {
    "username": user.username,
    "full_name": user.full_name,
    "email": user.email,
    "password": hash_password(user.password),
    "phone": user.phone,
    "bio": user.bio,
    "gender": user.gender,
    "dob": user.dob,
    "profile_picture": ""
    }

    db.users.insert_one(user_data)

    return {
        "success": True,
        "message": "User registered successfully"
    }

@router.post("/login")
def login(user: Login):

    existing_user = db.users.find_one(
        {"email": user.email}
    )

    if not existing_user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    if not verify_password(
        user.password,
        existing_user["password"]
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid password"
        )

    token = create_access_token(
        {
            "id": str(existing_user["_id"]),
            "email": existing_user["email"]
        }
    )

    return {
        "success": True,
        "token": token
    }


@router.post("/forgot-password")
async def forgot_password(data: dict):

    user = db.users.find_one({
        "email": data["email"]
    })

    if not user:
        raise HTTPException(
            status_code=404,
            detail="Email not found"
        )

    otp = str(
        random.randint(
            100000,
            999999
        )
    )

    db.otps.update_one(
        {
            "email": data["email"]
        },
        {
            "$set": {
                "otp": otp
            }
        },
        upsert=True
    )

    await send_otp_email(
        data["email"],
        otp
    )

    return {
        "success": True,
        "message": "OTP Sent"
    }



@router.post("/verify-otp")
def verify_otp(data: dict):

    record = db.otps.find_one({
        "email": data["email"]
    })

    if not record:
        raise HTTPException(
            status_code=400,
            detail="OTP not found"
        )

    if record["otp"] != data["otp"]:
        raise HTTPException(
            status_code=400,
            detail="Invalid OTP"
        )

    return {
        "success": True
    }




@router.put("/reset-password")
def reset_password(data: dict):

    db.users.update_one(
        {
            "email": data["email"]
        },
        {
            "$set": {
                "password":
                    hash_password(
                        data["password"]
                    )
            }
        }
    )

    db.otps.delete_one({
        "email": data["email"]
    })

    return {
        "success": True,
        "message": "Password Updated"
    }


@router.post("/logout")
def logout(data: dict):
    from datetime import datetime
    db.users.update_one(
        {"email": data.get("email")},
        {"$set": {"last_seen": datetime.utcnow()}}
    )
    return {"success": True}

