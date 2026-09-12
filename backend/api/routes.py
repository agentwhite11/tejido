import json
import re
from datetime import timedelta
from urllib.parse import parse_qs, urlparse

from backend.database.connection import get_db_connection
from backend.repositories.publications import get_publication, get_publication_owner_state, list_publication_images, list_publications
from backend.services.auth_service import get_current_user, login_user, logout_user, now
from backend.services.collaborator_service import get_profile, get_ranking_top, get_rewards_catalog, get_stats
from backend.services.artist_service import (
    get_all_artists, get_artist_profile, get_artist_discography,
    get_artist_timeline, get_artist_media, get_artist_social,
    get_artist_connections_data, get_artist_dashboard,
    get_home_artist_data,
)
from backend.services.serialization import rowdict


def auth(handler):
    record = get_current_user(handler)
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

        if path == "/api/collaborators/profile":
            user = auth(handler)
            if not user:
                return handler.error(401, "UNAUTHORIZED", "Inicia sesion")
            profile = get_profile(conn, user["id"])
            if not profile:
                return handler.send_json({"collaborator": None})
            return handler.send_json(profile)

        if path == "/api/collaborators/ranking":
            ranking = get_ranking_top(conn)
            return handler.send_json(ranking)

        if path == "/api/collaborators/rewards":
            rewards = get_rewards_catalog(conn)
            return handler.send_json(rewards)

        if path == "/api/collaborators/stats":
            stats = get_stats(conn)
            return handler.send_json(stats)

        if path == "/api/collaborators/activity-types":
            rows = conn.execute("SELECT * FROM activity_types ORDER BY name").fetchall()
            return handler.send_json([rowdict(r) for r in rows])

        # ── Artistas de Moneystack ──────────────────────────────────

        if path == "/api/artists":
            artists = get_all_artists(conn)
            return handler.send_json(artists)

        if path == "/api/artists/home":
            data = get_home_artist_data(conn)
            return handler.send_json(data or {})

        # GET /api/artists/:slug/media-kit
        match = re.fullmatch(r"/api/artists/([^/]+)/media-kit", path)
        if match:
            slug = match.group(1)
            data = get_artist_profile(conn, slug)
            if not data:
                return handler.error(404, "NOT_FOUND", "Artista no encontrado")
            return handler.send_json(data)

        # GET /api/artists/:slug/music
        match = re.fullmatch(r"/api/artists/([^/]+)/music", path)
        if match:
            slug = match.group(1)
            data = get_artist_discography(conn, slug)
            if not data:
                return handler.error(404, "NOT_FOUND", "Artista no encontrado")
            return handler.send_json(data)

        # GET /api/artists/:slug/timeline
        match = re.fullmatch(r"/api/artists/([^/]+)/timeline", path)
        if match:
            slug = match.group(1)
            data = get_artist_timeline(conn, slug)
            if not data:
                return handler.error(404, "NOT_FOUND", "Artista no encontrado")
            return handler.send_json(data)

        # GET /api/artists/:slug/media
        match = re.fullmatch(r"/api/artists/([^/]+)/media", path)
        if match:
            slug = match.group(1)
            tipo = query.get("tipo", [None])[0]
            data = get_artist_media(conn, slug, tipo)
            if not data:
                return handler.error(404, "NOT_FOUND", "Artista no encontrado")
            return handler.send_json(data)

        # GET /api/artists/:slug/social
        match = re.fullmatch(r"/api/artists/([^/]+)/social", path)
        if match:
            slug = match.group(1)
            data = get_artist_social(conn, slug)
            if not data:
                return handler.error(404, "NOT_FOUND", "Artista no encontrado")
            return handler.send_json(data)

        # GET /api/artists/:slug/connections
        match = re.fullmatch(r"/api/artists/([^/]+)/connections", path)
        if match:
            slug = match.group(1)
            entity_type = query.get("type", [None])[0]
            data = get_artist_connections_data(conn, slug, entity_type)
            if not data:
                return handler.error(404, "NOT_FOUND", "Artista no encontrado")
            return handler.send_json(data)

        # GET /api/artists/:id/dashboard
        match = re.fullmatch(r"/api/artists/(\d+)/dashboard", path)
        if match:
            user = auth(handler)
            if not user or user["role"] not in ("ADMIN", "GESTOR"):
                return handler.error(403, "FORBIDDEN", "Acceso denegado")
            artist_id = int(match.group(1))
            data = get_artist_dashboard(conn, artist_id)
            return handler.send_json(data)

        # GET /api/artists/:slug (profile - must be last)
        match = re.fullmatch(r"/api/artists/([^/]+)", path)
        if match:
            slug = match.group(1)
            data = get_artist_profile(conn, slug)
            if not data:
                return handler.error(404, "NOT_FOUND", "Artista no encontrado")
            return handler.send_json(data)

    return handler.error(404, "NOT_FOUND", "Ruta no encontrada")


def route_api_post(handler, path, payload):
    user = auth(handler)
    with get_db_connection() as conn:
        if path == "/api/suggestions":
            message = str(payload.get("message", "")).strip()
            if len(message) < 10:
                return handler.error(400, "VALIDATION", "Escribe una sugerencia de al menos 10 caracteres")
            if len(message) > 1000:
                return handler.error(400, "VALIDATION", "La sugerencia no puede superar 1000 caracteres")
            cur = conn.execute(
                "INSERT INTO suggestions(user_id,message,status,created_at) VALUES(?,?,?,?)",
                (user["id"] if user else None, message, "NEW", now()),
            )
            return handler.send_json({"id": cur.lastrowid, "ticket": f"TEJ-{cur.lastrowid:04d}", "message": "Sugerencia recibida"}, 201)

        if path == "/api/support":
            name = str(payload.get("name", "")).strip()
            amount = payload.get("amount")
            method = str(payload.get("method", "nequi")).strip().lower()
            if not name or len(name) < 2:
                return handler.error(400, "VALIDATION", "Escribe tu nombre")
            if not isinstance(amount, (int, float)) or amount < 1:
                return handler.error(400, "VALIDATION", "El monto debe ser un numero positivo")
            if method not in ("nequi", "daviplata", "pse", "efectivo", "otro"):
                method = "nequi"
            cur = conn.execute(
                "INSERT INTO supporters(name,amount,method,created_at) VALUES(?,?,?,?)",
                (name, int(amount), method, now()),
            )
            return handler.send_json({"id": cur.lastrowid, "message": "Gracias por tu apoyo"}, 201)

    return handler.error(404, "NOT_FOUND", "Ruta no encontrada")


def _handle_publications_get(handler, conn, query):
    user = auth(handler)
    rows = list_publications(conn, user, query)
    return handler.send_json([rowdict(r) for r in rows])


def _handle_publication_detail(handler, conn, user, publication_id):
    row = get_publication(conn, user, publication_id)
    if not row:
        return handler.error(404, "NOT_FOUND", "Contenido no encontrado")
    if row["status"] != "PUBLISHED" and (not user or (user["role"] != "ADMIN" and row["author_id"] != user["id"])):
        return handler.error(403, "FORBIDDEN", "No tienes acceso a este contenido")
    return handler.send_json(rowdict(row))


def _handle_images_get(handler, conn, user, publication_id):
    pub = get_publication_owner_state(conn, publication_id)
    if not pub:
        return handler.error(404, "NOT_FOUND", "Publicacion no encontrada")
    if pub["status"] != "PUBLISHED" and (not user or (user["role"] != "ADMIN" and pub["author_id"] != user["id"])):
        return handler.error(403, "FORBIDDEN", "No tienes acceso a este contenido")
    rows = list_publication_images(conn, publication_id)
    return handler.send_json([rowdict(r) for r in rows])


def handle_auth_login(handler, payload):
    result = login_user(payload.get("email"), payload.get("password", ""))
    if not result:
        return handler.error(401, "INVALID_CREDENTIALS", "Correo o contrasena incorrectos")
    token, user = result
    return handler.send_json({"token": token, "user": user})


def handle_auth_logout(handler):
    logout_user(handler)
    return handler.send_json({"ok": True})
