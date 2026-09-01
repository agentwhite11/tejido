import json
import re
from datetime import datetime, timedelta, timezone
from urllib.parse import parse_qs, urlparse

from backend.database.connection import get_db_connection
from backend.database.seed import verify_password


def now():
    return datetime.now(timezone.utc).isoformat()


def rowdict(record):
    if not record:
        return None
    return {key: value for key, value in dict(record).items()}


def auth(handler):
    raw = handler.headers.get("Authorization", "")
    token = raw[7:] if raw.startswith("Bearer ") else None
    if not token:
        return None
    with get_db_connection() as conn:
        record = conn.execute(
            "SELECT u.id, u.name, u.email, r.name role FROM sessions s "
            "JOIN users u ON u.id=s.user_id "
            "JOIN roles r ON r.id=u.role_id "
            "WHERE s.token=? AND s.expires_at>? AND u.active=1",
            (token, now()),
        ).fetchone()
        return rowdict(record)


def route_api(handler):
    parsed = urlparse(handler.path)
    path = parsed.path
    query = parse_qs(parsed.query)

    if not path.startswith("/api/"):
        return None

    with get_db_connection() as conn:
        if path == "/api/health":
            return handler.send_json({"status": "ok", "database": "sqlite", "time": now()})

        if path == "/api/me":
            return handler.send_json({"user": auth(handler)})

        if path == "/api/categories":
            rows = conn.execute("SELECT * FROM categories WHERE active=1 ORDER BY name").fetchall()
            return handler.send_json([rowdict(r) for r in rows])

        if path == "/api/support/stats":
            total = conn.execute("SELECT COUNT(*) FROM supporters").fetchone()[0]
            return handler.send_json({"total_supporters": total})

        if path == "/api/admin/stats":
            user = auth(handler)
            if not user or user["role"] != "ADMIN":
                return handler.error(403, "FORBIDDEN", "Acceso administrativo requerido")
            stats = {
                "published": conn.execute("SELECT COUNT(*) FROM publications WHERE status='PUBLISHED' AND deleted=0").fetchone()[0],
                "pending": conn.execute("SELECT COUNT(*) FROM publications WHERE status='REVIEW' AND deleted=0").fetchone()[0],
                "users": conn.execute("SELECT COUNT(*) FROM users WHERE active=1").fetchone()[0],
                "reports": conn.execute("SELECT COUNT(*) FROM reports WHERE status='OPEN'").fetchone()[0],
                "suggestions": conn.execute("SELECT COUNT(*) FROM suggestions WHERE status='NEW'").fetchone()[0],
            }
            return handler.send_json(stats)

        if path == "/api/admin/suggestions":
            user = auth(handler)
            if not user or user["role"] != "ADMIN":
                return handler.error(403, "FORBIDDEN", "Acceso administrativo requerido")
            rows = conn.execute(
                "SELECT s.id, s.message, s.status, s.created_at, u.name user_name, u.email user_email FROM suggestions s LEFT JOIN users u ON u.id=s.user_id ORDER BY s.created_at DESC LIMIT 50"
            ).fetchall()
            return handler.send_json([rowdict(r) for r in rows])

        if path == "/api/publications":
            return _handle_publications_get(handler, conn, query)

        match = re.fullmatch(r"/api/publications/(\d+)", path)
        if match:
            return _handle_publication_detail(handler, conn, auth(handler), match.group(1))

        match = re.fullmatch(r"/api/publications/(\d+)/images", path)
        if match:
            return _handle_images_get(handler, conn, auth(handler), match.group(1))

    return handler.error(404, "NOT_FOUND", "Ruta no encontrada")


def _handle_publications_get(handler, conn, query):
    user = auth(handler)
    where = ["p.deleted=0"]
    args = []

    wants_mine = query.get("mine") == ["1"] and user
    wants_admin_status = query.get("status") and user and user["role"] == "ADMIN"

    if wants_mine:
        where.append("p.author_id=?")
        args.append(user["id"])
    elif wants_admin_status:
        where.append("p.status=?")
        args.append(query["status"][0])
    else:
        where.append("p.status='PUBLISHED'")

    if query.get("kind") and query["kind"][0] != "TODOS":
        where.append("p.kind=?")
        args.append(query["kind"][0])

    if query.get("search"):
        where.append("(p.title LIKE ? OR p.summary LIKE ? OR p.location LIKE ?)")
        term = "%" + query["search"][0] + "%"
        args += [term, term, term]

    sql = (
        "SELECT p.*, c.name category, c.color, u.name author, "
        "EXISTS(SELECT 1 FROM favorites f WHERE f.publication_id=p.id AND f.user_id=?) favorite "
        "FROM publications p JOIN categories c ON c.id=p.category_id JOIN users u ON u.id=p.author_id "
        "WHERE " + " AND ".join(where) + " ORDER BY p.featured DESC, COALESCE(p.start_date,p.created_at) DESC"
    )
    rows = conn.execute(sql, ([user["id"] if user else -1] + args)).fetchall()
    return handler.send_json([rowdict(r) for r in rows])


def _handle_publication_detail(handler, conn, user, publication_id):
    row = conn.execute(
        "SELECT p.*, c.name category, c.color, u.name author, EXISTS(SELECT 1 FROM favorites f WHERE f.publication_id=p.id AND f.user_id=?) favorite "
        "FROM publications p JOIN categories c ON c.id=p.category_id JOIN users u ON u.id=p.author_id "
        "WHERE p.id=? AND p.deleted=0",
        (user["id"] if user else -1, int(publication_id)),
    ).fetchone()

    if not row:
        return handler.error(404, "NOT_FOUND", "Contenido no encontrado")
    if row["status"] != "PUBLISHED" and (not user or (user["role"] != "ADMIN" and row["author_id"] != user["id"])):
        return handler.error(403, "FORBIDDEN", "No tienes acceso a este contenido")
    return handler.send_json(rowdict(row))


def _handle_images_get(handler, conn, user, publication_id):
    pub = conn.execute("SELECT id, status, author_id FROM publications WHERE id=? AND deleted=0", (int(publication_id),)).fetchone()
    if not pub:
        return handler.error(404, "NOT_FOUND", "Publicación no encontrada")
    if pub["status"] != "PUBLISHED" and (not user or (user["role"] != "ADMIN" and pub["author_id"] != user["id"])):
        return handler.error(403, "FORBIDDEN", "No tienes acceso a este contenido")
    rows = conn.execute(
        "SELECT id, url, alt_text, caption, position FROM publication_images WHERE publication_id=? ORDER BY position ASC",
        (int(publication_id),),
    ).fetchall()
    return handler.send_json([rowdict(r) for r in rows])


def handle_auth_login(handler, payload):
    email = str(payload.get("email", "")).strip().lower()
    password = str(payload.get("password", ""))

    with get_db_connection() as conn:
        user = conn.execute(
            "SELECT u.*, r.name role FROM users u JOIN roles r ON r.id=u.role_id WHERE lower(u.email)=? AND u.active=1",
            (email,),
        ).fetchone()

        if not user or not verify_password(password, user["password_hash"]):
            return handler.error(401, "INVALID_CREDENTIALS", "Correo o contraseña incorrectos")

        token = __import__("secrets").token_urlsafe(32)
        expires_at = (datetime.now(timezone.utc) + timedelta(hours=8)).isoformat()
        conn.execute("INSERT INTO sessions(token, user_id, expires_at) VALUES(?,?,?)", (token, user["id"], expires_at))

        return handler.send_json({
            "token": token,
            "user": {
                "id": user["id"],
                "name": user["name"],
                "email": user["email"],
                "role": user["role"],
            },
        })


def handle_auth_logout(handler):
    raw = handler.headers.get("Authorization", "")
    token = raw[7:] if raw.startswith("Bearer ") else ""
    with get_db_connection() as conn:
        conn.execute("DELETE FROM sessions WHERE token=?", (token,))
    return handler.send_json({"ok": True})
