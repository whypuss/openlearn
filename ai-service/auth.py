"""
Supabase JWT authentication
Verifies Bearer tokens from the client
"""
import os
import httpx
from fastapi import HTTPException, Header
from fastapi.security import HTTPBearer
from jose import jwt, JWTError

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET", "")

security = HTTPBearer()

async def get_current_user(authorization: str = Header(None)) -> str:
    """
    Returns the user_id (UUID) from the Bearer token.
    Raises 401 if invalid or missing.
    """
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization header")

    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token:
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    if not SUPABASE_JWT_SECRET:
        raise HTTPException(status_code=500, detail="SUPABASE_JWT_SECRET not configured")

    try:
        payload = jwt.decode(
            token,
            SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            audience="authenticated",
            options={"verify_aud": False},  # Supabase tokens don't always include audience
        )
        user_id: str = payload.get("sub", "")
        if not user_id:
            raise HTTPException(status_code=401, detail="Token missing sub claim")
        return user_id
    except JWTError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {e}")
