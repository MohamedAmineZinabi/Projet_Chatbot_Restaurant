from fastapi import APIRouter, Request, HTTPException
from groq import Groq
import json
from sentence_transformers import SentenceTransformer
import faiss
from database import get_db  # import de la fonction get_db pour la connexion

router = APIRouter()

# Charger les plats
with open("chatbot_snack.json", "r", encoding="utf-8") as f:
    plats = json.load(f)

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
    cursor = db.cursor()

    # Enregistrer le message utilisateur
    cursor.execute(
        "INSERT INTO messages (conversation_id, text, is_user) VALUES (%s, %s, %s)",
        (conversation_id, user_input, True)
    )
    db.commit()

    # Embedding + recherche
    q_embedding = embedder.encode([user_input], convert_to_numpy=True)
    _, indices = index.search(q_embedding, k=3)
    context = "\n\n".join([documents[i] for i in indices[0]])

    prompt = f"""
Tu es un assistant dans un snack. Réponds toujours en français.
Utilise uniquement les informations suivantes :

{context}

---

Client : {user_input}
Chatbot :
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
