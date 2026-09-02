#!/usr/bin/env python3
import json
import os
import re
import secrets
import sqlite3
import hashlib
import hmac
import mimetypes
from datetime import datetime, timedelta, timezone
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from urllib.parse import urlparse, parse_qs

from backend.config import HOST, PORT, PUBLIC_DIR, DB_PATH
from backend.database.connection import get_db_connection
from backend.database.init_db import init_db
from backend.api.routes import auth, handle_auth_login, handle_auth_logout, route_api
from backend.services.validation import publication_input, validate_category

MAX_BODY_BYTES = 1_000_000


def now():
    return datetime.now(timezone.utc).isoformat()


def hash_password(password, salt=None):
    salt = salt or secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 120000).hex()
    return salt + "$" + digest


def verify_password(password, stored):
    try:
        salt, digest = stored.split("$", 1)
        return hmac.compare_digest(hash_password(password, salt).split("$", 1)[1], digest)
    except Exception:
        return False


def clean_optional_url(value, field, allow_gradient=False):
    value = str(value or "").strip()
    if not value:
        return None
    if allow_gradient and value.startswith("linear-gradient("):
        return value
    if value.startswith("/") and not value.startswith("//"):
        if len(value) > 1000:
            raise ValueError(f"{field} es demasiado largo")
        return value
    parsed = urlparse(value)
    if parsed.scheme not in ("http", "https") or not parsed.netloc:
        raise ValueError(f"{field} debe ser una dirección http o https válida")
    if len(value) > 1000:
        raise ValueError(f"{field} es demasiado largo")
    return value


def clean_optional_date(value, field):
    value = str(value or "").strip()
    if not value:
        return None
    try:
        datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        raise ValueError(f"{field} no tiene una fecha válida")
    return value


def sync_publication_detail(conn, publication_id, item):
    conn.execute("DELETE FROM events WHERE publication_id=?", (publication_id,))
    conn.execute("DELETE FROM opportunities WHERE publication_id=?", (publication_id,))
    if item["kind"] == "EVENTO":
        conn.execute(
            "INSERT INTO events(publication_id, venue, capacity) VALUES(?,?,?)",
            (publication_id, item["location"], None),
        )
    elif item["kind"] == "OPORTUNIDAD":
        conn.execute(
            "INSERT INTO opportunities(publication_id, organization_name, deadline) VALUES(?,?,?)",
            (publication_id, None, item["end_date"]),
        )


def fix_text(value):
    if not isinstance(value, str):
        return value
    for _ in range(2):
        if not any(mark in value for mark in ("Ã", "Â", "â")):
            break
        try:
            repaired = value.encode("latin1").decode("utf8")
            if repaired == value:
                break
            value = repaired
        except (UnicodeEncodeError, UnicodeDecodeError):
            break
    return value


def rowdict(record):
    return {key: fix_text(value) for key, value in dict(record).items()} if record else None


class Handler(SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        print("[TEJIDO]", format % args)

    def send_json(self, data, status=200):
        body = json.dumps(data, ensure_ascii=False).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def body(self):
        try:
            length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            self.error(400, "INVALID_JSON", "El tamaño de la solicitud no es válido")
            return None
        if length > MAX_BODY_BYTES:
            self.error(413, "TOO_LARGE", "La solicitud supera el tamaño permitido")
            return None
        try:
            data = json.loads(self.rfile.read(length) or b"{}")
            if not isinstance(data, dict):
                raise ValueError
            return data
        except (json.JSONDecodeError, UnicodeDecodeError, ValueError):
            self.error(400, "INVALID_JSON", "Envía un objeto JSON válido")
            return None

    def error(self, status, code, message):
        self.send_json({"error": code, "message": message}, status)

    def serve_static(self):
        path = urlparse(self.path).path
        target = PUBLIC_DIR / ("index.html" if path == "/" else path.lstrip("/"))
        try:
            target = target.resolve()
            target.relative_to(PUBLIC_DIR.resolve())
        except Exception:
            return self.error(403, "FORBIDDEN", "Ruta no permitida")
        if not target.exists() or target.is_dir():
            if Path(path).suffix:
                return self.error(404, "NOT_FOUND", "Archivo no encontrado")
            target = PUBLIC_DIR / "index.html"
        data = target.read_bytes()
        mime = mimetypes.guess_type(target.name)[0] or "application/octet-stream"
        self.send_response(200)
        self.send_header("Content-Type", mime + ("; charset=utf-8" if mime.startswith("text/") or mime == "application/javascript" else ""))
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def _legacy_do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path
        query = parse_qs(parsed.query)

        if not path.startswith("/api/"):
            return self.serve_static()

        user = auth(self)

        with get_db_connection() as conn:
            if path == "/api/health":
                return self.send_json({"status": "ok", "database": "sqlite", "time": now()})
            if path == "/api/me":
                return self.send_json({"user": user})
            if path == "/api/categories":
                rows = conn.execute("SELECT * FROM categories WHERE active=1 ORDER BY name").fetchall()
                return self.send_json([rowdict(x) for x in rows])
            if path == "/api/publications":
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
                    "SELECT p.*, c.name category, c.color, u.name author, EXISTS(SELECT 1 FROM favorites f WHERE f.publication_id=p.id AND f.user_id=?) favorite "
                    "FROM publications p JOIN categories c ON c.id=p.category_id JOIN users u ON u.id=p.author_id WHERE " + " AND ".join(where) + " ORDER BY p.featured DESC, COALESCE(p.start_date,p.created_at) DESC"
                )
                rows = conn.execute(sql, ([user["id"] if user else -1] + args)).fetchall()
                return self.send_json([rowdict(x) for x in rows])

            m = re.fullmatch(r"/api/publications/(\d+)/images", path)
            if m:
                pid = int(m.group(1))
                pub = conn.execute("SELECT id,status,author_id FROM publications WHERE id=? AND deleted=0", (pid,)).fetchone()
                if not pub:
                    return self.error(404, "NOT_FOUND", "Publicación no encontrada")
                if pub["status"] != "PUBLISHED" and (not user or (user["role"] != "ADMIN" and pub["author_id"] != user["id"])):
                    return self.error(403, "FORBIDDEN", "No tienes acceso a este contenido")
                rows = conn.execute("SELECT id,url,alt_text,caption,position FROM publication_images WHERE publication_id=? ORDER BY position ASC", (pid,)).fetchall()
                return self.send_json([rowdict(x) for x in rows])

            m = re.fullmatch(r"/api/publications/(\d+)", path)
            if m:
                r = conn.execute(
                    "SELECT p.*,c.name category,c.color,u.name author, EXISTS(SELECT 1 FROM favorites f WHERE f.publication_id=p.id AND f.user_id=?) favorite FROM publications p JOIN categories c ON c.id=p.category_id JOIN users u ON u.id=p.author_id WHERE p.id=? AND p.deleted=0",
                    (user["id"] if user else -1, int(m.group(1))),
                ).fetchone()
                if not r:
                    return self.error(404, "NOT_FOUND", "Contenido no encontrado")
                if r["status"] != "PUBLISHED" and (not user or (user["role"] != "ADMIN" and r["author_id"] != user["id"])):
                    return self.error(403, "FORBIDDEN", "No tienes acceso a este contenido")
                return self.send_json(rowdict(r))

            if path == "/api/admin/stats":
                if not user or user["role"] != "ADMIN":
                    return self.error(403, "FORBIDDEN", "Acceso administrativo requerido")
                stats = {
                    "published": conn.execute("SELECT COUNT(*) FROM publications WHERE status='PUBLISHED' AND deleted=0").fetchone()[0],
                    "pending": conn.execute("SELECT COUNT(*) FROM publications WHERE status='REVIEW' AND deleted=0").fetchone()[0],
                    "users": conn.execute("SELECT COUNT(*) FROM users WHERE active=1").fetchone()[0],
                    "reports": conn.execute("SELECT COUNT(*) FROM reports WHERE status='OPEN'").fetchone()[0],
                    "suggestions": conn.execute("SELECT COUNT(*) FROM suggestions WHERE status='NEW'").fetchone()[0],
                }
                return self.send_json(stats)

            if path == "/api/admin/suggestions":
                if not user or user["role"] != "ADMIN":
                    return self.error(403, "FORBIDDEN", "Acceso administrativo requerido")
                rows = conn.execute("SELECT s.id,s.message,s.status,s.created_at,u.name user_name,u.email user_email FROM suggestions s LEFT JOIN users u ON u.id=s.user_id ORDER BY s.created_at DESC LIMIT 50").fetchall()
                return self.send_json([rowdict(x) for x in rows])

            if path == "/api/support/stats":
                total = conn.execute("SELECT COUNT(*) FROM supporters").fetchone()[0]
                return self.send_json({"total_supporters": total})

        self.error(404, "NOT_FOUND", "Ruta no encontrada")

    def do_GET(self):
        if self.path.startswith("/api/"):
            return route_api(self)
        return self.serve_static()

    def do_POST(self):
        path = urlparse(self.path).path
        data = self.body()
        user = auth(self)
        if data is None:
            return

        with get_db_connection() as conn:
            if path == "/api/auth/login":
                email = str(data.get("email", "")).strip().lower()
                password = str(data.get("password", ""))
                row = conn.execute("SELECT u.*, r.name role FROM users u JOIN roles r ON r.id=u.role_id WHERE lower(u.email)=? AND u.active=1", (email,)).fetchone()
                if not row or not verify_password(password, row["password_hash"]):
                    return self.error(401, "INVALID_CREDENTIALS", "Correo o contraseña incorrectos")
                token = secrets.token_urlsafe(32)
                expires_at = (datetime.now(timezone.utc) + timedelta(hours=8)).isoformat()
                conn.execute("INSERT INTO sessions(token,user_id,expires_at) VALUES(?,?,?)", (token, row["id"], expires_at))
                return self.send_json({
                    "token": token,
                    "user": {"id": row["id"], "name": row["name"], "email": row["email"], "role": row["role"]},
                })

            if path == "/api/auth/logout":
                raw = self.headers.get("Authorization", "")
                token = raw[7:] if raw.startswith("Bearer ") else ""
                conn.execute("DELETE FROM sessions WHERE token=?", (token,))
                return self.send_json({"ok": True})

            if path == "/api/suggestions":
                message = str(data.get("message", "")).strip()
                if len(message) < 10:
                    return self.error(400, "VALIDATION", "Escribe una sugerencia de al menos 10 caracteres")
                if len(message) > 1000:
                    return self.error(400, "VALIDATION", "La sugerencia no puede superar 1000 caracteres")
                cur = conn.execute("INSERT INTO suggestions(user_id,message,status,created_at) VALUES(?,?,?,?)", (user["id"] if user else None, message, "NEW", now()))
                return self.send_json({"id": cur.lastrowid, "ticket": f"TEJ-{cur.lastrowid:04d}", "message": "Sugerencia recibida"}, 201)

            if path == "/api/support":
                name = str(data.get("name", "")).strip()
                amount = data.get("amount")
                method = str(data.get("method", "nequi")).strip().lower()
                if not name or len(name) < 2:
                    return self.error(400, "VALIDATION", "Escribe tu nombre")
                if not isinstance(amount, (int, float)) or amount < 1:
                    return self.error(400, "VALIDATION", "El monto debe ser un número positivo")
                if method not in ("nequi", "daviplata", "pse", "efectivo", "otro"):
                    method = "nequi"
                cur = conn.execute("INSERT INTO supporters(name,amount,method,created_at) VALUES(?,?,?,?)", (name, int(amount), method, now()))
                return self.send_json({"id": cur.lastrowid, "message": "Gracias por tu apoyo"}, 201)

            if path == "/api/collaborate":
                name = str(data.get("name", "")).strip()
                email = str(data.get("email", "")).strip().lower()
                role = str(data.get("role", "")).strip()
                message = str(data.get("message", "")).strip()
                if not name or len(name) < 2:
                    return self.error(400, "VALIDATION", "Escribe tu nombre")
                if not email or "@" not in email:
                    return self.error(400, "VALIDATION", "Escribe un correo válido")
                if not role:
                    return self.error(400, "VALIDATION", "Selecciona un rol")
                if len(message) > 1000:
                    return self.error(400, "VALIDATION", "El mensaje no puede superar 1000 caracteres")
                cur = conn.execute("INSERT INTO collaborators(name,email,role,message,created_at) VALUES(?,?,?,?,?)", (name, email, role, message or None, now()))
                return self.send_json({"id": cur.lastrowid, "message": "Postulación recibida"}, 201)

            if path == "/api/publications":
                if not user or user["role"] not in ("GESTOR", "ADMIN"):
                    return self.error(403, "FORBIDDEN", "Se requiere rol Gestor o Administrador")
                try:
                    item = publication_input(data)
                    validate_category(conn, item["category_id"], item["kind"])
                except ValueError as error:
                    return self.error(400, "VALIDATION", str(error))
                image = item["image"] or "linear-gradient(135deg,#2F6B59,#F6C453)"
                status = "PUBLISHED" if user["role"] == "ADMIN" and data.get("publish") else "DRAFT"
                fields = (
                    user["id"], item["category_id"], item["kind"], item["title"], item["summary"], item["content"],
                    image, item["location"], item["start_date"], item["end_date"], item["link"],
                    int(bool(data.get("featured", False))) if user["role"] == "ADMIN" else 0,
                    status, now(), now(),
                )
                try:
                    cur = conn.execute(
                        "INSERT INTO publications(author_id,category_id,kind,title,summary,content,image,location,start_date,end_date,link,featured,status,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
                        fields,
                    )
                    sync_publication_detail(conn, cur.lastrowid, item)
                except sqlite3.IntegrityError:
                    return self.error(409, "CONFLICT", "No fue posible guardar el contenido con esos datos")
                return self.send_json({"id": cur.lastrowid, "message": "Contenido creado"}, 201)

            m = re.fullmatch(r"/api/publications/(\d+)/favorite", path)
            if m:
                if not user:
                    return self.error(401, "UNAUTHORIZED", "Inicia sesión para guardar")
                pid = int(m.group(1))
                exists = conn.execute("SELECT 1 FROM publications WHERE id=? AND status='PUBLISHED' AND deleted=0", (pid,)).fetchone()
                if not exists:
                    return self.error(404, "NOT_FOUND", "La publicación no está disponible")
                conn.execute("INSERT OR IGNORE INTO favorites(user_id,publication_id,created_at) VALUES(?,?,?)", (user["id"], pid, now()))
                return self.send_json({"favorite": True})

            m = re.fullmatch(r"/api/publications/(\d+)/submit", path)
            if m:
                if not user or user["role"] not in ("GESTOR", "ADMIN"):
                    return self.error(403, "FORBIDDEN", "Acceso denegado")
                pid = int(m.group(1))
                publication = conn.execute("SELECT author_id,status FROM publications WHERE id=? AND deleted=0", (pid,)).fetchone()
                if not publication:
                    return self.error(404, "NOT_FOUND", "Contenido no encontrado")
                if publication["author_id"] != user["id"] and user["role"] != "ADMIN":
                    return self.error(403, "FORBIDDEN", "No puedes enviar contenido de otro autor")
                if publication["status"] not in ("DRAFT", "REJECTED"):
                    return self.error(409, "INVALID_STATE", "Solo un borrador o contenido rechazado puede enviarse a revisión")
                conn.execute("UPDATE publications SET status='REVIEW', moderation_note=NULL, updated_at=? WHERE id=?", (now(), pid))
                return self.send_json({"message": "Enviado a revisión"})

            m = re.fullmatch(r"/api/publications/(\d+)/report", path)
            if m:
                if not user:
                    return self.error(401, "UNAUTHORIZED", "Inicia sesión para reportar")
                reason = str(data.get("reason", "")).strip()
                if len(reason) < 5:
                    return self.error(400, "VALIDATION", "Escribe el motivo del reporte")
                pid = int(m.group(1))
                exists = conn.execute("SELECT 1 FROM publications WHERE id=? AND status='PUBLISHED' AND deleted=0", (pid,)).fetchone()
                if not exists:
                    return self.error(404, "NOT_FOUND", "La publicación no está disponible")
                conn.execute("INSERT INTO reports(user_id,publication_id,reason,created_at) VALUES(?,?,?,?)", (user["id"], pid, reason, now()))
                return self.send_json({"message": "Reporte recibido"}, 201)

            m = re.fullmatch(r"/api/publications/(\d+)/images", path)
            if m:
                if not user:
                    return self.error(401, "UNAUTHORIZED", "Inicia sesión para continuar")
                pid = int(m.group(1))
                pub = conn.execute("SELECT id,status,author_id FROM publications WHERE id=? AND deleted=0", (pid,)).fetchone()
                if not pub:
                    return self.error(404, "NOT_FOUND", "Publicación no encontrada")
                if user["role"] != "ADMIN" and pub["author_id"] != user["id"]:
                    return self.error(403, "FORBIDDEN", "No puedes modificar esta publicación")
                url = str(data.get("url", "")).strip()
                if not url:
                    return self.error(400, "VALIDATION", "La URL es obligatoria")
                parsed_url = urlparse(url)
                if url.startswith("/") and not url.startswith("//"):
                    if len(url) > 2000:
                        return self.error(400, "VALIDATION", "La URL es demasiado larga")
                else:
                    if parsed_url.scheme != "https" or not parsed_url.netloc:
                        return self.error(400, "VALIDATION", "La URL debe ser una dirección HTTPS válida")
                    if len(url) > 2000:
                        return self.error(400, "VALIDATION", "La URL es demasiado larga")
                alt_text = str(data.get("alt_text", "")).strip()
                caption = str(data.get("caption", "")).strip() or None
                if "position" in data:
                    try:
                        position = int(data["position"])
                    except (TypeError, ValueError):
                        return self.error(400, "VALIDATION", "La posición debe ser un número entero")
                    if position < 0:
                        return self.error(400, "VALIDATION", "La posición no puede ser negativa")
                else:
                    max_row = conn.execute("SELECT MAX(position) FROM publication_images WHERE publication_id=?", (pid,)).fetchone()
                    position = (max_row[0] if max_row[0] is not None else -1) + 1
                try:
                    cur = conn.execute("INSERT INTO publication_images(publication_id,url,alt_text,caption,position) VALUES(?,?,?,?,?)", (pid, url, alt_text, caption, position))
                except sqlite3.IntegrityError:
                    return self.error(409, "CONFLICT", "Ya existe una imagen en esa posición")
                return self.send_json({"id": cur.lastrowid, "url": url, "alt_text": alt_text, "caption": caption, "position": position}, 201)

        self.error(404, "NOT_FOUND", "Ruta no encontrada")

    def do_PUT(self):
        path = urlparse(self.path).path
        data = self.body()
        user = auth(self)
        m = re.fullmatch(r"/api/publications/(\d+)", path)
        if data is None:
            return
        if not m:
            return self.error(404, "NOT_FOUND", "Ruta no encontrada")
        if not user or user["role"] not in ("GESTOR", "ADMIN"):
            return self.error(403, "FORBIDDEN", "Acceso denegado")
        pid = int(m.group(1))
        with get_db_connection() as conn:
            current = conn.execute("SELECT author_id,status FROM publications WHERE id=? AND deleted=0", (pid,)).fetchone()
            if not current:
                return self.error(404, "NOT_FOUND", "Contenido no encontrado")
            if current["author_id"] != user["id"] and user["role"] != "ADMIN":
                return self.error(403, "FORBIDDEN", "No puedes editar este contenido")
            if user["role"] == "GESTOR" and current["status"] not in ("DRAFT", "REJECTED"):
                return self.error(409, "INVALID_STATE", "Solo puedes editar borradores o contenidos rechazados")
            try:
                item = publication_input(data)
                validate_category(conn, item["category_id"], item["kind"])
            except ValueError as error:
                return self.error(400, "VALIDATION", str(error))
            conn.execute(
                "UPDATE publications SET category_id=?,kind=?,title=?,summary=?,content=?,image=?,location=?,start_date=?,end_date=?,link=?,status='DRAFT',moderation_note=NULL,updated_at=? WHERE id=?",
                (item["category_id"], item["kind"], item["title"], item["summary"], item["content"], item["image"], item["location"], item["start_date"], item["end_date"], item["link"], now(), pid),
            )
            sync_publication_detail(conn, pid, item)
        self.send_json({"message": "Contenido actualizado"})

    def do_PATCH(self):
        path = urlparse(self.path).path
        data = self.body()
        user = auth(self)
        m = re.fullmatch(r"/api/publications/(\d+)/status", path)
        if data is None:
            return
        if not m:
            return self.error(404, "NOT_FOUND", "Ruta no encontrada")
        if not user or user["role"] != "ADMIN":
            return self.error(403, "FORBIDDEN", "Solo un administrador puede moderar")
        status = str(data.get("status", ""))
        note = str(data.get("note", "")).strip()
        if status not in ("PUBLISHED", "REJECTED"):
            return self.error(400, "VALIDATION", "El administrador solo puede aprobar o rechazar")
        if status == "REJECTED" and len(note) < 5:
            return self.error(400, "VALIDATION", "Escribe un motivo de rechazo claro")
        with get_db_connection() as conn:
            publication = conn.execute("SELECT status FROM publications WHERE id=? AND deleted=0", (int(m.group(1)),)).fetchone()
            if not publication:
                return self.error(404, "NOT_FOUND", "Contenido no encontrado")
            if publication["status"] != "REVIEW":
                return self.error(409, "INVALID_STATE", "Solo se puede moderar contenido que esté en revisión")
            conn.execute("UPDATE publications SET status=?,moderation_note=?,updated_at=? WHERE id=?", (status, note or None, now(), int(m.group(1))))
        self.send_json({"message": "Estado actualizado"})

    def do_DELETE(self):
        path = urlparse(self.path).path
        user = auth(self)

        m = re.fullmatch(r"/api/publications/(\d+)/favorite", path)
        if m:
            if not user:
                return self.error(401, "UNAUTHORIZED", "Inicia sesión")
            with get_db_connection() as conn:
                conn.execute("DELETE FROM favorites WHERE user_id=? AND publication_id=?", (user["id"], int(m.group(1))))
            return self.send_json({"favorite": False})

        m = re.fullmatch(r"/api/publications/(\d+)/images/(\d+)", path)
        if m:
            if not user:
                return self.error(401, "UNAUTHORIZED", "Inicia sesión para continuar")
            pid = int(m.group(1))
            iid = int(m.group(2))
            with get_db_connection() as conn:
                pub = conn.execute("SELECT id,status,author_id FROM publications WHERE id=? AND deleted=0", (pid,)).fetchone()
                if not pub:
                    return self.error(404, "NOT_FOUND", "Publicación no encontrada")
                if user["role"] != "ADMIN" and pub["author_id"] != user["id"]:
                    return self.error(403, "FORBIDDEN", "No puedes modificar esta publicación")
                img = conn.execute("SELECT id FROM publication_images WHERE id=? AND publication_id=?", (iid, pid)).fetchone()
                if not img:
                    return self.error(404, "NOT_FOUND", "Imagen no encontrada")
                conn.execute("DELETE FROM publication_images WHERE id=? AND publication_id=?", (iid, pid))
            return self.send_json({"message": "Imagen eliminada"})

        m = re.fullmatch(r"/api/publications/(\d+)", path)
        if not m:
            return self.error(404, "NOT_FOUND", "Ruta no encontrada")
        if not user or user["role"] not in ("GESTOR", "ADMIN"):
            return self.error(403, "FORBIDDEN", "Acceso denegado")
        with get_db_connection() as conn:
            cur = conn.execute("UPDATE publications SET deleted=1,updated_at=? WHERE id=? AND (author_id=? OR ?='ADMIN')", (now(), int(m.group(1)), user["id"], user["role"]))
            if cur.rowcount == 0:
                return self.error(403, "FORBIDDEN", "No puedes eliminar este contenido")
        self.send_json({"message": "Contenido eliminado"})


def main():
    init_db()
    server = ThreadingHTTPServer((HOST, PORT), Handler)
    url = f"http://{HOST}:{PORT}"
    print(f"TEJIDO está disponible en {url}")
    print("Presiona Ctrl+C para detener.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nTEJIDO detenido.")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
