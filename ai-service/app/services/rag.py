"""RAG pipeline: ingest uploads into Qdrant, query at session time."""
import asyncio
import uuid
from typing import AsyncIterator

import anthropic
from openai import AsyncOpenAI
from qdrant_client import AsyncQdrantClient
from qdrant_client.models import (
    Distance,
    FieldCondition,
    Filter,
    MatchValue,
    PointStruct,
    VectorParams,
)

from ..config import settings
from .chunker import chunk_text
from .text_extractor import extract_text

COLLECTION = "onteach_chunks"
VECTOR_SIZE = 1536  # OpenAI text-embedding-3-small
EMBED_MODEL = "text-embedding-3-small"
TOP_K = 5

RAG_SYSTEM = """\
You are a knowledgeable, friendly tutor answering a student question mid-session.
Use only the provided context excerpts to answer. Be concise (2–4 sentences).
If the context doesn't contain enough information, say so briefly and offer to cover it
later. Never make up facts not present in the context.
"""


class RAGService:
    """Singleton-style service; instantiate once at startup."""

    def __init__(self) -> None:
        self._qdrant: AsyncQdrantClient | None = None
        self._openai: AsyncOpenAI | None = None
        self._anthropic: anthropic.AsyncAnthropic | None = None

    # ── lazy clients ──────────────────────────────────────────────────────

    def _get_qdrant(self) -> AsyncQdrantClient:
        if self._qdrant is None:
            self._qdrant = AsyncQdrantClient(url=settings.qdrant_url)
        return self._qdrant

    def _get_openai(self) -> AsyncOpenAI:
        if self._openai is None:
            self._openai = AsyncOpenAI(api_key=settings.openai_api_key)
        return self._openai

    def _get_anthropic(self) -> anthropic.AsyncAnthropic:
        if self._anthropic is None:
            self._anthropic = anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key)
        return self._anthropic

    # ── collection bootstrap ──────────────────────────────────────────────

    async def ensure_collection(self) -> None:
        qdrant = self._get_qdrant()
        existing = {c.name for c in await qdrant.get_collections()}
        if COLLECTION not in existing:
            await qdrant.create_collection(
                collection_name=COLLECTION,
                vectors_config=VectorParams(size=VECTOR_SIZE, distance=Distance.COSINE),
            )

    # ── embedding ─────────────────────────────────────────────────────────

    async def _embed(self, texts: list[str]) -> list[list[float]]:
        openai = self._get_openai()
        response = await openai.embeddings.create(model=EMBED_MODEL, input=texts)
        return [item.embedding for item in response.data]

    # ── ingest ────────────────────────────────────────────────────────────

    async def ingest(
        self,
        session_id: int,
        upload_refs: list[dict],
    ) -> dict[int, int]:
        """
        Extract, chunk, embed, and upsert all upload_refs.
        Returns {upload_id: chunk_count}.
        """
        await self.ensure_collection()
        qdrant = self._get_qdrant()

        # Delete any previous vectors for this session so re-ingest is idempotent
        await qdrant.delete(
            collection_name=COLLECTION,
            points_selector=Filter(
                must=[FieldCondition(key="session_id", match=MatchValue(value=session_id))]
            ),
        )

        results: dict[int, int] = {}

        for ref in upload_refs:
            upload_id: int = ref["upload_id"]
            file_path: str = ref["file_path"]
            kind: str = ref.get("kind", "content")

            try:
                raw_text = extract_text(file_path)
            except Exception as exc:
                results[upload_id] = 0
                continue

            chunks = chunk_text(raw_text)
            if not chunks:
                results[upload_id] = 0
                continue

            # Embed in batches of 100 (OpenAI limit)
            all_embeddings: list[list[float]] = []
            for i in range(0, len(chunks), 100):
                batch = chunks[i : i + 100]
                embeddings = await self._embed(batch)
                all_embeddings.extend(embeddings)

            points = [
                PointStruct(
                    id=str(uuid.uuid4()),
                    vector=embedding,
                    payload={
                        "session_id": session_id,
                        "upload_id": upload_id,
                        "kind": kind,
                        "text": chunk,
                        "chunk_index": idx,
                    },
                )
                for idx, (chunk, embedding) in enumerate(zip(chunks, all_embeddings))
            ]

            await qdrant.upsert(collection_name=COLLECTION, points=points)
            results[upload_id] = len(chunks)

        return results

    # ── query ─────────────────────────────────────────────────────────────

    async def query(
        self,
        session_id: int,
        question: str,
        current_block_text: str = "",
    ) -> str:
        """Retrieve top-k chunks and ask the LLM. Returns full answer text."""
        context = await self._retrieve(session_id, question)
        return await self._answer(question, context, current_block_text)

    async def stream_query(
        self,
        session_id: int,
        question: str,
        current_block_text: str = "",
    ) -> AsyncIterator[str]:
        """Stream answer tokens. Used by the live session WebSocket."""
        context = await self._retrieve(session_id, question)
        async for token in self._stream_answer(question, context, current_block_text):
            yield token

    async def _retrieve(self, session_id: int, question: str) -> str:
        await self.ensure_collection()
        qdrant = self._get_qdrant()

        [q_embedding] = await self._embed([question])

        results = await qdrant.search(
            collection_name=COLLECTION,
            query_vector=q_embedding,
            query_filter=Filter(
                must=[FieldCondition(key="session_id", match=MatchValue(value=session_id))]
            ),
            limit=TOP_K,
            with_payload=True,
        )

        if not results:
            return ""

        parts = [f"[Excerpt {i+1}]\n{r.payload['text']}" for i, r in enumerate(results)]
        return "\n\n".join(parts)

    async def _answer(self, question: str, context: str, block_text: str) -> str:
        client = self._get_anthropic()
        user_msg = _build_user_message(question, context, block_text)

        response = await client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=512,
            system=RAG_SYSTEM,
            messages=[{"role": "user", "content": user_msg}],
        )
        return response.content[0].text

    async def _stream_answer(
        self, question: str, context: str, block_text: str
    ) -> AsyncIterator[str]:
        client = self._get_anthropic()
        user_msg = _build_user_message(question, context, block_text)

        async with client.messages.stream(
            model="claude-haiku-4-5-20251001",
            max_tokens=512,
            system=RAG_SYSTEM,
            messages=[{"role": "user", "content": user_msg}],
        ) as stream:
            async for text in stream.text_stream:
                yield text


def _build_user_message(question: str, context: str, block_text: str) -> str:
    parts = []
    if block_text:
        parts.append(f"The avatar was currently saying:\n{block_text}")
    if context:
        parts.append(f"Relevant course content:\n{context}")
    parts.append(f"Student question: {question}")
    return "\n\n".join(parts)


# Module-level singleton — imported by routers and session orchestrator
rag_service = RAGService()
