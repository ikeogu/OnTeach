from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    session_jwt_secret: str = ""
    laravel_internal_url: str = "http://127.0.0.1:8000"
    qdrant_url: str = "http://127.0.0.1:6333"
    redis_url: str = "redis://127.0.0.1:6379"
    anthropic_api_key: str = ""
    openai_api_key: str = ""
    deepgram_api_key: str = ""
    heygen_api_key: str = ""
    s3_endpoint: str = ""
    s3_bucket: str = ""
    s3_access_key_id: str = ""
    s3_secret_access_key: str = ""
    # Tavus avatar
    tavus_api_key: str = ""
    tavus_replica_id: str = ""
    tavus_persona_id: str = ""
    # LiveKit
    livekit_url: str = ""
    livekit_api_key: str = ""
    livekit_api_secret: str = ""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
