"""Split text into overlapping token-bounded chunks."""
import tiktoken

_enc = tiktoken.get_encoding("cl100k_base")

CHUNK_TOKENS = 600
OVERLAP_TOKENS = 100


def chunk_text(text: str, chunk_size: int = CHUNK_TOKENS, overlap: int = OVERLAP_TOKENS) -> list[str]:
    tokens = _enc.encode(text)
    if not tokens:
        return []

    chunks: list[str] = []
    start = 0
    while start < len(tokens):
        end = min(start + chunk_size, len(tokens))
        chunk_tokens = tokens[start:end]
        chunk_text_ = _enc.decode(chunk_tokens).strip()
        if chunk_text_:
            chunks.append(chunk_text_)
        if end == len(tokens):
            break
        start = end - overlap  # slide back by overlap for next chunk

    return chunks
