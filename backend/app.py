#!/usr/bin/env python3
import json
import mimetypes
import re
from datetime import datetime, timezone
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse

from backend.api.mutations import route_delete, route_patch, route_post, route_put
from backend.api.routes import handle_auth_login, handle_auth_logout, route_api, route_api_post
from backend.config import HOST, LOG_API_REQUESTS, PORT, PUBLIC_DIR
from backend.database.init_db import init_db

MAX_BODY_BYTES = 1_000_000


def now():
    return datetime.now(timezone.utc).isoformat()


class Handler(SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        request = format % args
        status = int(args[1]) if len(args) > 1 and str(args[1]).isdigit() else 0
        is_api = str(args[0]).startswith("/api/") if args else False
        if LOG_API_REQUESTS and (is_api or status >= 400):
            print(f"[TEJIDO API] {request}")

    def send_json(self, data, status=200):
        body = json.dumps(data, ensure_ascii=False).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def error(self, status, code, message):
        self.send_json({"error": code, "message": message}, status)

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
            if path.startswith("/artistas/"):
                target = PUBLIC_DIR / "index.html"
            else:
                target = PUBLIC_DIR / "index.html"
        data = target.read_bytes()
        mime = mimetypes.guess_type(target.name)[0] or "application/octet-stream"
        self.send_response(200)
        self.send_header("Content-Type", mime + ("; charset=utf-8" if mime.startswith("text/") or mime == "application/javascript" else ""))
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self):
        if self.path.startswith("/api/"):
            return route_api(self)
        return self.serve_static()

    def do_POST(self):
        data = self.body()
        if data is None:
            return
        path = urlparse(self.path).path
        if path == "/api/auth/login":
            return handle_auth_login(self, data)
        if path == "/api/auth/logout":
            return handle_auth_logout(self)
        if path in ("/api/suggestions", "/api/support"):
            return route_api_post(self, path, data)
        if path.startswith("/api/collaborators/"):
            return route_post(self, path, data, now)
        return route_post(self, path, data, now)

    def do_PUT(self):
        data = self.body()
        if data is None:
            return
        path = urlparse(self.path).path
        match = re.fullmatch(r"/api/publications/(\d+)", path)
        if match:
            return route_put(self, int(match.group(1)), data, now)
        match = re.fullmatch(r"/api/artists/(\d+)", path)
        if match:
            return route_put_artist(self, int(match.group(1)), data, now)
        match = re.fullmatch(r"/api/artists/(\d+)/timeline/(\d+)", path)
        if match:
            return route_put_artist_timeline(self, int(match.group(1)), int(match.group(2)), data)
        match = re.fullmatch(r"/api/artists/(\d+)/media/(\d+)", path)
        if match:
            return route_put_artist_media(self, int(match.group(1)), int(match.group(2)), data)
        return self.error(404, "NOT_FOUND", "Ruta no encontrada")

    def do_PATCH(self):
        data = self.body()
        match = re.fullmatch(r"/api/publications/(\d+)/status", urlparse(self.path).path)
        if data is None:
            return
        if not match:
            return self.error(404, "NOT_FOUND", "Ruta no encontrada")
        return route_patch(self, int(match.group(1)), data, now)

    def do_DELETE(self):
        return route_delete(self, urlparse(self.path).path, now)


def main():
    init_db()
    server = ThreadingHTTPServer((HOST, PORT), Handler)
    print("TEJIDO backend iniciado correctamente")
    print(f"API: http://{HOST}:{PORT}/api/health")
    print("Esperando solicitudes...")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nTEJIDO detenido.")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
