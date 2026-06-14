"""Internal endpoint for generating LiveKit participant tokens.

Called by Laravel during session join so we use the official Python SDK
instead of rolling our own JWT in PHP.
"""
from fastapi import APIRouter
from pydantic import BaseModel
from livekit.api import AccessToken, VideoGrants

from ..config import settings

router = APIRouter(prefix="/internal")


class TokenRequest(BaseModel):
    room: str
    identity: str
    name: str
    can_publish: bool = True
    can_subscribe: bool = True


class TokenResponse(BaseModel):
    token: str
    livekit_url: str


@router.post("/livekit-token", response_model=TokenResponse)
async def generate_token(req: TokenRequest) -> TokenResponse:
    grants = VideoGrants(
        room_join=True,
        room=req.room,
        can_publish=req.can_publish,
        can_subscribe=req.can_subscribe,
    )

    token = (
        AccessToken(settings.livekit_api_key, settings.livekit_api_secret)
        .with_identity(req.identity)
        .with_name(req.name)
        .with_grants(grants)
        .to_jwt()
    )

    return TokenResponse(token=token, livekit_url=settings.livekit_url)
