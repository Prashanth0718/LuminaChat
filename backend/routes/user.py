from fastapi import APIRouter
from database.connection import db

router = APIRouter()

@router.get("/users")
def get_users():

    users = []

    for user in db.users.find():

        users.append({
        "id": str(user["_id"]),
        "username": user["username"],
        "email": user["email"],
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
    })

    return users