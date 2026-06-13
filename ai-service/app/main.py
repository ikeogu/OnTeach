from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routers import script, session_ws
from .routers import rag


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure Qdrant collection exists at startup (non-fatal if Qdrant is offline)
    try:
        from .services.rag import rag_service
        await rag_service.ensure_collection()
    except Exception as exc:
        print(f"[startup] Qdrant not reachable — RAG will init lazily: {exc}")
    yield


app = FastAPI(title="OnTeach AI Service", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(script.router)
app.include_router(session_ws.router)
app.include_router(rag.router)


@app.get("/healthz")
async def health():
    return {"status": "ok"}
