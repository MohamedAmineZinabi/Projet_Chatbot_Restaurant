# backend/routes.py
from fastapi import APIRouter, HTTPException, Depends, status, Body, File, UploadFile, Request, Response, WebSocket, WebSocketDisconnect
from fastapi.security import OAuth2PasswordRequestForm
from order_extractor import extract_order_info
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
import asyncio

router = APIRouter()

chef_connections = []

@router.websocket("/ws/commandes")
async def websocket_commandes(websocket: WebSocket):
    await websocket.accept()
    chef_connections.append(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        chef_connections.remove(websocket)

async def notify_chefs_new_commande(commande):
    for ws in chef_connections:
        try:
            await ws.send_json({"type": "new_commande", "commande": commande})
        except Exception:
            pass

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
    return conversations  # status sera inclus

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

@router.post("/api/confirmer-commande")
async def confirmer_commande(
    request: Request,
    current_user: User = Depends(get_current_active_user)
):
    data = await request.json()
    user_input = data.get("message", "")
    conversation_id = data.get("conversation_id")

    if not user_input.strip():
        raise HTTPException(status_code=400, detail="Message vide.")
    if not conversation_id:
        raise HTTPException(status_code=400, detail="conversation_id manquant.")

    # Si l'utilisateur tape "je confirme", on reconstitue la commande à partir de l'historique
    if "je confirme" in user_input.lower() or "je valide" in user_input.lower():
        db = get_db()
        cursor = db.cursor(dictionary=True)
        # On récupère le dernier message de l'assistant AVANT le message 'je confirme'
        cursor.execute(
            """
            SELECT text FROM messages
            WHERE conversation_id = %s AND is_user = FALSE AND id < (
                SELECT id FROM messages
                WHERE conversation_id = %s AND is_user = TRUE
                ORDER BY id DESC LIMIT 1
            )
            ORDER BY id DESC LIMIT 1
            """,
            (conversation_id, conversation_id)
        )
        last_bot_msg = cursor.fetchone()
        if last_bot_msg:
            info = extract_order_info(last_bot_msg["text"])
            print("Résumé analysé :", last_bot_msg["text"])
            print("Infos extraites :", info)
        else:
            info = {}
        cursor.close()
        db.close()
        confirmation = True
    else:
        info = extract_order_info(user_input)
        confirmation = info["confirmation"]

    if not confirmation:
        return {"response": "Merci de confirmer votre commande en disant 'je confirme' ou 'je valide'."}

    if not all([info["plat"], info["viande"], info["taille"], info["table"]]):
        return {"response": "Commande incomplète. Veuillez préciser plat, viande, taille et numéro de table."}

    legumes_str = ", ".join(info["legumes"]) if info["legumes"] else None
    sauces_str = ", ".join(info["sauces"]) if info["sauces"] else None

    db = get_db()
    cursor = db.cursor()

    try:
        cursor.execute("""
            INSERT INTO commandes (nom, type_viande, legumes, sauces, taille, table_numero, conversation_id, user_email)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            info["plat"],
            info["viande"],
            legumes_str,
            sauces_str,
            info["taille"],
            info["table"],
            conversation_id,
            current_user.email
        ))
        commande_data = {
            "id": cursor.lastrowid,
            "nom": info["plat"],
            "type_viande": info["viande"],
            "legumes": legumes_str,
            "sauces": sauces_str,
            "taille": info["taille"],
            "table_numero": info["table"],
            "conversation_id": conversation_id,
            "user_email": current_user.email
        }
        asyncio.create_task(notify_chefs_new_commande(commande_data))
        response_text = f"Commande enregistrée avec succès : {info['plat']} au {info['viande']} avec {sauces_str or 'aucune sauce'} et {legumes_str or 'aucun légume'} (taille {info['taille']}), table {info['table']}."
        # Mettre à jour le statut SEULEMENT si la commande est bien enregistrée
        if "commande enregistrée" in response_text.lower() or "commande confirmée" in response_text.lower():
            print("Avant UPDATE status, conversation_id =", conversation_id)
            cursor.execute("UPDATE conversations SET status = %s WHERE id = %s", ("terminee", conversation_id))
            print("UPDATE status for conversation", conversation_id)
            cursor.execute("SELECT status FROM conversations WHERE id = %s", (conversation_id,))
            print("Nouveau statut en base :", cursor.fetchone())
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erreur en base de données : {str(e)}")
    finally:
        cursor.close()
        db.close()

    return {
        "response": response_text
    }

@router.get("/api/commandes")
def get_commandes(current_user: User = Depends(get_current_active_user)):
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("""
        SELECT id, nom, type_viande, legumes, sauces, taille, table_numero, user_email
        FROM commandes
        WHERE user_email = %s
        ORDER BY id ASC
    """, (current_user.email,))
    commandes = cursor.fetchall()
    cursor.close()
    db.close()
    return commandes

@router.delete("/api/commandes/{commande_id}")
def delete_commande(commande_id: int):
    db = get_db()
    cursor = db.cursor()
    cursor.execute("DELETE FROM commandes WHERE id = %s", (commande_id,))
    db.commit()
    cursor.close()
    db.close()
    return Response(status_code=204)