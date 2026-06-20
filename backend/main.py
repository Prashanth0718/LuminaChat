from fastapi import FastAPI
from database.connection import db
from routes.auth import router as auth_router
from fastapi import Header, HTTPException
from fastapi import Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from routes.user import router as user_router
from routes.conversation import router as conversation_router
from routes.message import router as message_router
from fastapi import WebSocket
from services.websocket_manager import manager
from routes.online import (router as online_router)
from routes.profile import router as profile_router
from fastapi.staticfiles import StaticFiles


import os
load_dotenv()

app = FastAPI()
app.include_router(auth_router)
app.include_router(user_router)
app.include_router(conversation_router)
app.include_router(message_router)
app.include_router(online_router)
app.include_router(profile_router)

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")



app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173",
                    "http://localhost:5174",
                    "https://luminachat-vert.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()


app.mount(
    "/uploads",
    StaticFiles(directory="uploads"),
    name="uploads"
)

@app.get("/")
def home():
    return {"message": "Chat App Backend Running"}

@app.get("/test-db")
def test_db():
    collections = db.list_collection_names()
    return {
        "status": "connected",
        "collections": collections
    }


@app.get("/profile")
def profile(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    try:
        token = credentials.credentials

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        return {
            "success": True,
            "user": payload
        }

    except JWTError:
        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )


@app.websocket("/ws/{email}")
async def websocket_endpoint(
    websocket: WebSocket,
    email: str
):

    await manager.connect(
        email,
        websocket
    )

    try:

        while True:

            data = await websocket.receive_text()

            await manager.broadcast(
                data
            )

    except:

        manager.disconnect(
            email
        )