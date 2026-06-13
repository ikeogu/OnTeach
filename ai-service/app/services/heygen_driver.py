"""HeyGen Streaming Avatar driver."""
from __future__ import annotations

import asyncio

import httpx

from ..config import settings
from .avatar_driver import AvatarSession

_BASE = "https://api.heygen.com"

_BACKGROUND_MAP = {
    "neutral_studio": "Transparent",
    "modern_office": "office",
    "classroom": "classroom",
    "solid_blue": "solid_color_blue",
}


class HeyGenDriver:
    """Controls a HeyGen LiveAvatar session via REST API."""

    def __init__(self, api_key: str | None = None):
        self._api_key = api_key or settings.heygen_api_key
        self._session_id: str | None = None

    def _headers(self) -> dict:
        return {"x-api-key": self._api_key, "Content-Type": "application/json"}

    async def start_session(
        self, avatar_id: str, voice_id: str, background: str
    ) -> AvatarSession:
        payload = {
            "quality": "high",
            "avatar_name": avatar_id,
            "voice": {"voice_id": voice_id},
            "background": {"type": "color", "value": "#1a1a2e"}
            if background == "solid_blue"
            else {"type": "preset", "value": _BACKGROUND_MAP.get(background, "Transparent")},
        }
        async with httpx.AsyncClient(timeout=20) as http:
            resp = await http.post(
                f"{_BASE}/v1/streaming.new",
                headers=self._headers(),
                json=payload,
            )
            resp.raise_for_status()
            data = resp.json()["data"]

        self._session_id = data["session_id"]
        return AvatarSession(
            provider_session_id=data["session_id"],
            access_token=data["access_token"],
            url=data.get("url", ""),
        )

    async def speak(self, text: str, stop_event: asyncio.Event | None = None) -> None:
        """Fire-and-forget: POST text to HeyGen. Browser signals stop via WS."""
        if not self._session_id:
            return
        async with httpx.AsyncClient(timeout=10) as http:
            await http.post(
                f"{_BASE}/v1/streaming.task",
                headers=self._headers(),
                json={
                    "session_id": self._session_id,
                    "text": text,
                    "task_type": "repeat",
                },
            )
        # stop_event is set by the orchestrator dispatcher when the browser
        # sends { type: "avatar_event", event: "AVATAR_STOP_TALKING" }

    async def interrupt(self) -> None:
        if not self._session_id:
            return
        async with httpx.AsyncClient(timeout=5) as http:
            await http.post(
                f"{_BASE}/v1/streaming.interrupt",
                headers=self._headers(),
                json={"session_id": self._session_id},
            )

    async def end_session(self) -> None:
        if not self._session_id:
            return
        try:
            async with httpx.AsyncClient(timeout=5) as http:
                await http.post(
                    f"{_BASE}/v1/streaming.stop",
                    headers=self._headers(),
                    json={"session_id": self._session_id},
                )
        except Exception:
            pass
        finally:
            self._session_id = None
