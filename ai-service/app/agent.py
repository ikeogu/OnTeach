"""LiveKit Agent entrypoint — OnTeach session orchestrator.

Flow:
  1. Student connects to a LiveKit room (name: session-{session_id}-{instance_id})
  2. LiveKit dispatches a job to this agent worker
  3. Agent joins the room, creates Tavus echo avatar + OpenAI TTS
  4. Agent fetches blocks from Laravel, walks them, drives the avatar
  5. Control messages (block_started, show_media, etc.) go via LiveKit data channel
  6. Student messages (raise_hand, submit_question) come in via data channel
"""
from __future__ import annotations

import asyncio
import json
import logging
import re

import httpx
from livekit import agents
from livekit.agents import Agent, AgentSession, JobContext, WorkerOptions, RoomInputOptions
from livekit.plugins import deepgram as deepgram_plugin, simli

from .config import settings
from .services.rag import rag_service

log = logging.getLogger(__name__)

_ROOM_RE = re.compile(r"session-(\d+)-(.+)")


def _parse_room(room_name: str) -> tuple[int, str]:
    """Extract (session_id, session_instance_id) from room name."""
    m = _ROOM_RE.match(room_name)
    if not m:
        raise ValueError(f"Unrecognised room name: {room_name!r}")
    return int(m.group(1)), m.group(2)


async def _fetch_player_data(session_id: int) -> dict:
    url = f"{settings.laravel_internal_url}/api/internal/sessions/{session_id}/player-data"
    async with httpx.AsyncClient(timeout=10) as http:
        resp = await http.get(url)
        resp.raise_for_status()
        return resp.json()


async def _log_qa(session_id: int, instance_id: str, question: str, answer: str, block_id: int | None) -> None:
    try:
        url = f"{settings.laravel_internal_url}/api/internal/sessions/{session_id}/qa-log"
        async with httpx.AsyncClient(timeout=10) as http:
            await http.post(url, json={
                "session_instance_id": instance_id,
                "question": question,
                "answer": answer,
                "block_context_id": block_id,
                "input_mode": "text",
            })
    except Exception:
        pass


# ── Agent entrypoint ──────────────────────────────────────────────────────────

async def entrypoint(ctx: JobContext) -> None:
    try:
        session_id, instance_id = _parse_room(ctx.room.name)
    except ValueError as exc:
        log.error("Agent: %s", exc)
        return

    log.info("Agent joining session %s / instance %s", session_id, instance_id)

    try:
        player_data = await _fetch_player_data(session_id)
    except Exception as exc:
        log.error("Agent: failed to load player data: %s", exc)
        return

    blocks: list[dict] = player_data["blocks"]
    session_info: dict = player_data["session"]
    student_name: str = player_data.get("student_name", "")

    # Connect to room (auto-subscribe to tracks)
    await ctx.connect()

    # ── Avatar + TTS ──────────────────────────────────────────────────────────
    avatar = simli.AvatarSession(
        simli_config=simli.SimliConfig(
            api_key=settings.simli_api_key,
            face_id=settings.simli_face_id,
        ),
    )
    tts = deepgram_plugin.TTS(api_key=settings.deepgram_api_key)
    session = AgentSession(tts=tts, vad=None, turn_detection=None)

    await avatar.start(session, room=ctx.room)

    # Wait for a human participant before starting
    await ctx.wait_for_participant()
    await session.start(Agent(instructions=""), room=ctx.room)

    # ── Shared state ──────────────────────────────────────────────────────────
    msg_queue: asyncio.Queue[dict] = asyncio.Queue()
    question_queue: asyncio.Queue[str] = asyncio.Queue()
    interrupted = asyncio.Event()
    resume_ev = asyncio.Event()
    resume_ev.set()
    pending_action: dict | None = None

    # ── Data channel handler ──────────────────────────────────────────────────
    def on_data(data_packet) -> None:
        try:
            msg = json.loads(data_packet.data)
            asyncio.get_event_loop().call_soon_threadsafe(msg_queue.put_nowait, msg)
        except Exception:
            pass

    ctx.room.on("data_received", on_data)

    async def dispatch_loop() -> None:
        nonlocal pending_action
        while True:
            msg = await msg_queue.get()
            t = msg.get("type")
            if t == "raise_hand":
                pending_action = {"type": "raise_hand"}
                interrupted.set()
            elif t == "submit_question":
                await question_queue.put(msg.get("text", ""))
            elif t == "skip_to_section":
                pending_action = {"type": "skip_to_section", "block_id": msg.get("block_id")}
                interrupted.set()
            elif t == "pause":
                resume_ev.clear()
            elif t == "resume":
                resume_ev.set()

    dispatch_task = asyncio.create_task(dispatch_loop())

    # ── Helpers ───────────────────────────────────────────────────────────────
    async def send(msg: dict) -> None:
        try:
            await ctx.room.local_participant.publish_data(
                json.dumps(msg).encode(), reliable=True
            )
        except Exception as exc:
            log.warning("data send failed: %s", exc)

    async def speak_and_wait(text: str) -> None:
        interrupted.clear()
        handle = session.say(text)
        playout_task = asyncio.create_task(handle.wait_for_playout())
        interrupt_task = asyncio.create_task(interrupted.wait())
        done, pending = await asyncio.wait(
            {playout_task, interrupt_task},
            return_when=asyncio.FIRST_COMPLETED,
            timeout=120.0,
        )
        for t in pending:
            t.cancel()
            try:
                await t
            except asyncio.CancelledError:
                pass
        if not interrupted.is_set():
            await send({"type": "avatar_speaking", "state": "stop"})

    def find_block_index(block_id: int | None) -> int:
        if block_id is None:
            return -1
        for i, b in enumerate(blocks):
            if b["id"] == block_id:
                return i
        return -1

    # ── Block walking ─────────────────────────────────────────────────────────
    bookmarks = [
        {"block_id": b["id"], "label": b["bookmark_label"]}
        for b in blocks if b.get("bookmark_label")
    ]

    await send({
        "type": "session_ready",
        "student_name": student_name,
        "session_name": session_info.get("name", ""),
        "bookmarks": bookmarks,
    })

    total = len(blocks)
    i = 0
    in_qa = False

    while i < total:
        await resume_ev.wait()
        block = blocks[i]
        chapter_index = sum(1 for bm in bookmarks if bm["block_id"] <= block["id"])

        await send({
            "type": "block_started",
            "block_id": block["id"],
            "block_type": block["type"],
            "index": i,
            "total": total,
            "section_label": block.get("bookmark_label"),
            "chapter_index": chapter_index,
            "total_chapters": len(bookmarks),
        })

        # Process block
        btype = block["type"]
        payload = block.get("payload") or {}

        if btype == "spoken_text":
            await send({"type": "avatar_speaking", "state": "start"})
            await speak_and_wait(payload.get("text", ""))

        elif btype == "pause":
            await asyncio.sleep(float(payload.get("duration_seconds", 2)))

        elif btype == "media_insert":
            await send({
                "type": "show_media",
                "url": payload.get("url", ""),
                "media_type": payload.get("media_type", "image"),
                "display_duration": payload.get("display_duration", 10),
            })
            spoken = payload.get("spoken_text", "")
            if spoken:
                await send({"type": "avatar_speaking", "state": "start"})
                await speak_and_wait(spoken)
            else:
                await asyncio.sleep(float(payload.get("display_duration", 10)))

        elif btype == "action_button":
            await send({
                "type": "show_action",
                "label": payload.get("label", ""),
                "action_type": payload.get("action_type", "link"),
                "target": payload.get("target", ""),
            })

        # Handle interrupt
        if pending_action:
            action = pending_action
            pending_action = None
            interrupted.clear()

            if action["type"] == "raise_hand" and not in_qa:
                in_qa = True
                # Stop avatar mid-speech and open Q&A
                await send({"type": "avatar_speaking", "state": "stop"})
                await send({"type": "hand_raised"})

                # Drain stale questions
                while not question_queue.empty():
                    question_queue.get_nowait()

                try:
                    question = await asyncio.wait_for(question_queue.get(), timeout=300.0)
                except asyncio.TimeoutError:
                    in_qa = False
                    await send({"type": "resume", "from_block_id": block["id"]})
                    i += 1
                    continue

                # Stream RAG answer
                current_block_text = (block.get("payload") or {}).get("text", "")
                answer_parts: list[str] = []
                async for token in rag_service.stream_query(
                    session_id=session_id,
                    question=question,
                    current_block_text=current_block_text,
                ):
                    await send({"type": "qa_answer_chunk", "text": token})
                    answer_parts.append(token)

                full_answer = "".join(answer_parts)
                await send({"type": "qa_answer_done"})

                await send({"type": "avatar_speaking", "state": "start"})
                await speak_and_wait(full_answer)

                in_qa = False
                await send({"type": "resume", "from_block_id": block["id"]})
                asyncio.create_task(_log_qa(session_id, instance_id, question, full_answer, block["id"]))

                await speak_and_wait("Now let me continue from where we left off.")
                continue  # redo same block

            elif action["type"] == "skip_to_section":
                target = find_block_index(action.get("block_id"))
                if target >= 0:
                    i = target
                continue

        i += 1

    await send({"type": "session_complete"})
    dispatch_task.cancel()


# ── Worker entry ──────────────────────────────────────────────────────────────

def run_worker() -> None:
    agents.cli.run_app(
        WorkerOptions(
            entrypoint_fnc=entrypoint,
            ws_url=settings.livekit_url,
            api_key=settings.livekit_api_key,
            api_secret=settings.livekit_api_secret,
        )
    )


if __name__ == "__main__":
    run_worker()
