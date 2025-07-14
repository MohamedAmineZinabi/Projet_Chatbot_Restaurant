from fastapi import FastAPI
from middleware_cors import add_cors_middleware
from database import init_db
from routes import router as api_router
from rag_bot import router as rag_router

app = FastAPI()

# Middleware CORS
add_cors_middleware(app)

# Initialisation de la base de données
init_db()

# Inclusion des routes
app.include_router(api_router)
app.include_router(rag_router)
