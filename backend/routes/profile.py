from fastapi import APIRouter, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from database.connection import db
from dotenv import load_dotenv
import os
from fastapi import Body, HTTPException
from bson import ObjectId
from fastapi import UploadFile, File
import shutil

load_dotenv()

router = APIRouter()

security = HTTPBearer()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")


@router.get("/my-profile")
def my_profile(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):

    token = credentials.credentials

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )
    except JWTError:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )

    user = db.users.find_one({
        "email": payload["email"]
    })

    return {
        "id": str(user["_id"]),
        "username": user["username"],
        "full_name": user.get("full_name", ""),
        "email": user["email"],
        "phone": user.get("phone", ""),
        "bio": user.get("bio", ""),
        "gender": user.get("gender", ""),
        "dob": user.get("dob", ""),
        "profile_picture": user.get("profile_picture", ""),
        "last_seen": str(
        user.get(
            "last_seen",
            ""
        )
    )
    }


@router.put("/profile")
def update_profile(
    data: dict = Body(...),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):

    token = credentials.credentials

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )
    except JWTError:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )

    db.users.update_one(
        {
            "email": payload["email"]
        },
        {
            "$set": {
                "full_name": data["full_name"],
                "phone": data["phone"],
                "bio": data["bio"],
                "gender": data["gender"],
                "dob": data["dob"]
            }
        }
    )

    return {
        "success": True,
        "message": "Profile updated successfully"
    }


@router.get("/user/{user_id}")
def get_user_profile(user_id: str):

    user = db.users.find_one({
        "_id": ObjectId(user_id)
    })

    if not user:
        return {
            "success": False
        }

    return {
        "id": str(user["_id"]),
        "username": user["username"],
        "full_name": user.get(
            "full_name",
            ""
        ),
        "email": user["email"],
        "phone": user.get(
            "phone",
            ""
        ),
        "bio": user.get(
            "bio",
            ""
        ),
        "gender": user.get(
            "gender",
            ""
        ),
        "dob": user.get(
            "dob",
            ""
        ),
        "profile_picture": user.get(
            "profile_picture",
            ""
        ),
        "last_seen": str(
        user.get(
            "last_seen",
            ""
        )
        )
        
    }


@router.post("/upload-profile-picture")
async def upload_profile_picture(
    file: UploadFile = File(...)
):

    file_path = f"uploads/{file.filename}"

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(
            file.file,
            buffer
        )

    return {
        "image_url":
            f"/uploads/{file.filename}"
    }


@router.put("/profile-picture")
def update_profile_picture(
    data: dict = Body(...),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):

    token = credentials.credentials

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )
    except JWTError:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )

    db.users.update_one(
        {
            "email": payload["email"]
        },
        {
            "$set": {
                "profile_picture":
                    data["image_url"]
            }
        }
    )

    return {
        "success": True,
        "message": "Profile picture updated"
    }


@router.delete("/profile-picture")
def delete_profile_picture(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):

    token = credentials.credentials

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )
    except JWTError:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )

    db.users.update_one(
        {
            "email": payload["email"]
        },
        {
            "$set": {
                "profile_picture": ""
            }
        }
    )

    return {
        "success": True,
        "message": "Profile picture removed"
    }