from datetime import datetime, timezone

from backend.database.connection import get_db_connection
from backend.services.auth_service import hash_password


def now():
    return datetime.now(timezone.utc).isoformat()


def seed_database():
    with get_db_connection() as conn:
        conn.execute("DELETE FROM sessions WHERE expires_at<=?", (now(),))
        conn.executemany(
            "INSERT OR IGNORE INTO roles(id, name) VALUES(?, ?)",
            [(1, "ADMIN"), (2, "GESTOR"), (3, "CIUDADANO")],
        )

        users = [
            (1, "Valentina Admin", "admin@tejido.co", "Admin123!"),
            (2, "Mateo Gestor", "gestor@tejido.co", "Gestor123!"),
            (3, "Sofía Ciudadana", "ciudadano@tejido.co", "Ciudadano123!"),
        ]

        for role_id, name, email, password in users:
            conn.execute(
                "INSERT OR IGNORE INTO users(role_id, name, email, password_hash, created_at) VALUES(?,?,?,?,?)",
                (role_id, name, email, hash_password(password), now()),
            )

        categories = [
            ("Historias", "HISTORIA", "#805AD5"),
            ("Eventos", "EVENTO", "#F59E0B"),
            ("Oportunidades", "OPORTUNIDAD", "#16A085"),
            ("Talento", "TALENTO", "#EC4899"),
            ("Iniciativas", "INICIATIVA", "#3B82F6"),
        ]

        conn.executemany(
            "INSERT OR IGNORE INTO categories(name, type, color) VALUES(?,?,?)",
            categories,
        )

        conn.execute(
            "INSERT OR IGNORE INTO organizations(id, user_id, name, description, contact) VALUES(1,2,'Colectivo Río Vivo','Gestión cultural y ambiental desde Caucasia.','hola@riovivo.co')"
        )

        if conn.execute("SELECT COUNT(*) FROM publications").fetchone()[0] == 0:
            seed_publications = [
                (2, 2, 'EVENTO', 'Festival Río y Sabana 2026', 'Música, gastronomía y emprendimiento junto al río Cauca.', 'Tres días para encontrarnos alrededor de los sonidos, sabores e iniciativas que nacen en el Bajo Cauca. Habrá tarima local, mercado creativo y recorridos ambientales.', 'linear-gradient(135deg,#F6C453,#F08A5D)', 'Malecón de Caucasia', '2026-07-18T15:00', '2026-07-20T22:00', 'https://example.com/festival', 1, 'PUBLISHED'),
                (2, 1, 'HISTORIA', 'Las manos que tejen memoria', 'Artesanas de El Pando convierten fibras y relatos en piezas únicas.', 'Un grupo de mujeres reúne saberes heredados y diseño contemporáneo para contar historias del territorio a través del tejido.', 'linear-gradient(135deg,#845EC2,#D65DB1)', 'El Pando, Caucasia', None, None, None, 1, 'PUBLISHED'),
                (2, 3, 'OPORTUNIDAD', 'Convocatoria Semillas Creativas', 'Apoyo para jóvenes con ideas culturales y comunitarias.', 'La convocatoria entrega mentoría y capital semilla a diez proyectos liderados por jóvenes de 18 a 28 años.', 'linear-gradient(135deg,#00A896,#89C2D9)', 'Caucasia', None, '2026-08-15', 'https://example.com/semillas', 1, 'PUBLISHED'),
                (2, 4, 'TALENTO', 'Samuel Torres: fotografía del territorio', 'Un lente joven que encuentra belleza en la vida cotidiana.', 'Samuel recorre barrios y veredas documentando gestos, oficios y paisajes que suelen pasar desapercibidos.', 'linear-gradient(135deg,#264653,#2A9D8F)', 'Caucasia', None, None, None, 0, 'PUBLISHED'),
                (2, 5, 'INICIATIVA', 'Biblioteca al parque', 'Lecturas, juegos y conversación cada sábado.', 'Una red de voluntarios lleva libros y actividades a parques de distintos barrios para acercar la lectura a niñas, niños y familias.', 'linear-gradient(135deg,#3B82F6,#8B5CF6)', 'Parques de Caucasia', '2026-07-04T09:00', None, None, 0, 'PUBLISHED'),
                (2, 2, 'EVENTO', 'Mercado Hecho en Caucasia', 'Emprendimientos locales, música y cocina en un solo lugar.', 'Encuentra marcas locales, productos agrícolas, diseño y cocina del territorio. Entrada libre.', 'linear-gradient(135deg,#F59E0B,#EF4444)', 'Parque de las Banderas', '2026-07-11T10:00', '2026-07-11T19:00', None, 0, 'PUBLISHED'),
            ]

            for row in seed_publications:
                cur = conn.execute(
                    "INSERT INTO publications(author_id,category_id,kind,title,summary,content,image,location,start_date,end_date,link,featured,status,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
                    row + (now(), now()),
                )
                if row[2] == 'EVENTO':
                    conn.execute(
                        "INSERT INTO events(publication_id, venue, capacity) VALUES(?,?,?)",
                        (cur.lastrowid, row[7], 300),
                    )
                if row[2] == 'OPORTUNIDAD':
                    conn.execute(
                        "INSERT INTO opportunities(publication_id, organization_name, deadline) VALUES(?,?,?)",
                        (cur.lastrowid, 'Alianza Bajo Cauca', row[9]),
                    )

        # Activity types
        activity_types = [
            ('INTERNAL_SHARE', 'Compartir publicación', 10, 0, 'Compartir una publicación de TEJIDO en redes sociales'),
            ('EXTERNAL_SHARE', 'Compartir en redes', 15, 1, 'Compartir contenido de TEJIDO en Instagram, Facebook, etc.'),
            ('EXTERNAL_MENTION', 'Mencionar TEJIDO', 25, 1, 'Mencionar TEJIDO en video, radio o blog'),
            ('EVENT_ATTEND', 'Asistir a evento', 20, 1, 'Asistir a un evento presencial de TEJIDO'),
            ('COMMUNITY_MEET', 'Reunión comunitaria', 30, 1, 'Organizar una reunión comunitaria sobre TEJIDO'),
            ('TEACH_TEJIDO', 'Enseñar TEJIDO', 20, 0, 'Enseñar a alguien a usar la plataforma'),
            ('CONTENT_CREATE', 'Crear contenido', 25, 1, 'Crear contenido sobre el Bajo Cauca inspirado en TEJIDO'),
            ('PHOTO_PLACE', 'Foto en sitio cultural', 15, 1, 'Tomar foto en un sitio cultural del Bajo Cauca'),
            ('REFER_USER', 'Referir usuario', 50, 0, 'Registrar un nuevo usuario en TEJIDO'),
        ]
        conn.executemany(
            "INSERT OR IGNORE INTO activity_types(type, name, default_points, requires_evidence, description) VALUES(?,?,?,?,?)",
            activity_types,
        )

        # Rewards
        rewards = [
            ('Entrada a evento premium', 'Acceso a eventos exclusivos de TEJIDO', 200, 'EVENTO', None, 50),
            ('Camiseta Tejido', 'Camiseta oficial del proyecto TEJido', 500, 'MERCH', None, 20),
            ('Poster Bajo Cauca', 'Poster ilustrado del territorio', 300, 'MERCH', None, 30),
            ('10% descuento artesanías', 'Descuento en el marketplace de artesanías', 100, 'DCTO', None, -1),
            ('Destacado en la web', 'Tu perfil aparece destacado por 1 semana', 1000, 'DESTACADO', None, -1),
            ('Stickers TEJIDO', 'Pack de 5 stickers con diseños del Bajo Cauca', 150, 'MERCH', None, 40),
            ('Taller premium gratis', 'Acceso a un taller cultural exclusivo', 250, 'EVENTO', None, 15),
            ('Mención en redes', 'TEJIDO te menciona en sus redes sociales', 400, 'DESTACADO', None, -1),
        ]
        conn.executemany(
            "INSERT OR IGNORE INTO rewards(name, description, points_cost, category, image, stock) VALUES(?,?,?,?,?,?)",
            rewards,
        )
