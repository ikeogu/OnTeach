from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query, status
from ..auth import decode_student_token
from ..services.orchestrator import SessionOrchestrator

router = APIRouter()


@router.websocket("/session/{session_instance_id}")
async def session_ws(
    websocket: WebSocket,
    session_instance_id: str,
    token: str = Query(...),
):
    """Live session control channel. Orchestrates avatar delivery block-by-block."""
    try:
        claims = decode_student_token(token)
    except Exception:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    await websocket.accept()

    orchestrator = SessionOrchestrator()
    await orchestrator.run(websocket, claims)
