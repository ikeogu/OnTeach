"""RAG test endpoints — used to validate the pipeline before the avatar is wired up."""
from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from ..schemas.rag import QueryRequest, QueryResponse
from ..services.rag import rag_service

router = APIRouter(prefix="/rag", tags=["rag"])


@router.post("/query", response_model=QueryResponse)
async def query(req: QueryRequest) -> QueryResponse:
    """
    Ask a question against a session's ingested knowledge.
    Returns a full (non-streamed) answer — useful for testing the pipeline.
    """
    answer = await rag_service.query(
        session_id=req.session_id,
        question=req.question,
        current_block_text=req.current_block_text,
    )
    return QueryResponse(answer=answer, session_id=req.session_id)


@router.post("/query/stream")
async def query_stream(req: QueryRequest) -> StreamingResponse:
    """
    Same as /rag/query but streams the answer as SSE text/event-stream.
    Each event: `data: <token>\n\n`
    """

    async def event_generator():
        async for token in rag_service.stream_query(
            session_id=req.session_id,
            question=req.question,
            current_block_text=req.current_block_text,
        ):
            # Escape newlines inside a token so each SSE event is one line
            safe = token.replace("\n", " ")
            yield f"data: {safe}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")


@router.get("/collections/status")
async def collection_status():
    """Confirm the Qdrant collection exists and return its vector count."""
    from qdrant_client import AsyncQdrantClient
    from ..config import settings

    qdrant = AsyncQdrantClient(url=settings.qdrant_url)
    try:
        info = await qdrant.get_collection("onteach_chunks")
        return {
            "collection": "onteach_chunks",
            "vectors_count": info.vectors_count,
            "status": info.status,
        }
    except Exception as exc:
        return {"collection": "onteach_chunks", "error": str(exc)}
