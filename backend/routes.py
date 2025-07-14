# backend/routes.py
from fastapi import APIRouter, HTTPException, Depends, status, Body, File, UploadFile
from fastapi.security import OAuth2PasswordRequestForm
from database import get_db
from groq import Groq
import tempfile
from models import SignupForm, Token, User, ConversationCreate, MessageCreate
from auth import (
    verify_password,
    get_password_hash,
    create_access_token,
    get_current_active_user,
)
from typing import List
from datetime import timedelta

router = APIRouter()

@router.post("/api/signup", status_code=status.HTTP_201_CREATED)
async def signup(form: SignupForm = Body(...)):
    db = get_db()
    cursor = db.cursor(dictionary=True)

    cursor.execute("SELECT * FROM users WHERE email = %s", (form.email,))
    existing_user = cursor.fetchone()
    if existing_user:
        cursor.close()
        db.close()
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = get_password_hash(form.password)
    cursor.execute(
        "INSERT INTO users (email, name, hashed_password) VALUES (%s, %s, %s)",
        (form.email, form.name, hashed_password)
    )
    db.commit()
    cursor.close()
    db.close()

    return {"message": "User created successfully"}

@router.post("/api/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM users WHERE email = %s", (form_data.username,))
    user = cursor.fetchone()
    cursor.close()
    db.close()

    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(
        data={"sub": user["email"]},
        expires_delta=timedelta(minutes=30)
    )

    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/api/me", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_active_user)):
    return current_user

@router.post("/api/conversations")
def create_conversation(
    conv: ConversationCreate,
    current_user: User = Depends(get_current_active_user)
):
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute(
        "INSERT INTO conversations (title, user_email) VALUES (%s, %s)",
        (conv.title, current_user.email)
    )
    db.commit()
    conv_id = cursor.lastrowid
    cursor.close()
    db.close()
    return {"id": conv_id, "title": conv.title, "user_email": current_user.email}

@router.get("/api/conversations")
def get_conversations(
    current_user: User = Depends(get_current_active_user)
):
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute(
        "SELECT * FROM conversations WHERE user_email = %s ORDER BY created_at DESC",
        (current_user.email,)
    )
    conversations = cursor.fetchall()
    cursor.close()
    db.close()
    return conversations

@router.post("/api/messages")
def add_message(msg: MessageCreate):
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute(
        "INSERT INTO messages (conversation_id, text, is_user) VALUES (%s, %s, %s)",
        (msg.conversation_id, msg.text, msg.is_user)
    )
    db.commit()
    cursor.close()
    db.close()
    return {"message": "Message added"}

@router.get("/api/messages/{conversation_id}")
def get_messages(conversation_id: int):
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute(
        "SELECT * FROM messages WHERE conversation_id = %s ORDER BY timestamp ASC",
        (conversation_id,)
    )
    messages = cursor.fetchall()
    cursor.close()
    db.close()
    return messages

@router.post("/api/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as tmp:
            tmp.write(await file.read())
            tmp_path = tmp.name

        client = Groq(api_key="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")
        response = client.audio.transcriptions.create(
            model="whisper-large-v3",
            file=open(tmp_path, "rb"),
            language="fr",  # ou "auto" si tu préfères autodetect
        )
        return {"text": response.text}
    except Exception as e:
        print("Erreur Whisper :", e)
        raise HTTPException(status_code=500, detail="Transcription failed")
