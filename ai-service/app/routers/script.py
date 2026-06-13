from fastapi import APIRouter, BackgroundTasks, HTTPException
from ..schemas.script import GenerateScriptRequest, IngestRequest

router = APIRouter()


@router.post("/generate-script", status_code=202)
async def generate_script(req: GenerateScriptRequest, background_tasks: BackgroundTasks):
    """
    Kick off script generation as a background task.
    The generator reads content, calls Claude, then POSTs back to callback_url.
    """
    if not req.callback_url:
        raise HTTPException(status_code=422, detail="callback_url is required")

    from ..services.script_generator import generate_script as _generate

    background_tasks.add_task(
        _generate,
        req.session_id,
        req.content_refs,
        req.knowledge_refs,
        req.callback_url,
    )

    return {"accepted": True, "session_id": req.session_id}


@router.post("/ingest", status_code=202)
async def ingest(req: IngestRequest, background_tasks: BackgroundTasks):
    """
    Chunk, embed, and upsert uploads to Qdrant.
    Optionally POSTs ingestion results back to callback_url.
    """
    from ..services.rag import rag_service

    background_tasks.add_task(
        _run_ingest,
        req.session_id,
        req.upload_refs,
        req.callback_url,
    )

    return {"accepted": True, "session_id": req.session_id, "count": len(req.upload_refs)}


async def _run_ingest(
    session_id: int,
    upload_refs: list[dict],
    callback_url: str | None,
) -> None:
    import httpx
    from ..services.rag import rag_service

    try:
        results = await rag_service.ingest(session_id, upload_refs)
        status = "done"
        error = None
    except Exception as exc:
        results = {}
        status = "failed"
        error = str(exc)

    if callback_url:
        payload = {
            "status": status,
            "chunks_per_upload": results,
            "error": error,
        }
        async with httpx.AsyncClient(timeout=15) as http:
            try:
                await http.post(callback_url, json=payload)
            except Exception:
                pass  # best-effort callback
