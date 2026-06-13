from fastapi import HTTPException, status
from jose import JWTError, jwt
from .config import settings

ALGORITHM = "HS256"


def decode_student_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, settings.session_jwt_secret, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
