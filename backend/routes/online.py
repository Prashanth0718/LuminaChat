from fastapi import APIRouter
from services.websocket_manager import manager

router = APIRouter()

@router.get("/online-users")
def get_online_users():

    return manager.get_online_users()