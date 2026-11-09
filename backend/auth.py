import hashlib
import hmac
import os
import re
from datetime import datetime, timedelta, timezone

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from passlib.context import CryptContext

# Set JWT_SECRET_KEY in your environment before running the application.
# The fallback is for local development only and must be changed before deployment.
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-only-change-this-secret-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

bearer_scheme = HTTPBearer(auto_error=False)
password_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """Hash a new password using bcrypt."""
    return password_context.hash(password)


def is_legacy_password_hash(hashed_password: str) -> bool:
    """Identify passwords stored by the previous SHA-256 implementation."""
    return bool(re.fullmatch(r"[a-fA-F0-9]{64}", hashed_password or ""))


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify bcrypt hashes and support existing SHA-256 hashes during migration."""
    if is_legacy_password_hash(hashed_password):
        legacy_hash = hashlib.sha256(plain_password.encode("utf-8")).hexdigest()
        return hmac.compare_digest(legacy_hash, hashed_password)

    try:
        return password_context.verify(plain_password, hashed_password)
    except (ValueError, TypeError):
        return False


def create_access_token(data: dict) -> str:
    """Create a signed JWT access token."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> str:
    """Validate a bearer token and return the email stored in its subject."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if credentials is None:
        raise credentials_exception

    try:
        payload = jwt.decode(
            credentials.credentials,
            SECRET_KEY,
            algorithms=[ALGORITHM],
        )
        user_email = payload.get("sub")
        if not user_email:
            raise credentials_exception
        return user_email
    except JWTError:
        raise credentials_exception
