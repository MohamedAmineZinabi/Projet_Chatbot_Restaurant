from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class User(BaseModel):
    email: str
    name: str
    disabled: Optional[bool] = None

class UserInDB(User):
    hashed_password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class SignupForm(BaseModel):
    email: str
    password: str
    name: str

class ConversationCreate(BaseModel):
    title: str

class MessageCreate(BaseModel):
    conversation_id: int
    text: str
    is_user: bool
