"""HeyGen Streaming Avatar driver (SDK v2 — token-based session)."""
from __future__ import annotations

import asyncio

import httpx

from ..config import settings
from .avatar_driver import AvatarSession

_BASE = "https://api.heygen.com"


class HeyGenDriver:
    """Controls a HeyGen Interactive Avatar session.

    Flow (SDK v2):
      1. Server calls /v1/streaming.create_token  → short-lived token
      2. Token is forwarded to browser via session_connecting
      3. Browser SDK creates the WebRTC session, gets a session_id
      4. Browser sends { type: "heygen_session_id", session_id: "..." } via WS
      5. Orchestrator calls set_session_id(); speak/interrupt then work normally
    """

    def __init__(self, api_key: str | None = None):
        self._api_key = api_key or settings.heygen_api_key
        self._session_id: str | None = None
        self._session_id_ev = asyncio.Event()

    def _headers(self) -> dict:
        return {"x-api-key": self._api_key, "Content-Type": "application/json"}

    def set_session_id(self, session_id: str) -> None:
        """Called by orchestrator when browser SDK reports its session_id."""
        self._session_id = session_id
        self._session_id_ev.set()

    async def start_session(
        self, avatar_id: str, voice_id: str, background: str
    ) -> AvatarSession:
        """Mint a short-lived token; the browser SDK creates the actual session."""
        async with httpx.AsyncClient(timeout=20) as http:
            resp = await http.post(
                f"{_BASE}/v1/streaming.create_token",
                headers=self._headers(),
            )
            resp.raise_for_status()
            token = resp.json()["data"]["token"]

        return AvatarSession(
            provider_session_id="",   # filled in via set_session_id() later
            access_token=token,
            url="",
        )

    async def speak(self, text: str, stop_event: asyncio.Event | None = None) -> None:
        """Wait until browser has sent us the session_id, then POST the task."""
        try:
            await asyncio.wait_for(self._session_id_ev.wait(), timeout=30.0)
        except asyncio.TimeoutError:
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
            self._session_id_ev.clear()
