"""Pruebas automáticas del flujo principal de TEJIDO.

Se ejecutan sobre una copia temporal de la base de datos. Nunca modifican
``data/tejido.db`` ni necesitan librerías externas.
"""

import importlib.util
import json
import shutil
import tempfile
import threading
import unittest
import urllib.error
import urllib.request
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location("tejido_server_test", ROOT / "server.py")
APP = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(APP)


class TejidoApiTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.temp_dir = tempfile.TemporaryDirectory(prefix="tejido-test-", ignore_cleanup_errors=True)
        APP.DB_PATH = Path(cls.temp_dir.name) / "tejido.db"
        shutil.copy2(ROOT / "data" / "tejido.db", APP.DB_PATH)
        APP.init_db()

        cls.server = APP.ThreadingHTTPServer(("127.0.0.1", 0), APP.Handler)
        cls.server.daemon_threads = True
        cls.thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()
        cls.base_url = f"http://127.0.0.1:{cls.server.server_address[1]}"

        cls.gestor = cls.login("gestor@tejido.co", "Gestor123!")
        cls.admin = cls.login("admin@tejido.co", "Admin123!")
        cls.citizen = cls.login("ciudadano@tejido.co", "Ciudadano123!")

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        cls.server.server_close()
        cls.thread.join(timeout=3)
        cls.temp_dir.cleanup()

    @classmethod
    def request(cls, path, method="GET", token=None, body=None, raw=None):
        headers = {}
        data = None
        if token:
            headers["Authorization"] = "Bearer " + token
        if raw is not None:
            headers["Content-Type"] = "application/json"
            data = raw
        elif body is not None:
            headers["Content-Type"] = "application/json"
            data = json.dumps(body).encode()

        request = urllib.request.Request(
            cls.base_url + path, data=data, headers=headers, method=method
        )
        try:
            with urllib.request.urlopen(request, timeout=5) as response:
                content_type = response.headers.get_content_type()
                result = json.loads(response.read().decode()) if content_type == "application/json" else None
                return response.status, result
        except urllib.error.HTTPError as error:
            return error.code, json.loads(error.read().decode())

    @classmethod
    def login(cls, email, password):
        status, result = cls.request(
            "/api/auth/login", "POST", body={"email": email, "password": password}
        )
        if status != 200:
            raise AssertionError(f"No se pudo iniciar sesión con {email}")
        return result

    @classmethod
    def valid_publication(cls, title="Publicación de prueba"):
        return {
            "kind": "EVENTO",
            "category_id": 2,
            "title": title,
            "summary": "Resumen suficiente para una prueba automática",
            "content": "Contenido suficientemente largo para probar el flujo de TEJIDO.",
            "location": "Caucasia",
            "start_date": "2026-07-17T15:00",
            "end_date": "2026-07-18T15:00",
            "link": "https://example.com/registro",
            "image": "https://example.com/imagen.jpg",
        }

    def create_as_gestor(self, title="Publicación de prueba"):
        status, result = self.request(
            "/api/publications",
            "POST",
            self.gestor["token"],
            self.valid_publication(title),
        )
        self.assertEqual(status, 201)
        return result["id"]

    def test_01_health_and_roles(self):
        status, health = self.request("/api/health")
        self.assertEqual(status, 200)
        self.assertEqual(health["database"], "sqlite")
        self.assertEqual(self.gestor["user"]["role"], "GESTOR")
        self.assertEqual(self.admin["user"]["role"], "ADMIN")
        self.assertEqual(self.citizen["user"]["role"], "CIUDADANO")

    def test_01b_tropico_seed_is_idempotent_and_has_gallery(self):
        APP.init_db()
        APP.init_db()
        status, publications = self.request("/api/publications")
        self.assertEqual(status, 200)
        matches = [item for item in publications if item["title"] == "Arte que une: Colectivo Trópico Utópico"]
        self.assertEqual(len(matches), 1)
        publication = matches[0]
        self.assertEqual(publication["kind"], "INICIATIVA")
        self.assertEqual(publication["image"], "/assets/tropico-utopico/portada-memoria-resistencia.jpg")
        self.assertEqual(len(publication["gallery"]), 4)
        self.assertIsNone(publication["start_date"])
        self.assertIsNone(publication["end_date"])

    def test_02_public_list_only_contains_published_content(self):
        self.create_as_gestor("Borrador que no debe aparecer")
        status, publications = self.request("/api/publications", token=self.gestor["token"])
        self.assertEqual(status, 200)
        self.assertTrue(all(item["status"] == "PUBLISHED" for item in publications))

    def test_03_private_draft_is_only_visible_to_author_or_admin(self):
        status, draft = self.request(
            "/api/publications",
            "POST",
            self.admin["token"],
            {
                "kind": "HISTORIA",
                "category_id": 1,
                "title": "Borrador privado del administrador",
                "summary": "Resumen privado suficientemente claro",
                "content": "Contenido privado suficientemente largo para validar permisos.",
                "location": "Caucasia",
            },
        )
        self.assertEqual(status, 201)
        status, _ = self.request(
            f"/api/publications/{draft['id']}", token=self.gestor["token"]
        )
        self.assertEqual(status, 403)

    def test_04_image_and_end_date_are_updated(self):
        publication_id = self.create_as_gestor("Contenido que será editado")
        updated = self.valid_publication("Contenido editado correctamente")
        updated["image"] = "https://example.com/imagen-nueva.jpg"
        updated["end_date"] = "2026-07-20T15:00"
        status, _ = self.request(
            f"/api/publications/{publication_id}", "PUT", self.gestor["token"], updated
        )
        self.assertEqual(status, 200)
        _, publication = self.request(
            f"/api/publications/{publication_id}", token=self.gestor["token"]
        )
        self.assertEqual(publication["image"], updated["image"])
        self.assertEqual(publication["end_date"], updated["end_date"])

    def test_04b_gallery_is_created_ordered_preserved_and_cleared(self):
        payload = self.valid_publication("Contenido con galería")
        payload["gallery"] = [
            {
                "path": "/assets/pruebas/segunda.jpg",
                "alt_text": "Segunda imagen de prueba",
                "caption": "Segundo pie de foto",
                "position": 2,
            },
            {
                "url": "https://example.com/primera.jpg",
                "alt_text": "Primera imagen de prueba",
                "caption": "Primer pie de foto",
                "position": 0,
            },
        ]
        status, created = self.request(
            "/api/publications", "POST", self.gestor["token"], payload
        )
        self.assertEqual(status, 201)

        _, publication = self.request(
            f"/api/publications/{created['id']}", token=self.gestor["token"]
        )
        self.assertEqual([image["position"] for image in publication["gallery"]], [0, 2])
        self.assertEqual(publication["gallery"][1]["url"], "/assets/pruebas/segunda.jpg")

        legacy_update = self.valid_publication("Galería conservada por compatibilidad")
        self.assertEqual(
            self.request(
                f"/api/publications/{created['id']}",
                "PUT",
                self.gestor["token"],
                legacy_update,
            )[0],
            200,
        )
        _, publication = self.request(
            f"/api/publications/{created['id']}", token=self.gestor["token"]
        )
        self.assertEqual(len(publication["gallery"]), 2)

        legacy_update["gallery"] = []
        self.assertEqual(
            self.request(
                f"/api/publications/{created['id']}",
                "PUT",
                self.gestor["token"],
                legacy_update,
            )[0],
            200,
        )
        _, publication = self.request(
            f"/api/publications/{created['id']}", token=self.gestor["token"]
        )
        self.assertEqual(publication["gallery"], [])

    def test_05_invalid_data_returns_controlled_errors(self):
        invalid_kind = self.valid_publication("Tipo inválido")
        invalid_kind["kind"] = "TIPO_INVENTADO"
        self.assertEqual(
            self.request("/api/publications", "POST", self.gestor["token"], invalid_kind)[0],
            400,
        )

        wrong_category = self.valid_publication("Categoría incompatible")
        wrong_category["category_id"] = 1
        self.assertEqual(
            self.request("/api/publications", "POST", self.gestor["token"], wrong_category)[0],
            400,
        )
        self.assertEqual(
            self.request(
                "/api/publications", "POST", self.gestor["token"], raw=b"{mal json"
            )[0],
            400,
        )

        unsafe_gallery = self.valid_publication("Ruta local insegura")
        unsafe_gallery["gallery"] = [{"path": "/assets/../secreto.jpg"}]
        self.assertEqual(
            self.request(
                "/api/publications", "POST", self.gestor["token"], unsafe_gallery
            )[0],
            400,
        )

    def test_06_missing_relations_return_404(self):
        self.assertEqual(
            self.request(
                "/api/publications/999999/favorite", "POST", self.citizen["token"], {}
            )[0],
            404,
        )
        self.assertEqual(
            self.request(
                "/api/publications/999999/report",
                "POST",
                self.citizen["token"],
                {"reason": "Contenido inexistente"},
            )[0],
            404,
        )

    def test_07_moderation_respects_state_transitions(self):
        publication_id = self.create_as_gestor("Contenido para moderar")
        self.assertEqual(
            self.request(
                f"/api/publications/{publication_id}/submit", "POST", self.gestor["token"], {}
            )[0],
            200,
        )
        self.assertEqual(
            self.request(
                f"/api/publications/{publication_id}/submit", "POST", self.gestor["token"], {}
            )[0],
            409,
        )
        self.assertEqual(
            self.request(
                f"/api/publications/{publication_id}/status",
                "PATCH",
                self.admin["token"],
                {"status": "PUBLISHED", "note": ""},
            )[0],
            200,
        )
        self.assertEqual(
            self.request(
                f"/api/publications/{publication_id}",
                "PUT",
                self.gestor["token"],
                self.valid_publication("Edición no permitida"),
            )[0],
            409,
        )

    def test_08_missing_static_asset_returns_404(self):
        self.assertEqual(self.request("/archivo-inexistente.css")[0], 404)


if __name__ == "__main__":
    unittest.main(verbosity=2)
