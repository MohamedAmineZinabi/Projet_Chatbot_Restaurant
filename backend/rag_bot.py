from fastapi import APIRouter, Request, HTTPException
from groq import Groq
import json
from sentence_transformers import SentenceTransformer
import faiss
from database import get_db

router = APIRouter()

# Charger les plats
with open("chatbot_snack.json", "r", encoding="utf-8") as f:
    data = json.load(f)

plats = data["plats"]
documents = [json.dumps(p, ensure_ascii=False) for p in plats if p.get("disponible", True)]
embedder = SentenceTransformer("all-MiniLM-L6-v2")
doc_embeddings = embedder.encode(documents, convert_to_numpy=True)

dim = doc_embeddings.shape[1]
index = faiss.IndexFlatL2(dim)
index.add(doc_embeddings)

client = Groq(api_key="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")

@router.post("/api/chat-rag")
async def chat_with_rag(request: Request):
    data = await request.json()
    user_input = data.get("message", "")
    conversation_id = data.get("conversation_id")

    if not user_input.strip():
        return {"response": "Je n'ai pas compris votre message."}
    if conversation_id is None:
        raise HTTPException(status_code=400, detail="conversation_id est requis")

    db = get_db()
    cursor = db.cursor(dictionary=True)

    # Enregistrer le message utilisateur
    cursor.execute(
        "INSERT INTO messages (conversation_id, text, is_user) VALUES (%s, %s, %s)",
        (conversation_id, user_input, True)
    )
    db.commit()

    # Recherche contextuelle
    q_embedding = embedder.encode([user_input], convert_to_numpy=True)
    _, indices = index.search(q_embedding, k=3)
    context = "\n\n".join([documents[i] for i in indices[0]])

    # Récupérer l'historique de la conversation
    cursor.execute(
        "SELECT text, is_user FROM messages WHERE conversation_id = %s ORDER BY timestamp ASC",
        (conversation_id,)
    )
    history_rows = cursor.fetchall()

    # Construire l'historique formaté
    history = ""
    for row in history_rows:
        if row["is_user"]:
            history += f"Utilisateur : {row['text']}\n"
        else:
            history += f"Assistant : {row['text']}\n"

    # Prompt amélioré avec historique
    prompt = f"""
Tu es un assistant virtuel qui aide les clients à passer commande dans un snack.

Voici les plats disponibles :
{context}

Ta mission est de guider le client étape par étape, en posant une question à la fois, et en gardant le fil de la conversation.
Lorsque tu demandes la table, pose la question ainsi : "À quelle table etes-vous assis ?".
Quand tous les éléments sont réunis (plat, viande, taille, légumes, sauces, table), résume la commande comme ceci :
< Pour résumer votre commande : Plat : ... , Viande : ... , Taille : ... , Légumes : ... , Sauces : ... , Table : ... .> et propose la confirmation en disant au client de taper "je confirme".

Ne parle jamais entre parenthèses. N'utilise jamais de remarque, de note interne, de commentaire ou d'explication entre parenthèses ou autrement. Adresse-toi uniquement au client, de façon naturelle et amicale, comme un serveur humain. Ne dis jamais 'Remarque :, Utilisateur : ou Assistant :' ou toute autre note interne.

Historique de la conversation :
{history}
Assistant :
"""

    completion = client.chat.completions.create(
        model="meta-llama/llama-4-scout-17b-16e-instruct",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7,
        max_completion_tokens=512,
        top_p=1
    )

    bot_response = completion.choices[0].message.content

    # Enregistrer la réponse du bot
    cursor.execute(
        "INSERT INTO messages (conversation_id, text, is_user) VALUES (%s, %s, %s)",
        (conversation_id, bot_response, False)
    )
    db.commit()
    cursor.close()
    db.close()

    return {"response": bot_response}
