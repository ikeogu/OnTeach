import json
import re
from pathlib import Path

import anthropic
import httpx

from ..config import settings
from ..schemas.script import ScriptBlock

SYSTEM_PROMPT = """You are an expert instructional designer and scriptwriter for AI-avatar-delivered courses.

Given the provided course content, generate a structured teaching script broken into blocks.
Return ONLY a valid JSON array of blocks — no preamble, no markdown fences.

Each block must match exactly one of these types:

spoken_text:
{
  "type": "spoken_text",
  "bookmark_label": "<section title or null>",
  "payload": {
    "text": "<what the avatar says verbatim>",
    "reading_speed": 1.0,
    "voice_emphasis": "neutral",
    "auto_pause_after": true
  }
}

pause:
{
  "type": "pause",
  "bookmark_label": null,
  "payload": { "duration_seconds": 2 }
}

Guidelines:
- Break content into logical spoken segments of 60–120 words each
- Begin with a welcoming introduction block
- Add a pause block between major sections
- Set bookmark_label on the first spoken_text block of each major section
- Use voice_emphasis "warm" for encouraging moments, "energetic" for key highlights
- End with a brief summary/closing block
- Generate between 6 and 20 blocks total
- Speak naturally, as a knowledgeable tutor — not as a text reader
"""


async def _read_file_content(file_path: str) -> str:
    """Read plain-text content from a local file path."""
    path = Path(file_path)
    if not path.exists():
        return f"[File not found: {file_path}]"

    try:
        # For text files, read directly
        if path.suffix.lower() in {".txt", ".md"}:
            return path.read_text(errors="ignore")[:40_000]

        # For binary formats (PDF, DOCX, PPTX), return file name as placeholder
        # Full text extraction (pypdf, python-docx) is added in Milestone 4
        return f"[Binary file: {path.name} — text extraction will be added in Milestone 4]"
    except Exception as e:
        return f"[Read error: {e}]"


async def generate_script(
    session_id: int,
    content_refs: list[str],
    knowledge_refs: list[str],
    callback_url: str,
) -> None:
    """Run script generation and POST result back to Laravel."""
    client = anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key)

    # Build content string
    parts: list[str] = []
    for ref in content_refs:
        text = await _read_file_content(ref)
        parts.append(f"=== CONTENT FILE: {ref} ===\n{text}")
    for ref in knowledge_refs:
        text = await _read_file_content(ref)
        parts.append(f"=== KNOWLEDGE FILE: {ref} ===\n{text}")

    user_message = "\n\n".join(parts) if parts else "No content files provided. Generate a brief sample script."

    try:
        response = await client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=4096,
            system=SYSTEM_PROMPT,
            messages=[{"role": "user", "content": user_message}],
        )

        raw = response.content[0].text.strip()

        # Strip accidental markdown fences
        raw = re.sub(r"^```(?:json)?\s*", "", raw)
        raw = re.sub(r"\s*```$", "", raw)

        blocks_data = json.loads(raw)
        blocks = [ScriptBlock(**b) for b in blocks_data]

        payload = {
            "status": "done",
            "blocks": [b.model_dump() for b in blocks],
        }
    except Exception as e:
        payload = {"status": "failed", "error": str(e), "blocks": []}

    async with httpx.AsyncClient(timeout=30) as http:
        await http.post(callback_url, json=payload)
