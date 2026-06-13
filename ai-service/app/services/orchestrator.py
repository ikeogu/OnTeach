"""Session orchestrator — the block-walking state machine.

Architecture:
  - Main loop: walks blocks sequentially, awaits speaking completion.
  - Receiver task: pumps incoming WS frames into _msg_queue.
  - Dispatcher task: drains _msg_queue and updates shared events/queues.

Interrupt contract:
  raise_hand / skip_to_section both set _interrupted_ev, which unblocks
  _speak_and_wait early. The main loop checks _pending_action after each
  _process_block and handles the interrupt before advancing.
"""
from __future__ import annotations

import asyncio
import logging

import httpx
from fastapi import WebSocket, WebSocketDisconnect

from ..config import settings
from .avatar_driver import AvatarDriverInterface
from .heygen_driver import HeyGenDriver
from .mock_driver import MockAvatarDriver

log = logging.getLogger(__name__)


def _make_driver() -> AvatarDriverInterface:
    if settings.heygen_api_key:
        return HeyGenDriver()
    log.warning("HEYGEN_API_KEY not set — using MockAvatarDriver")
    return MockAvatarDriver()


async def _fetch_player_data(session_id: int) -> dict:
    url = f"{settings.laravel_internal_url}/api/internal/sessions/{session_id}/player-data"
    async with httpx.AsyncClient(timeout=10) as http:
        resp = await http.get(url)
        resp.raise_for_status()
        return resp.json()


class SessionOrchestrator:
    """One instance per WebSocket connection; never shared."""

    def __init__(self) -> None:
        self._msg_queue: asyncio.Queue[dict] = asyncio.Queue()
        self._question_queue: asyncio.Queue[str] = asyncio.Queue()

        self._stop_ev: asyncio.Event | None = None
        self._interrupted_ev = asyncio.Event()
        self._webrtc_ready_ev = asyncio.Event()
        self._resume_ev = asyncio.Event()
        self._resume_ev.set()

        self._pending_action: dict | None = None
        self._in_qa = False

        # Set on run()
        self._session_id: int = 0
        self._session_instance_id: str = ""
        self._blocks: list[dict] = []
        self._driver: AvatarDriverInterface | None = None

    # ── Public entry point ──────────────────────────────────────────────────

    async def run(self, ws: WebSocket, claims: dict) -> None:
        self._session_id = int(claims["session_id"])
        self._session_instance_id = str(claims.get("session_instance_id", ""))

        try:
            player_data = await _fetch_player_data(self._session_id)
        except Exception as exc:
            await ws.send_json({"type": "error", "message": f"Failed to load session: {exc}"})
            return

        self._blocks = player_data["blocks"]
        self._driver = _make_driver()

        recv_task = asyncio.create_task(self._recv_loop(ws))
        dispatch_task = asyncio.create_task(self._dispatch_loop())

        try:
            await self._main_loop(ws, player_data)
        except (WebSocketDisconnect, RuntimeError):
            # RuntimeError is raised by Starlette when sending on an already-closed socket
            # (client navigated away mid-send). Treat it the same as a clean disconnect.
            pass
        except Exception as exc:
            log.exception("Orchestrator error: %s", exc)
            try:
                await ws.send_json({"type": "error", "message": str(exc)})
            except Exception:
                pass
        finally:
            recv_task.cancel()
            dispatch_task.cancel()
            if self._driver:
                await self._driver.end_session()

    # ── Background tasks ─────────────────────────────────────────────────────

    async def _recv_loop(self, ws: WebSocket) -> None:
        try:
            while True:
                data = await ws.receive_json()
                await self._msg_queue.put(data)
        except (WebSocketDisconnect, Exception):
            await self._msg_queue.put({"type": "_disconnect"})

    async def _dispatch_loop(self) -> None:
        while True:
            msg = await self._msg_queue.get()
            await self._handle_msg(msg)

    async def _handle_msg(self, msg: dict) -> None:
        t = msg.get("type")

        if t == "avatar_event":
            if msg.get("event") == "AVATAR_STOP_TALKING" and self._stop_ev:
                self._stop_ev.set()

        elif t == "webrtc_ready":
            self._webrtc_ready_ev.set()

        elif t == "raise_hand":
            if not self._in_qa:
                self._pending_action = {"type": "raise_hand"}
                self._interrupted_ev.set()
                if self._stop_ev:
                    self._stop_ev.set()

        elif t == "submit_question":
            await self._question_queue.put(msg.get("text", ""))

        elif t == "skip_to_section":
            self._pending_action = {
                "type": "skip_to_section",
                "block_id": msg.get("block_id"),
            }
            self._interrupted_ev.set()
            if self._stop_ev:
                self._stop_ev.set()

        elif t == "pause":
            self._resume_ev.clear()

        elif t == "resume":
            self._resume_ev.set()

        elif t == "heartbeat":
            pass

    # ── Main block-walking loop ──────────────────────────────────────────────

    async def _main_loop(self, ws: WebSocket, player_data: dict) -> None:
        assert self._driver is not None
        session_info = player_data["session"]
        blocks = self._blocks

        bookmarks = [
            {"block_id": b["id"], "label": b["bookmark_label"]}
            for b in blocks
            if b.get("bookmark_label")
        ]

        # Provision avatar session
        avatar_session = await self._driver.start_session(
            avatar_id=session_info.get("avatar_id", "default"),
            voice_id=session_info.get("voice_id", "default"),
            background=session_info.get("background", "neutral_studio"),
        )

        # Handshake: send credentials, wait for browser WebRTC ready
        await ws.send_json({
            "type": "session_connecting",
            "heygen_access_token": avatar_session.access_token,
            "heygen_session_id": avatar_session.provider_session_id,
            "heygen_url": avatar_session.url,
            "student_name": player_data.get("student_name", ""),
            "session_name": session_info.get("name", ""),
        })

        try:
            await asyncio.wait_for(self._webrtc_ready_ev.wait(), timeout=30.0)
        except asyncio.TimeoutError:
            await ws.send_json({"type": "error", "message": "WebRTC connection timed out"})
            return

        await ws.send_json({"type": "session_ready", "bookmarks": bookmarks})

        # Walk blocks (while loop so we can re-enter same block after raise_hand)
        total = len(blocks)
        i = 0
        while i < total:
            await self._resume_ev.wait()

            block = blocks[i]
            chapter_index = sum(1 for bm in bookmarks if bm["block_id"] <= block["id"])

            await ws.send_json({
                "type": "block_started",
                "block_id": block["id"],
                "block_type": block["type"],
                "index": i,
                "total": total,
                "section_label": block.get("bookmark_label"),
                "chapter_index": chapter_index,
                "total_chapters": len(bookmarks),
            })

            await self._process_block(ws, block)

            # Handle interrupt that fired during this block
            if self._pending_action:
                action = self._pending_action
                self._pending_action = None
                self._interrupted_ev.clear()

                if action["type"] == "raise_hand":
                    self._in_qa = True
                    await self._handle_raise_hand(ws, block["id"])
                    self._in_qa = False
                    # Brief acknowledgement before re-speaking same block
                    await self._speak_and_wait(ws, "Now, let me continue from where we left off.")
                    continue  # redo same block index

                elif action["type"] == "skip_to_section":
                    target = self._find_block_index(action.get("block_id"))
                    if target >= 0:
                        i = target
                    continue

            i += 1

        await ws.send_json({"type": "session_complete"})

    # ── Block processing ─────────────────────────────────────────────────────

    async def _process_block(self, ws: WebSocket, block: dict) -> None:
        btype = block["type"]
        payload = block.get("payload") or {}

        if btype == "spoken_text":
            await self._speak_and_wait(ws, payload.get("text", ""))

        elif btype == "pause":
            await asyncio.sleep(float(payload.get("duration_seconds", 2)))

        elif btype == "media_insert":
            await ws.send_json({
                "type": "show_media",
                "url": payload.get("url", ""),
                "media_type": payload.get("media_type", "image"),
                "display_duration": payload.get("display_duration", 10),
            })
            spoken = payload.get("spoken_text", "")
            if spoken:
                await self._speak_and_wait(ws, spoken)
            else:
                await asyncio.sleep(float(payload.get("display_duration", 10)))

        elif btype == "action_button":
            await ws.send_json({
                "type": "show_action",
                "label": payload.get("label", ""),
                "action_type": payload.get("action_type", "link"),
                "target": payload.get("target", ""),
            })

    async def _speak_and_wait(self, ws: WebSocket, text: str) -> None:
        """Send text to avatar and wait for AVATAR_STOP_TALKING or interrupt."""
        assert self._driver is not None
        self._stop_ev = asyncio.Event()
        self._interrupted_ev.clear()

        await self._driver.speak(text, stop_event=self._stop_ev)
        await ws.send_json({"type": "avatar_speaking", "state": "start"})

        stop_task = asyncio.create_task(self._stop_ev.wait())
        interrupt_task = asyncio.create_task(self._interrupted_ev.wait())

        done, pending = await asyncio.wait(
            {stop_task, interrupt_task},
            return_when=asyncio.FIRST_COMPLETED,
            timeout=120.0,
        )
        for t in pending:
            t.cancel()
            try:
                await t
            except asyncio.CancelledError:
                pass

        self._stop_ev = None

        if not self._interrupted_ev.is_set():
            await ws.send_json({"type": "avatar_speaking", "state": "stop"})

    # ── Raise-hand Q&A flow ──────────────────────────────────────────────────

    async def _handle_raise_hand(self, ws: WebSocket, block_id: int) -> None:
        assert self._driver is not None

        await self._driver.interrupt()
        await ws.send_json({"type": "avatar_speaking", "state": "stop"})
        await ws.send_json({"type": "hand_raised"})

        # Drain stale questions that arrived before this raise_hand
        while not self._question_queue.empty():
            self._question_queue.get_nowait()

        # Wait for student to type a question (5-minute window)
        try:
            question = await asyncio.wait_for(self._question_queue.get(), timeout=300.0)
        except asyncio.TimeoutError:
            await ws.send_json({"type": "resume", "from_block_id": block_id})
            return

        # Stream RAG answer token-by-token
        from .rag import rag_service
        answer_parts: list[str] = []
        current_block_text = ""
        for b in self._blocks:
            if b["id"] == block_id:
                current_block_text = (b.get("payload") or {}).get("text", "")
                break

        async for token in rag_service.stream_query(
            session_id=self._session_id,
            question=question,
            current_block_text=current_block_text,
        ):
            await ws.send_json({"type": "qa_answer_chunk", "text": token})
            answer_parts.append(token)

        full_answer = "".join(answer_parts)
        await ws.send_json({"type": "qa_answer_done"})

        # Avatar voices the answer
        await self._speak_and_wait(ws, full_answer)

        await ws.send_json({"type": "resume", "from_block_id": block_id})

        # Log to Laravel (best-effort, non-blocking)
        asyncio.create_task(
            self._log_qa(question, full_answer, block_id)
        )

    # ── Helpers ──────────────────────────────────────────────────────────────

    def _find_block_index(self, block_id: int | None) -> int:
        if block_id is None:
            return -1
        for idx, b in enumerate(self._blocks):
            if b["id"] == block_id:
                return idx
        return -1

    async def _log_qa(self, question: str, answer: str, block_id: int | None) -> None:
        try:
            url = (
                f"{settings.laravel_internal_url}/api/internal"
                f"/sessions/{self._session_id}/qa-log"
            )
            async with httpx.AsyncClient(timeout=10) as http:
                await http.post(url, json={
                    "session_instance_id": self._session_instance_id,
                    "question": question,
                    "answer": answer,
                    "block_context_id": block_id,
                    "input_mode": "text",
                })
        except Exception:
            pass
