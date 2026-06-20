from fastapi import WebSocket
from database.connection import db
from datetime import datetime

class ConnectionManager:

    def __init__(self):
        self.active_connections = {}
        # {
        #   email: websocket
        # }

    async def connect(
        self,
        email: str,
        websocket: WebSocket
    ):
        await websocket.accept()

        self.active_connections[email] = websocket

    def disconnect(
    self,
    email: str
    ):

        if email in self.active_connections:

            del self.active_connections[email]

            db.users.update_one(
                {
                    "email": email
                },
                {
                    "$set": {
                        "last_seen":
                        datetime.utcnow()
                    }
                }
            )

    async def broadcast(
        self,
        message: str
    ):
        for connection in self.active_connections.values():

            await connection.send_text(
                message
            )

    def get_online_users(self):
        return list(
            self.active_connections.keys()
        )

manager = ConnectionManager()