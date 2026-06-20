FROM python:3.12-slim

# System deps (gcc for native extensions, curl for healthcheck)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc g++ curl \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Pre-download the fastembed model so the first Q&A has no cold-start delay
RUN python -c "from fastembed import TextEmbedding; TextEmbedding('BAAI/bge-small-en-v1.5')"

COPY . .

EXPOSE 8001

# Run both uvicorn (FastAPI/healthz/RAG) and the LiveKit agent worker in parallel.
# The agent worker connects outbound to LiveKit Cloud — no inbound port needed.
CMD sh -c "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8001} & \
           python -m app.agent start & \
           wait"
