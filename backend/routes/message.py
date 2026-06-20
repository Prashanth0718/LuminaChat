from fastapi import APIRouter
from database.connection import db
from datetime import datetime
from services.websocket_manager import manager
import json
from datetime import datetime
from bson import ObjectId
from fastapi import UploadFile, File
import shutil

router = APIRouter()


@router.post("/message")
async def send_message(data: dict):

    result = db.messages.insert_one({
    "conversation_id":
        data["conversation_id"],

    "sender_email":
        data["sender_email"],

    "message":
        data.get(
            "message",
            ""
        ),

    "image_url":
        data.get(
            "image_url",
            None
        ),

    "file_url":
    data.get(
        "file_url",
        None
    ),

    "file_name":
    data.get(
        "file_name",
        None
    ),

    "created_at":
        datetime.utcnow(),

    "status":
        "sent",

    "deleted":
        False,

    "edited":
        False,

    "reactions": [],
    "pinned": False,

    "reply_to":
    data.get(
        "reply_to",
        None
    ),

    "audio_url":
    data.get(
        "audio_url",
        None
    ),

    "forwarded":
    data.get(
        "forwarded",
        False
    ),

    })

    conversation = db.conversations.find_one({
    "_id": ObjectId(
        data["conversation_id"]
    )
    })

    for participant in conversation["participants"]:

        if participant != data["sender_email"]:

            db.conversations.update_one(
                {
                    "_id": ObjectId(
                        data["conversation_id"]
                    )
                },
                {
                    "$inc": {
                        f"unread_counts.{participant.replace('.', '_')}": 1
                    }
                }
            )

    print(
    "Broadcasting:",
    data.get(
        "message",
        ""
    )
    )
    timestamp = datetime.utcnow()

    await manager.broadcast(
    json.dumps({
        "id":
            str(result.inserted_id),

        "conversation_id":
            data["conversation_id"],

        "sender_email":
            data["sender_email"],

        "message":
                data.get(
            "message",
            ""
        ),

        "file_url":
        data.get(
            "file_url",
            None
        ),

        "file_name":
        data.get(
            "file_name",
            None
        ),

        "image_url":
        data.get(
            "image_url",
            None
        ),

        "created_at":
            str(timestamp),

        "status":
            "sent"
        })
    )

    return {
        "message_id":
            str(result.inserted_id)
    }

@router.get("/messages/{conversation_id}")
def get_messages(conversation_id: str):

    messages = []

    for msg in db.messages.find({
        "conversation_id": conversation_id
    }).sort("created_at", 1):

        user = db.users.find_one({
            "email":
            msg["sender_email"]
        })

        messages.append({
            "conversation_id": msg["conversation_id"],
            "id": str(msg["_id"]),
            "sender_email": msg["sender_email"],
            "sender_name":
            user["username"]
            if user
            else msg["sender_email"],
            "message": msg["message"],
            "image_url":
            msg.get(
                "image_url",
                None
            ),
            "file_url":
            msg.get(
                "file_url",
                None
            ),

            "file_name":
            msg.get(
                "file_name",
                None
            ),
            "created_at": str(
                msg["created_at"]
            ),
            "status": msg.get(
                "status",
                "sent"
            ),
            "deleted": msg.get(
                "deleted",
                False
            ),
            "edited":
            msg.get(
                "edited",
                False
            ),
            "reactions":
            msg.get(
                "reactions",
                []
            ),
            "reply_to":
            msg.get(
                "reply_to",
                None
            ),
            "pinned":
            msg.get(
                "pinned",
                False
            ),

            "audio_url":
            msg.get(
                "audio_url",
                None
            ),

            "forwarded":
            msg.get(
                "forwarded",
                False
            ),
                    })

    return messages


@router.put("/message/delivered/{message_id}")
def mark_delivered(message_id: str):

    print("DELIVERED API HIT:", message_id)
    db.messages.update_one(
        {
            "_id": ObjectId(message_id)
        },
        {
            "$set": {
                "status": "delivered"
            }
        }
    )

    return {
        "success": True
    }

@router.put(
    "/conversation/delivered/{conversation_id}"
)
async def mark_conversation_delivered(
    conversation_id: str,
    data: dict
):

    db.messages.update_many(
        {
            "conversation_id":
                conversation_id,

            "sender_email": {
                "$ne":
                data["receiver"]
            },

            "status":
                "sent"
        },
        {
            "$set": {
                "status":
                "delivered"
            }
        }
    )

    await manager.broadcast(
        json.dumps({
            "type":
                "status_update",
            "conversation_id":
                conversation_id
        })
    )

    return {
        "success": True
    }


@router.put(
    "/conversation/read/{conversation_id}"
)
async def mark_conversation_read(
    conversation_id: str,
    data: dict
):

    db.messages.update_many(
        {
            "conversation_id":
                conversation_id,

            "sender_email": {
                "$ne":
                data["reader"]
            },

            "status":
                "delivered"
        },
        {
            "$set": {
                "status":
                "read"
            }
        }
    )

    await manager.broadcast(
        json.dumps({
            "type":
                "read_update",

            "conversation_id":
                conversation_id
        })
    )

    return {
        "success": True
    }




@router.post("/upload-chat-image")
async def upload_chat_image(
    file: UploadFile = File(...)
):

    file_path = (
        f"uploads/{file.filename}"
    )

    with open(
        file_path,
        "wb"
    ) as buffer:

        shutil.copyfileobj(
            file.file,
            buffer
        )

    return {
        "image_url":
        f"/uploads/{file.filename}"
    }



@router.post("/upload-file")
async def upload_file(
    file: UploadFile = File(...)
):

    file_path = (
        f"uploads/{file.filename}"
    )

    with open(
        file_path,
        "wb"
    ) as buffer:

        shutil.copyfileobj(
            file.file,
            buffer
        )

    return {
        "file_url":
        f"/uploads/{file.filename}",
        "file_name":
        file.filename
    }

@router.put(
    "/message/delete/{message_id}"
)
async def delete_message(
    message_id: str
):

    message = db.messages.find_one({
        "_id": ObjectId(message_id)
    })

    if not message:

        return {
            "success": False
        }

    db.messages.update_one(
        {
            "_id": ObjectId(
                message_id
            )
        },
        {
            "$set": {
                "deleted": True,
                "message": "This message was deleted",
                "image_url": None,
                "reactions": []
            }
        }
    )

    return {
        "success": True
    }

@router.put(
    "/message/edit/{message_id}"
)
async def edit_message(
    message_id: str,
    data: dict
):

    db.messages.update_one(
        {
            "_id": ObjectId(
                message_id
            )
        },
        {
            "$set": {
                "message":
                    data["message"],
                "edited":
                    True
            }
        }
    )

    return {
        "success": True
    }

@router.put(
    "/message/react/{message_id}"
)
async def react_message(
    message_id: str,
    data: dict
):

    message = db.messages.find_one({
        "_id": ObjectId(message_id)
    })

    reactions = []

    for reaction in message.get(
        "reactions",
        []
    ):

        if reaction["user"] != data["user"]:

            reactions.append(
                reaction
            )

    reactions.append({
        "emoji":
            data["emoji"],

        "user":
            data["user"]
    })

    db.messages.update_one(
        {
            "_id":
                ObjectId(
                    message_id
                )
        },
        {
            "$set": {
                "reactions":
                    reactions
            }
        }
    )

    return {
        "success": True
    }


@router.put(
    "/message/pin/{message_id}"
)
async def pin_message(
    message_id: str
):

    message = db.messages.find_one({
        "_id": ObjectId(message_id)
    })

    db.messages.update_many(
        {
            "conversation_id":
            message["conversation_id"]
        },
        {
            "$set": {
                "pinned": False
            }
        }
    )

    db.messages.update_one(
        {
            "_id": ObjectId(message_id)
        },
        {
            "$set": {
                "pinned": True
            }
        }
    )

    return {
        "success": True
    }


@router.put(
    "/message/unpin/{message_id}"
)
async def unpin_message(
    message_id: str
):

    db.messages.update_one(
        {
            "_id":
            ObjectId(message_id)
        },
        {
            "$set": {
                "pinned": False
            }
        }
    )

    return {
        "success": True
    }


@router.post("/upload-audio")
async def upload_audio(
    file: UploadFile = File(...)
):

    file_path = (
        f"uploads/{file.filename}"
    )

    with open(
        file_path,
        "wb"
    ) as buffer:

        shutil.copyfileobj(
            file.file,
            buffer
        )

    return {
        "audio_url":
        f"/uploads/{file.filename}"
    }