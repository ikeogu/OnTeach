from pydantic import BaseModel


class QueryRequest(BaseModel):
    session_id: int
    question: str
    current_block_text: str = ""


class QueryResponse(BaseModel):
    answer: str
    session_id: int
