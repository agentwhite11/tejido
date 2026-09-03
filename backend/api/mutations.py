import re
import sqlite3
from urllib.parse import urlparse

from backend.api.routes import auth
from backend.database.connection import get_db_connection
from backend.repositories.publications import get_publication_owner_state
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

        match = re.fullmatch(r"/api/publications/(\d+)/favorite", path)
        if match:
            if not user:
                return handler.error(401, "UNAUTHORIZED", "Inicia sesión para guardar")
            publication_id = int(match.group(1))
            exists = conn.execute("SELECT 1 FROM publications WHERE id=? AND status='PUBLISHED' AND deleted=0", (publication_id,)).fetchone()
            if not exists:
                return handler.error(404, "NOT_FOUND", "La publicación no está disponible")
            conn.execute("INSERT OR IGNORE INTO favorites(user_id,publication_id,created_at) VALUES(?,?,?)", (user["id"], publication_id, now()))
            return handler.send_json({"favorite": True})

        match = re.fullmatch(r"/api/publications/(\d+)/submit", path)
        if match:
            return _submit_publication(handler, conn, user, int(match.group(1)), now)

        match = re.fullmatch(r"/api/publications/(\d+)/report", path)
        if match:
            if not user:
                return handler.error(401, "UNAUTHORIZED", "Inicia sesión para reportar")
            reason = str(data.get("reason", "")).strip()
            if len(reason) < 5:
                return handler.error(400, "VALIDATION", "Escribe el motivo del reporte")
            publication_id = int(match.group(1))
            exists = conn.execute("SELECT 1 FROM publications WHERE id=? AND status='PUBLISHED' AND deleted=0", (publication_id,)).fetchone()
            if not exists:
                return handler.error(404, "NOT_FOUND", "La publicación no está disponible")
            conn.execute("INSERT INTO reports(user_id,publication_id,reason,created_at) VALUES(?,?,?,?)", (user["id"], publication_id, reason, now()))
            return handler.send_json({"message": "Reporte recibido"}, 201)

        match = re.fullmatch(r"/api/publications/(\d+)/images", path)
        if match:
            return _add_image(handler, conn, user, data, int(match.group(1)), now)
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
        return handler.error(409, "INVALID_STATE", "Solo un borrador o contenido rechazado puede enviarse a revisión")
    conn.execute("UPDATE publications SET status='REVIEW', moderation_note=NULL, updated_at=? WHERE id=?", (now(), publication_id))
    return handler.send_json({"message": "Enviado a revisión"})


def _add_image(handler, conn, user, data, publication_id, now):
    if not user:
        return handler.error(401, "UNAUTHORIZED", "Inicia sesión para continuar")
    publication = get_publication_owner_state(conn, publication_id)
    if not publication:
        return handler.error(404, "NOT_FOUND", "Publicación no encontrada")
    if user["role"] != "ADMIN" and publication["author_id"] != user["id"]:
        return handler.error(403, "FORBIDDEN", "No puedes modificar esta publicación")
    url = str(data.get("url", "")).strip()
    if not url:
        return handler.error(400, "VALIDATION", "La URL es obligatoria")
    parsed_url = urlparse(url)
    if url.startswith("/") and not url.startswith("//"):
        if len(url) > 2000:
            return handler.error(400, "VALIDATION", "La URL es demasiado larga")
    elif parsed_url.scheme != "https" or not parsed_url.netloc:
        return handler.error(400, "VALIDATION", "La URL debe ser una dirección HTTPS válida")
    if len(url) > 2000:
        return handler.error(400, "VALIDATION", "La URL es demasiado larga")
    if "position" in data:
        try:
            position = int(data["position"])
        except (TypeError, ValueError):
            return handler.error(400, "VALIDATION", "La posición debe ser un número entero")
    else:
        maximum = conn.execute("SELECT MAX(position) FROM publication_images WHERE publication_id=?", (publication_id,)).fetchone()[0]
        position = (maximum if maximum is not None else -1) + 1
    if position < 0:
        return handler.error(400, "VALIDATION", "La posición no puede ser negativa")
    try:
        cur = conn.execute(
            "INSERT INTO publication_images(publication_id,url,alt_text,caption,position) VALUES(?,?,?,?,?)",
            (publication_id, url, str(data.get("alt_text", "")).strip(), str(data.get("caption", "")).strip() or None, position),
        )
    except sqlite3.IntegrityError:
        return handler.error(409, "CONFLICT", "Ya existe una imagen en esa posición")
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
            return handler.error(409, "INVALID_STATE", "Solo se puede moderar contenido que esté en revisión")
        conn.execute("UPDATE publications SET status=?,moderation_note=?,updated_at=? WHERE id=?", (status, note or None, now(), publication_id))
    return handler.send_json({"message": "Estado actualizado"})


def route_delete(handler, path, now):
    user = auth(handler)
    match = re.fullmatch(r"/api/publications/(\d+)/favorite", path)
    if match:
        if not user:
            return handler.error(401, "UNAUTHORIZED", "Inicia sesión")
        with get_db_connection() as conn:
            conn.execute("DELETE FROM favorites WHERE user_id=? AND publication_id=?", (user["id"], int(match.group(1))))
        return handler.send_json({"favorite": False})

    match = re.fullmatch(r"/api/publications/(\d+)/images/(\d+)", path)
    if match:
        if not user:
            return handler.error(401, "UNAUTHORIZED", "Inicia sesión para continuar")
        with get_db_connection() as conn:
            publication = get_publication_owner_state(conn, int(match.group(1)))
            if not publication:
                return handler.error(404, "NOT_FOUND", "Publicación no encontrada")
            if user["role"] != "ADMIN" and publication["author_id"] != user["id"]:
                return handler.error(403, "FORBIDDEN", "No puedes modificar esta publicación")
            cur = conn.execute("DELETE FROM publication_images WHERE id=? AND publication_id=?", (int(match.group(2)), int(match.group(1))))
            if cur.rowcount == 0:
                return handler.error(404, "NOT_FOUND", "Imagen no encontrada")
        return handler.send_json({"message": "Imagen eliminada"})

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
