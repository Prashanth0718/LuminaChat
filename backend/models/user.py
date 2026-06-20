from pydantic import BaseModel

class User(BaseModel):
    username: str
    full_name: str
    email: str
    password: str
    phone: str
    bio: str
    gender: str
    dob: str