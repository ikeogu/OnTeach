from pydantic import BaseModel
from typing import Any


class GenerateScriptRequest(BaseModel):
    session_id: int
    content_refs: list[str]
    knowledge_refs: list[str] = []
    callback_url: str


class IngestRequest(BaseModel):
    session_id: int
    upload_refs: list[dict[str, Any]]
    callback_url: str | None = None


class ScriptBlock(BaseModel):
    type: str
    payload: dict[str, Any]
    bookmark_label: str | None = None
