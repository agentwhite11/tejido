import hashlib
import hmac
import secrets
from datetime import datetime, timedelta, timezone

from backend.database.connection import get_db_connection


def now():
    return datetime.now(timezone.utc).isoformat()


def hash_password(password, salt=None):
    salt = salt or secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 120000).hex()
    return salt + "$" + digest


def verify_password(password, stored):
    try:
        salt, digest = stored.split("$", 1)
        candidate = hash_password(password, salt).split("$", 1)[1]
        return hmac.compare_digest(candidate, digest)
    except (AttributeError, ValueError):
        return False


def get_current_user(handler):
    raw = handler.headers.get("Authorization", "")
    token = raw[7:] if raw.startswith("Bearer ") else None
    if not token:
        return None

    with get_db_connection() as conn:
        return conn.execute(
            "SELECT u.id, u.name, u.email, r.name role FROM sessions s "
            "JOIN users u ON u.id=s.user_id JOIN roles r ON r.id=u.role_id "
            "WHERE s.token=? AND s.expires_at>? AND u.active=1",
            (token, now()),
        ).fetchone()


def login_user(email, password):
    with get_db_connection() as conn:
        user = conn.execute(
            "SELECT u.*, r.name role FROM users u JOIN roles r ON r.id=u.role_id "
            "WHERE lower(u.email)=? AND u.active=1",
            (str(email or "").strip().lower(),),
        ).fetchone()
        if not user or not verify_password(password, user["password_hash"]):
            return None

        token = secrets.token_urlsafe(32)
        expires_at = (datetime.now(timezone.utc) + timedelta(hours=8)).isoformat()
        conn.execute("INSERT INTO sessions(token, user_id, expires_at) VALUES(?,?,?)", (token, user["id"], expires_at))
        return token, {"id": user["id"], "name": user["name"], "email": user["email"], "role": user["role"]}


def logout_user(handler):
    raw = handler.headers.get("Authorization", "")
    token = raw[7:] if raw.startswith("Bearer ") else ""
    with get_db_connection() as conn:
        conn.execute("DELETE FROM sessions WHERE token=?", (token,))
