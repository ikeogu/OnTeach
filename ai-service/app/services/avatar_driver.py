"""Avatar driver interface — provider-swappable (HeyGen, Tavus, etc.)."""
from __future__ import annotations

import asyncio
from dataclasses import dataclass
from typing import Protocol, runtime_checkable


@dataclass
class AvatarSession:
    """Returned by start_session(); contains browser-facing credentials."""
    provider_session_id: str
    access_token: str
    url: str = ""  # HeyGen WS URL for browser SDK


@runtime_checkable
class AvatarDriverInterface(Protocol):
    async def start_session(
        self, avatar_id: str, voice_id: str, background: str
    ) -> AvatarSession: ...

    async def speak(self, text: str, stop_event: asyncio.Event | None = None) -> None:
        """Send text for avatar to speak (REPEAT mode). Returns immediately;
        the orchestrator awaits the caller-supplied stop_event for completion."""
        ...

    async def interrupt(self) -> None:
        """Stop the avatar's current utterance immediately."""
        ...

    async def end_session(self) -> None: ...
