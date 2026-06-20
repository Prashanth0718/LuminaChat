from fastapi import APIRouter
from database.connection import db
from bson import ObjectId


router = APIRouter()

@router.post("/conversation")
def create_conversation(data: dict):

    participants = sorted(data["participants"])

    existing = db.conversations.find_one({
        "participants": participants
    })

    if existing:
        return {
            "conversation_id": str(existing["_id"])
        }

    result = db.conversations.insert_one({
    "participants": participants,

    "unread_counts": {
    participants[0].replace(".", "_"): 0,
    participants[1].replace(".", "_"): 0
    }
    })

    return {
        "conversation_id": str(result.inserted_id)
    }


@router.post("/group")
def create_group(
    data: dict
):

    participants = data["participants"]

    unread_counts = {}

    for participant in participants:

        unread_counts[
            participant.replace(
                ".",
                "_"
            )
        ] = 0

    result = db.conversations.insert_one({

        "name":
            data["name"],

        "is_group":
            True,

        "created_by":
            data["created_by"],

        "participants":
            participants,

        "unread_counts":
            unread_counts

    })

    return {
        "conversation_id":
            str(
                result.inserted_id
            )
    }


@router.get(
    "/conversations/{email}"
)
def get_conversations(
    email: str
):

    conversations = []

    for convo in db.conversations.find({
        "participants": email
    }):

        conversations.append({

            "id":
                str(
                    convo["_id"]
                ),

            "name":
                convo.get(
                    "name"
                ),

            "is_group":
                convo.get(
                    "is_group",
                    False
                ),

            "participants":
                convo[
                    "participants"
                ]

        })

    return conversations


@router.put(
    "/conversation/reset-unread/{conversation_id}"
)
def reset_unread(
    conversation_id: str,
    data: dict
):

    db.conversations.update_one(
        {
            "_id": ObjectId(
                conversation_id
            )
        },
        {
            "$set": {
                f"unread_counts.{data['email'].replace('.', '_')}": 0
            }
        }
    )

    return {
        "success": True
    }




@router.get("/unread-counts/{email}")
def get_unread_counts(email: str):

    data = {}

    conversations = db.conversations.find({
        "participants": email
    })

    for convo in conversations:

        unread = (
            convo.get(
                "unread_counts",
                {}
            ).get(
                email.replace(".", "_"),
                0
            )
        )

        if convo.get(
            "is_group",
            False
        ):

            data[
                str(convo["_id"])
            ] = unread

        else:

            other_user = None

            for participant in convo["participants"]:

                if participant != email:

                    other_user = participant
                    break

            if other_user:

                data[
                    other_user
                ] = unread

    return data


@router.put(
    "/group/add-member/{group_id}"
)
def add_member(
    group_id: str,
    data: dict
):

    db.conversations.update_one(
        {
            "_id":
            ObjectId(group_id)
        },
        {
            "$addToSet": {
                "participants":
                data["email"]
            },

            "$set": {
                f"unread_counts.{data['email'].replace('.', '_')}": 0
            }
        }
    )

    return {
        "success": True
    }

@router.put("/group/remove-member/{group_id}")
def remove_member(
    group_id: str,
    data: dict
):

    db.conversations.update_one(
        {
            "_id": ObjectId(group_id)
        },
        {
            "$pull": {
                "participants":
                    data["email"]
            }
        }
    )

    return {
        "success": True
    }

@router.put("/group/{group_id}/name")
def update_group_name(group_id: str, data: dict):
    new_name = data.get("name")
    if not new_name:
        return {"success": False, "message": "Name is required"}
    
    db.conversations.update_one(
        {"_id": ObjectId(group_id)},
        {"$set": {"name": new_name}}
    )
    return {"success": True}


