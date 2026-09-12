import re
import sqlite3
from urllib.parse import urlparse

from backend.api.routes import auth
from backend.database.connection import get_db_connection
from backend.repositories.publications import get_publication_owner_state
from backend.repositories.artists import get_artist_by_id
from backend.repositories.artist_data import (
    create_timeline_entry, update_timeline_entry, delete_timeline_entry,
    create_media_item, update_media_item, delete_media_item,
    create_social_link, delete_social_link,
    create_connection, delete_connection,
    create_metric,
)
from backend.services.collaborator_service import register_collaborator, share_publication, report_activity, redeem_reward_by_user
from backend.services.publication_service import create_publication, update_publication
from backend.services.validation import publication_input, validate_category


def route_post(handler, path, data, now):
    user = auth(handler)
    with get_db_connection() as conn:
        if path == "/api/publications":
            if not user or user["role"] not in ("GESTOR", "ADMIN"):
                return handler.error(403, "FORBIDDEN", "Se requiere rol Gestor o Administrador")
            try:
                publication_id = create_publication(conn, user, data, now)
            except ValueError as error:
                return handler.error(400, "VALIDATION", str(error))
            return handler.send_json({"id": publication_id, "message": "Contenido creado"}, 201)

        if path == "/api/collaborators/register":
            if not user:
                return handler.error(401, "UNAUTHORIZED", "Inicia sesion para registrarte")
            try:
                result = register_collaborator(conn, user["id"], user["name"])
            except ValueError as error:
                return handler.error(400, "VALIDATION", str(error))
            return handler.send_json(result, 201)

        if path == "/api/collaborators/share":
            if not user:
                return handler.error(401, "UNAUTHORIZED", "Inicia sesion para compartir")
            publication_id = data.get("publication_id")
            if not publication_id:
                return handler.error(400, "VALIDATION", "publication_id es requerido")
            result = share_publication(conn, user["id"], int(publication_id))
            if result is None:
                return handler.send_json({"points_earned": 0, "message": "Ya compartiste esta publicacion"})
            return handler.send_json(result)

        if path == "/api/collaborators/report":
            if not user:
                return handler.error(401, "UNAUTHORIZED", "Inicia sesion para reportar")
            activity_type = str(data.get("type", "")).strip()
            description = str(data.get("description", "")).strip()
            evidence_url = str(data.get("evidence_url", "")).strip() or None
            if not activity_type:
                return handler.error(400, "VALIDATION", "El tipo de actividad es requerido")
            if not description:
                return handler.error(400, "VALIDATION", "La descripcion es requerida")
            try:
                result = report_activity(conn, user["id"], activity_type, description, evidence_url)
            except ValueError as error:
                return handler.error(400, "VALIDATION", str(error))
            return handler.send_json(result, 201)

        if path == "/api/collaborators/redeem":
            if not user:
                return handler.error(401, "UNAUTHORIZED", "Inicia sesion para canjear")
            reward_id = data.get("reward_id")
            if not reward_id:
                return handler.error(400, "VALIDATION", "reward_id es requerido")
            try:
                result = redeem_reward_by_user(conn, user["id"], int(reward_id))
            except ValueError as error:
                return handler.error(400, "VALIDATION", str(error))
            return handler.send_json(result)

        match = re.fullmatch(r"/api/publications/(\d+)/favorite", path)
        if match:
            if not user:
                return handler.error(401, "UNAUTHORIZED", "Inicia sesion para guardar")
            publication_id = int(match.group(1))
            exists = conn.execute("SELECT 1 FROM publications WHERE id=? AND status='PUBLISHED' AND deleted=0", (publication_id,)).fetchone()
            if not exists:
                return handler.error(404, "NOT_FOUND", "La publicacion no esta disponible")
            conn.execute("INSERT OR IGNORE INTO favorites(user_id,publication_id,created_at) VALUES(?,?,?)", (user["id"], publication_id, now()))
            return handler.send_json({"favorite": True})

        match = re.fullmatch(r"/api/publications/(\d+)/submit", path)
        if match:
            return _submit_publication(handler, conn, user, int(match.group(1)), now)

        match = re.fullmatch(r"/api/publications/(\d+)/report", path)
        if match:
            if not user:
                return handler.error(401, "UNAUTHORIZED", "Inicia sesion para reportar")
            reason = str(data.get("reason", "")).strip()
            if len(reason) < 5:
                return handler.error(400, "VALIDATION", "Escribe el motivo del reporte")
            publication_id = int(match.group(1))
            exists = conn.execute("SELECT 1 FROM publications WHERE id=? AND status='PUBLISHED' AND deleted=0", (publication_id,)).fetchone()
            if not exists:
                return handler.error(404, "NOT_FOUND", "La publicacion no esta disponible")
            conn.execute("INSERT INTO reports(user_id,publication_id,reason,created_at) VALUES(?,?,?,?)", (user["id"], publication_id, reason, now()))
            return handler.send_json({"message": "Reporte recibido"}, 201)

        match = re.fullmatch(r"/api/publications/(\d+)/images", path)
        if match:
            return _add_image(handler, conn, user, data, int(match.group(1)), now)

        # ── Artist management endpoints ──────────────────────────────

        # POST /api/artists/:id/timeline
        match = re.fullmatch(r"/api/artists/(\d+)/timeline", path)
        if match:
            return _create_artist_timeline(handler, conn, user, int(match.group(1)), data)

        # POST /api/artists/:id/media
        match = re.fullmatch(r"/api/artists/(\d+)/media", path)
        if match:
            return _create_artist_media(handler, conn, user, int(match.group(1)), data)

        # POST /api/artists/:id/social
        match = re.fullmatch(r"/api/artists/(\d+)/social", path)
        if match:
            return _create_artist_social(handler, conn, user, int(match.group(1)), data)

        # POST /api/artists/:id/connections
        match = re.fullmatch(r"/api/artists/(\d+)/connections", path)
        if match:
            return _create_artist_connection(handler, conn, user, int(match.group(1)), data)

        # POST /api/artists/:id/metrics
        match = re.fullmatch(r"/api/artists/(\d+)/metrics", path)
        if match:
            return _create_artist_metric(handler, conn, user, int(match.group(1)), data)

    return handler.error(404, "NOT_FOUND", "Ruta no encontrada")


def _submit_publication(handler, conn, user, publication_id, now):
    if not user or user["role"] not in ("GESTOR", "ADMIN"):
        return handler.error(403, "FORBIDDEN", "Acceso denegado")
    publication = conn.execute("SELECT author_id,status FROM publications WHERE id=? AND deleted=0", (publication_id,)).fetchone()
    if not publication:
        return handler.error(404, "NOT_FOUND", "Contenido no encontrado")
    if publication["author_id"] != user["id"] and user["role"] != "ADMIN":
        return handler.error(403, "FORBIDDEN", "No puedes enviar contenido de otro autor")
    if publication["status"] not in ("DRAFT", "REJECTED"):
        return handler.error(409, "INVALID_STATE", "Solo un borrador o contenido rechazado puede enviarse a revision")
    conn.execute("UPDATE publications SET status='REVIEW', moderation_note=NULL, updated_at=? WHERE id=?", (now(), publication_id))
    return handler.send_json({"message": "Enviado a revision"})


def _add_image(handler, conn, user, data, publication_id, now):
    if not user:
        return handler.error(401, "UNAUTHORIZED", "Inicia sesion para continuar")
    publication = get_publication_owner_state(conn, publication_id)
    if not publication:
        return handler.error(404, "NOT_FOUND", "Publicacion no encontrada")
    if user["role"] != "ADMIN" and publication["author_id"] != user["id"]:
        return handler.error(403, "FORBIDDEN", "No puedes modificar esta publicacion")
    url = str(data.get("url", "")).strip()
    if not url:
        return handler.error(400, "VALIDATION", "La URL es obligatoria")
    parsed_url = urlparse(url)
    if url.startswith("/") and not url.startswith("//"):
        if len(url) > 2000:
            return handler.error(400, "VALIDATION", "La URL es demasiado larga")
    elif parsed_url.scheme != "https" or not parsed_url.netloc:
        return handler.error(400, "VALIDATION", "La URL debe ser una direccion HTTPS valida")
    if len(url) > 2000:
        return handler.error(400, "VALIDATION", "La URL es demasiado larga")
    if "position" in data:
        try:
            position = int(data["position"])
        except (TypeError, ValueError):
            return handler.error(400, "VALIDATION", "La posicion debe ser un numero entero")
    else:
        maximum = conn.execute("SELECT MAX(position) FROM publication_images WHERE publication_id=?", (publication_id,)).fetchone()[0]
        position = (maximum if maximum is not None else -1) + 1
    if position < 0:
        return handler.error(400, "VALIDATION", "La posicion no puede ser negativa")
    try:
        cur = conn.execute(
            "INSERT INTO publication_images(publication_id,url,alt_text,caption,position) VALUES(?,?,?,?,?)",
            (publication_id, url, str(data.get("alt_text", "")).strip(), str(data.get("caption", "")).strip() or None, position),
        )
    except sqlite3.IntegrityError:
        return handler.error(409, "CONFLICT", "Ya existe una imagen en esa posicion")
    return handler.send_json({"id": cur.lastrowid, "url": url, "position": position}, 201)


def route_put(handler, publication_id, data, now):
    user = auth(handler)
    with get_db_connection() as conn:
        current = conn.execute("SELECT author_id,status FROM publications WHERE id=? AND deleted=0", (publication_id,)).fetchone()
        if not current:
            return handler.error(404, "NOT_FOUND", "Contenido no encontrado")
        if not user or user["role"] not in ("GESTOR", "ADMIN"):
            return handler.error(403, "FORBIDDEN", "Acceso denegado")
        if current["author_id"] != user["id"] and user["role"] != "ADMIN":
            return handler.error(403, "FORBIDDEN", "No puedes editar este contenido")
        if user["role"] == "GESTOR" and current["status"] not in ("DRAFT", "REJECTED"):
            return handler.error(409, "INVALID_STATE", "Solo puedes editar borradores o contenidos rechazados")
        try:
            item = publication_input(data)
            validate_category(conn, item["category_id"], item["kind"])
            update_publication(conn, publication_id, item, now)
        except ValueError as error:
            return handler.error(400, "VALIDATION", str(error))
    return handler.send_json({"message": "Contenido actualizado"})


def route_patch(handler, publication_id, data, now):
    user = auth(handler)
    if not user or user["role"] != "ADMIN":
        return handler.error(403, "FORBIDDEN", "Solo un administrador puede moderar")
    status = str(data.get("status", ""))
    note = str(data.get("note", "")).strip()
    if status not in ("PUBLISHED", "REJECTED"):
        return handler.error(400, "VALIDATION", "El administrador solo puede aprobar o rechazar")
    if status == "REJECTED" and len(note) < 5:
        return handler.error(400, "VALIDATION", "Escribe un motivo de rechazo claro")
    with get_db_connection() as conn:
        publication = conn.execute("SELECT status FROM publications WHERE id=? AND deleted=0", (publication_id,)).fetchone()
        if not publication:
            return handler.error(404, "NOT_FOUND", "Contenido no encontrado")
        if publication["status"] != "REVIEW":
            return handler.error(409, "INVALID_STATE", "Solo se puede moderar contenido que este en revision")
        conn.execute("UPDATE publications SET status=?,moderation_note=?,updated_at=? WHERE id=?", (status, note or None, now(), publication_id))
    return handler.send_json({"message": "Estado actualizado"})


def route_delete(handler, path, now):
    user = auth(handler)
    match = re.fullmatch(r"/api/publications/(\d+)/favorite", path)
    if match:
        if not user:
            return handler.error(401, "UNAUTHORIZED", "Inicia sesion")
        with get_db_connection() as conn:
            conn.execute("DELETE FROM favorites WHERE user_id=? AND publication_id=?", (user["id"], int(match.group(1))))
        return handler.send_json({"favorite": False})

    match = re.fullmatch(r"/api/publications/(\d+)/images/(\d+)", path)
    if match:
        if not user:
            return handler.error(401, "UNAUTHORIZED", "Inicia sesion para continuar")
        with get_db_connection() as conn:
            publication = get_publication_owner_state(conn, int(match.group(1)))
            if not publication:
                return handler.error(404, "NOT_FOUND", "Publicacion no encontrada")
            if user["role"] != "ADMIN" and publication["author_id"] != user["id"]:
                return handler.error(403, "FORBIDDEN", "No puedes modificar esta publicacion")
            cur = conn.execute("DELETE FROM publication_images WHERE id=? AND publication_id=?", (int(match.group(2)), int(match.group(1))))
            if cur.rowcount == 0:
                return handler.error(404, "NOT_FOUND", "Imagen no encontrada")
        return handler.send_json({"message": "Imagen eliminada"})

    # ── Artist DELETE endpoints ──────────────────────────────────────

    # DELETE /api/artists/:id/timeline/:tid
    match = re.fullmatch(r"/api/artists/(\d+)/timeline/(\d+)", path)
    if match:
        return _delete_artist_timeline(handler, int(match.group(1)), int(match.group(2)), user)

    # DELETE /api/artists/:id/media/:mid
    match = re.fullmatch(r"/api/artists/(\d+)/media/(\d+)", path)
    if match:
        return _delete_artist_media(handler, int(match.group(1)), int(match.group(2)), user)

    # DELETE /api/artists/:id/social/:sid
    match = re.fullmatch(r"/api/artists/(\d+)/social/(\d+)", path)
    if match:
        return _delete_artist_social(handler, int(match.group(1)), int(match.group(2)), user)

    # DELETE /api/artists/:id/connections/:cid
    match = re.fullmatch(r"/api/artists/(\d+)/connections/(\d+)", path)
    if match:
        return _delete_artist_connection(handler, int(match.group(1)), int(match.group(2)), user)

    match = re.fullmatch(r"/api/publications/(\d+)", path)
    if not match:
        return handler.error(404, "NOT_FOUND", "Ruta no encontrada")
    if not user or user["role"] not in ("GESTOR", "ADMIN"):
        return handler.error(403, "FORBIDDEN", "Acceso denegado")
    with get_db_connection() as conn:
        cur = conn.execute("UPDATE publications SET deleted=1,updated_at=? WHERE id=? AND (author_id=? OR ?='ADMIN')", (now(), int(match.group(1)), user["id"], user["role"]))
        if cur.rowcount == 0:
            return handler.error(403, "FORBIDDEN", "No puedes eliminar este contenido")
    return handler.send_json({"message": "Contenido eliminado"})


# ── Artist mutation helpers ──────────────────────────────────────────

def _check_artist_admin(handler, conn, user, artist_id):
    if not user or user["role"] not in ("ADMIN", "GESTOR"):
        return handler.error(403, "FORBIDDEN", "Acceso denegado")
    artist = get_artist_by_id(conn, artist_id)
    if not artist:
        return handler.error(404, "NOT_FOUND", "Artista no encontrado")
    return artist


def _create_artist_timeline(handler, conn, user, artist_id, data):
    artist = _check_artist_admin(handler, conn, user, artist_id)
    if not artist:
        return
    titulo = str(data.get("titulo", "")).strip()
    if not titulo:
        return handler.error(400, "VALIDATION", "El titulo es requerido")
    entry_id = create_timeline_entry(conn, artist_id, {
        "titulo": titulo,
        "descripcion": data.get("descripcion"),
        "fecha": data.get("fecha"),
        "imagen_url": data.get("imagen_url"),
        "video_url": data.get("video_url"),
        "orden": data.get("orden", 0),
    })
    return handler.send_json({"id": entry_id, "message": "Hito creado"}, 201)


def _create_artist_media(handler, conn, user, artist_id, data):
    artist = _check_artist_admin(handler, conn, user, artist_id)
    if not artist:
        return
    url = str(data.get("url", "")).strip()
    if not url:
        return handler.error(400, "VALIDATION", "La URL es requerida")
    media_id = create_media_item(conn, artist_id, {
        "tipo": data.get("tipo", "image"),
        "url": url,
        "titulo": data.get("titulo"),
        "descripcion": data.get("descripcion"),
        "fecha": data.get("fecha"),
        "orden": data.get("orden", 0),
        "destacado": data.get("destacado", 0),
    })
    return handler.send_json({"id": media_id, "message": "Media agregada"}, 201)


def _create_artist_social(handler, conn, user, artist_id, data):
    artist = _check_artist_admin(handler, conn, user, artist_id)
    if not artist:
        return
    platform = str(data.get("platform", "")).strip()
    url = str(data.get("url", "")).strip()
    if not platform or not url:
        return handler.error(400, "VALIDATION", "Plataforma y URL son requeridas")
    link_id = create_social_link(conn, artist_id, {
        "platform": platform,
        "url": url,
        "username": data.get("username"),
        "icon": data.get("icon"),
        "orden": data.get("orden", 0),
    })
    return handler.send_json({"id": link_id, "message": "Red social agregada"}, 201)


def _create_artist_connection(handler, conn, user, artist_id, data):
    artist = _check_artist_admin(handler, conn, user, artist_id)
    if not artist:
        return
    entity_type = str(data.get("entity_type", "")).strip()
    titulo = str(data.get("titulo", "")).strip()
    if not entity_type or not titulo:
        return handler.error(400, "VALIDATION", "entity_type y titulo son requeridos")
    conn_id = create_connection(conn, artist_id, {
        "entity_type": entity_type,
        "entity_id": data.get("entity_id"),
        "titulo": titulo,
        "descripcion": data.get("descripcion"),
        "imagen_url": data.get("imagen_url"),
        "url": data.get("url"),
        "orden": data.get("orden", 0),
    })
    return handler.send_json({"id": conn_id, "message": "Conexion creada"}, 201)


def _create_artist_metric(handler, conn, user, artist_id, data):
    artist = _check_artist_admin(handler, conn, user, artist_id)
    if not artist:
        return
    tipo = str(data.get("tipo", "")).strip()
    valor = data.get("valor")
    if not tipo or valor is None:
        return handler.error(400, "VALIDATION", "tipo y valor son requeridos")
    metric_id = create_metric(conn, artist_id, tipo, float(valor), data.get("fecha", ""), data.get("metadata"))
    return handler.send_json({"id": metric_id, "message": "Metrica registrada"}, 201)


def _delete_artist_timeline(handler, artist_id, entry_id, user):
    if not user or user["role"] not in ("ADMIN", "GESTOR"):
        return handler.error(403, "FORBIDDEN", "Acceso denegado")
    with get_db_connection() as conn:
        rows = delete_timeline_entry(conn, artist_id, entry_id)
        if rows == 0:
            return handler.error(404, "NOT_FOUND", "Hito no encontrado")
    return handler.send_json({"message": "Hito eliminado"})


def _delete_artist_media(handler, artist_id, media_id, user):
    if not user or user["role"] not in ("ADMIN", "GESTOR"):
        return handler.error(403, "FORBIDDEN", "Acceso denegado")
    with get_db_connection() as conn:
        rows = delete_media_item(conn, artist_id, media_id)
        if rows == 0:
            return handler.error(404, "NOT_FOUND", "Media no encontrada")
    return handler.send_json({"message": "Media eliminada"})


def _delete_artist_social(handler, artist_id, link_id, user):
    if not user or user["role"] not in ("ADMIN", "GESTOR"):
        return handler.error(403, "FORBIDDEN", "Acceso denegado")
    with get_db_connection() as conn:
        rows = delete_social_link(conn, artist_id, link_id)
        if rows == 0:
            return handler.error(404, "NOT_FOUND", "Red social no encontrada")
    return handler.send_json({"message": "Red social eliminada"})


def _delete_artist_connection(handler, artist_id, connection_id, user):
    if not user or user["role"] not in ("ADMIN", "GESTOR"):
        return handler.error(403, "FORBIDDEN", "Acceso denegado")
    with get_db_connection() as conn:
        rows = delete_connection(conn, artist_id, connection_id)
        if rows == 0:
            return handler.error(404, "NOT_FOUND", "Conexion no encontrada")
    return handler.send_json({"message": "Conexion eliminada"})


# ── PUT handlers for artists ────────────────────────────────────────

def route_put_artist(handler, artist_id, data, now):
    user = auth(handler)
    if not user or user["role"] not in ("ADMIN", "GESTOR"):
        return handler.error(403, "FORBIDDEN", "Acceso denegado")
    with get_db_connection() as conn:
        artist = get_artist_by_id(conn, artist_id)
        if not artist:
            return handler.error(404, "NOT_FOUND", "Artista no encontrado")
        fields = []
        values = []
        for key in ("name", "stage_name", "slug", "real_name", "bio", "image",
                     "hero_image", "genre", "city", "region",
                     "spotify_url", "youtube_url", "instagram_url", "tiktok_url", "featured"):
            if key in data:
                fields.append(f"{key}=?")
                values.append(data[key])
        if not fields:
            return handler.error(400, "VALIDATION", "Sin cambios para aplicar")
        fields.append("updated_at=?")
        values.append(now())
        values.append(artist_id)
        conn.execute(f"UPDATE artists SET {','.join(fields)} WHERE id=?", values)
    return handler.send_json({"message": "Artista actualizado"})


def route_put_artist_timeline(handler, artist_id, entry_id, data):
    user = auth(handler)
    if not user or user["role"] not in ("ADMIN", "GESTOR"):
        return handler.error(403, "FORBIDDEN", "Acceso denegado")
    with get_db_connection() as conn:
        artist = get_artist_by_id(conn, artist_id)
        if not artist:
            return handler.error(404, "NOT_FOUND", "Artista no encontrado")
        rows = update_timeline_entry(conn, artist_id, entry_id, data)
        if rows == 0:
            return handler.error(404, "NOT_FOUND", "Hito no encontrado o sin cambios")
    return handler.send_json({"message": "Hito actualizado"})


def route_put_artist_media(handler, artist_id, media_id, data):
    user = auth(handler)
    if not user or user["role"] not in ("ADMIN", "GESTOR"):
        return handler.error(403, "FORBIDDEN", "Acceso denegado")
    with get_db_connection() as conn:
        artist = get_artist_by_id(conn, artist_id)
        if not artist:
            return handler.error(404, "NOT_FOUND", "Artista no encontrado")
        rows = update_media_item(conn, artist_id, media_id, data)
        if rows == 0:
            return handler.error(404, "NOT_FOUND", "Media no encontrada o sin cambios")
    return handler.send_json({"message": "Media actualizada"})
