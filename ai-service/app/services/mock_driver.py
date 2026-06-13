"""Mock avatar driver for local dev without a HeyGen key."""
from __future__ import annotations

import asyncio

from .avatar_driver import AvatarSession


class MockAvatarDriver:
    """Simulates avatar speaking by auto-setting the stop_event after a delay.
    Useful for UI dev and CI — no external API calls."""

    async def start_session(
        self, avatar_id: str, voice_id: str, background: str
    ) -> AvatarSession:
        return AvatarSession(
            provider_session_id="mock-session-id",
            access_token="mock-access-token",
            url="",
        )

    async def speak(self, text: str, stop_event: asyncio.Event | None = None) -> None:
        if stop_event is None:
            return
        words = len(text.split())
        # Simulate speaking at ~4 words/second, capped at 8 seconds
        delay = max(1.0, min(words / 4.0, 8.0))

        async def _auto_stop() -> None:
            await asyncio.sleep(delay)
            stop_event.set()

        asyncio.create_task(_auto_stop())

    async def interrupt(self) -> None:
        pass

    async def end_session(self) -> None:
        pass
