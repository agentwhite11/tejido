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
            (3, "Sofia Ciudadana", "ciudadano@tejido.co", "Ciudadano123!"),
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
            "INSERT OR IGNORE INTO organizations(id, user_id, name, description, contact) VALUES(1,2,'Colectivo Rio Vivo','Gestion cultural y ambiental desde Caucasia.','hola@riovivo.co')"
        )

        if conn.execute("SELECT COUNT(*) FROM publications").fetchone()[0] == 0:
            seed_publications = [
                (2, 2, 'EVENTO', 'Festival Rio y Sabana 2026', 'Musica, gastronomia y emprendimiento junto al rio Cauca.', 'Tres dias para encontrarnos alrededor de los sonidos, sabores e iniciativas que nacen en el Bajo Cauca. Habra tarima local, mercado creativo y recorridos ambientales.', 'linear-gradient(135deg,#F6C453,#F08A5D)', 'Malecon de Caucasia', '2026-07-18T15:00', '2026-07-20T22:00', 'https://example.com/festival', 1, 'PUBLISHED'),
                (2, 1, 'HISTORIA', 'Las manos que tejen memoria', 'Artesanas de El Pando convierten fibras y relatos en piezas unicas.', 'Un grupo de mujeres reune saberes heredados y diseno contemporaneo para contar historias del territorio a traves del tejido.', 'linear-gradient(135deg,#845EC2,#D65DB1)', 'El Pando, Caucasia', None, None, None, 1, 'PUBLISHED'),
                (2, 3, 'OPORTUNIDAD', 'Convocatoria Semillas Creativas', 'Apoyo para jovenes con ideas culturales y comunitarias.', 'La convocatoria entrega mentoria y capital semilla a diez proyectos liderados por jovenes de 18 a 28 anios.', 'linear-gradient(135deg,#00A896,#89C2D9)', 'Caucasia', None, '2026-08-15', 'https://example.com/semillas', 1, 'PUBLISHED'),
                (2, 4, 'TALENTO', 'Samuel Torres: fotografia del territorio', 'Un lente joven que encuentra belleza en la vida cotidiana.', 'Samuel recorre barrios y veredas documentando gestos, oficios y paisajes que suelen pasar desapercibidos.', 'linear-gradient(135deg,#264653,#2A9D8F)', 'Caucasia', None, None, None, 0, 'PUBLISHED'),
                (2, 5, 'INICIATIVA', 'Biblioteca al parque', 'Lecturas, juegos y conversacion cada sabado.', 'Una red de voluntarios lleva libros y actividades a parques de distintos barrios para acercar la lectura a ninnas, ninos y familias.', 'linear-gradient(135deg,#3B82F6,#8B5CF6)', 'Parques de Caucasia', '2026-07-04T09:00', None, None, 0, 'PUBLISHED'),
                (2, 2, 'EVENTO', 'Mercado Hecho en Caucasia', 'Emprendimientos locales, musica y cocina en un solo lugar.', 'Encuentra marcas locales, productos agricolas, diseno y cocina del territorio. Entrada libre.', 'linear-gradient(135deg,#F59E0B,#EF4444)', 'Parque de las Banderas', '2026-07-11T10:00', '2026-07-11T19:00', None, 0, 'PUBLISHED'),
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

        activity_types = [
            ('INTERNAL_SHARE', 'Compartir publicacion', 10, 0, 'Compartir una publicacion de TEJIDO en redes sociales'),
            ('EXTERNAL_SHARE', 'Compartir en redes', 15, 1, 'Compartir contenido de TEJIDO en Instagram, Facebook, etc.'),
            ('EXTERNAL_MENTION', 'Mencionar TEJIDO', 25, 1, 'Mencionar TEJIDO en video, radio o blog'),
            ('EVENT_ATTEND', 'Asistir a evento', 20, 1, 'Asistir a un evento presencial de TEJIDO'),
            ('COMMUNITY_MEET', 'Reunion comunitaria', 30, 1, 'Organizar una reunion comunitaria sobre TEJIDO'),
            ('TEACH_TEJIDO', 'Ensennar TEJIDO', 20, 0, 'Ensennar a alguien a usar la plataforma'),
            ('CONTENT_CREATE', 'Crear contenido', 25, 1, 'Crear contenido sobre el Bajo Cauca inspirado en TEJIDO'),
            ('PHOTO_PLACE', 'Foto en sitio cultural', 15, 1, 'Tomar foto en un sitio cultural del Bajo Cauca'),
            ('REFER_USER', 'Referir usuario', 50, 0, 'Registrar un nuevo usuario en TEJIDO'),
            ('MUSIC_SHARE', 'Compartir musica', 15, 1, 'Compartir musica de artistas Moneystack en redes sociales'),
            ('CONCERT_ATTEND', 'Asistir a concierto', 30, 1, 'Asistir a un concierto o evento en vivo de Moneystack'),
        ]
        conn.executemany(
            "INSERT OR IGNORE INTO activity_types(type, name, default_points, requires_evidence, description) VALUES(?,?,?,?,?)",
            activity_types,
        )

        rewards = [
            ('Entrada a evento premium', 'Acceso a eventos exclusivos de TEJIDO', 200, 'EVENTO', None, 50),
            ('Camiseta Tejido', 'Camiseta oficial del proyecto TEJIDO', 500, 'MERCH', None, 20),
            ('Poster Bajo Cauca', 'Poster ilustrado del territorio', 300, 'MERCH', None, 30),
            ('10% descuento artesanias', 'Descuento en el marketplace de artesanias', 100, 'DCTO', None, -1),
            ('Destacado en la web', 'Tu perfil aparece destacado por 1 semana', 1000, 'DESTACADO', None, -1),
            ('Stickers TEJIDO', 'Pack de 5 stickers con disenos del Bajo Cauca', 150, 'MERCH', None, 40),
            ('Taller premium gratis', 'Acceso a un taller cultural exclusivo', 250, 'EVENTO', None, 15),
            ('Mencion en redes', 'TEJIDO te menciona en sus redes sociales', 400, 'DESTACADO', None, -1),
            ('Camiseta Moneystack', 'Merch oficial del sello Moneystack', 400, 'MERCH', None, 25),
            ('Vinilo Og Mauro', 'Vinilo firmado por Og Mauro', 800, 'MERCH', None, 10),
            ('Sesion de estudio', 'Una sesion en el estudio de Moneystack', 1500, 'EXPERIENCIA', None, 5),
            ('Entrada concierto Moneystack', 'Acceso a proximo concierto de Moneystack', 200, 'EVENTO', None, 30),
        ]
        conn.executemany(
            "INSERT OR IGNORE INTO rewards(name, description, points_cost, category, image, stock) VALUES(?,?,?,?,?,?)",
            rewards,
        )

        # ── Artista Og Mauro — perfil completo ──────────────────────
        if conn.execute("SELECT COUNT(*) FROM artists").fetchone()[0] == 0:
            ts = now()
            conn.execute(
                """INSERT INTO artists(name, stage_name, slug, real_name, bio, image, hero_image,
                   genre, city, region, spotify_url, youtube_url, instagram_url, tiktok_url,
                   featured, created_at, updated_at)
                   VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
                (
                    "Oscar Mauro",
                    "Og Mauro",
                    "og-mauro",
                    "Oscar Mauro",
                    "Artista del Bajo Cauca que lleva la esencia de nuestro territorio a cada escenario. "
                    "Su musica conecta las raices del rio Cauca con el ritmo urbano, creando un sonido unico "
                    "que representa la identidad del Bajo Cauca antioqueno. Bajo el sello Moneystack, "
                    "Og Mauro ha consolidado una voz propia que habla del territorio, la calle y la cultura.",
                    "/assets/artistas/og-mauro.jpg",
                    "/assets/artistas/og-mauro-hero.jpg",
                    "Urbano / Rap / Hip-Hop",
                    "Caucasia",
                    "Bajo Cauca, Antioquia",
                    None,
                    None,
                    None,
                    None,
                    1,
                    ts,
                    ts,
                ),
            )
            artist_id = conn.execute("SELECT last_insert_rowid()").fetchone()[0]

            # ── Discografia ─────────────────────────────────────────
            tracks = [
                (artist_id, "Sustancias", "sustancias", "Single", "Urbano", "3:45", None,
                 "Un tema que habla de las presiones de la calle y las decisiones que definen caminos.",
                 None, None, None, None, "2024-03-15", "published", 1),
                (artist_id, "Bajo Cauca", "bajo-cauca", "Single", "Urbano", "3:20", None,
                 "Homenaje a la tierra que lo vio nacer. Un rap crudo sobre la vida en el Bajo Cauca.",
                 None, None, None, None, "2024-08-20", "published", 0),
                (artist_id, "Rio Cauca", "rio-cauca", "Single", "Urbano", "3:58", None,
                 "El rio como testigo de historias, luchas y victorias del territorio.",
                 None, None, None, None, "2025-02-10", "published", 0),
                (artist_id, "Calle y Cultura", "calle-y-cultura", "EP", "Urbano", "4:12", None,
                 "Cuatro pistas que narran la dualidad entre la vida urbana y las raices culturales.",
                 None, None, None, None, "2025-09-05", "published", 0),
                (artist_id, "Territorio", "territorio", "Single", "Urbano", "3:33", None,
                 "Invocacion al territorio como identidad. Un himno para el Bajo Cauca.",
                 None, None, None, None, "2026-04-01", "published", 0),
            ]
            conn.executemany(
                """INSERT INTO tracks(artist_id, title, slug, album, genre, duration, cover_image,
                   description, spotify_url, youtube_url, apple_music_url, amazon_music_url,
                   release_date, status, featured, created_at)
                   VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
                [t + (ts,) for t in tracks],
            )

            # ── Timeline ────────────────────────────────────────────
            timeline = [
                (artist_id, "Los inicios", "Og Mauro comienza a rapear en los barrios de Caucasia, influencers locales y fiestas comunitarias. Su voz rapida y su flow natural llaman la atencion.", "2022-06-01", None, None, 1),
                (artist_id, "Moneystack lo detecta", "El sello independiente Moneystack lo contacta despues de viralizar un freestyle en redes. Firman un acuerdo de distribucion.", "2023-10-15", None, None, 2),
                (artist_id, "Primer lanzamiento: Sustancias", "Su primer single oficial sale en todas las plataformas. Supera las 10,000 reproducciones en el primer mes.", "2024-03-15", None, None, 3),
                (artist_id, "Calle y Cultura EP", "Lanza su primer EP con 4 pistas que consolidan su sonido. Recibe cobertura en medios locales del Bajo Cauca.", "2025-09-05", None, None, 4),
                (artist_id, "Nueva etapa: Territorio", "Regresa con un single que define su identidad artistica. Prepara su primer concierto en Caucasia.", "2026-04-01", None, None, 5),
            ]
            conn.executemany(
                """INSERT INTO artist_timeline(artist_id, titulo, descripcion, fecha, imagen_url, video_url, orden)
                   VALUES(?,?,?,?,?,?,?)""",
                timeline,
            )

            # ── Media / Galeria ─────────────────────────────────────
            media = [
                (artist_id, "image", "/assets/artistas/og-mauro-1.jpg", "Ensayo fotográfico", "Sesion de fotos para la portada de Territorio", "2026-03-01", 1, 1),
                (artist_id, "image", "/assets/artistas/og-mauro-2.jpg", "En el estudio", "Grabando en el estudio de Moneystack", "2025-08-15", 2, 0),
                (artist_id, "image", "/assets/artistas/og-mauro-3.jpg", "En vivo", "Presentacion en el Festival Rio y Sabana", "2025-07-18", 3, 1),
                (artist_id, "image", "/assets/artistas/og-mauro-4.jpg", "Detras de escena", "Backstage antes del concierto", "2025-09-20", 4, 0),
                (artist_id, "video", "https://www.youtube.com/watch?v=dQw4w9WgXcQ", "Bajo Cauca - Video Oficial", "El video oficial del tema que define su carrera", "2024-08-20", 5, 1),
                (artist_id, "video", "https://www.youtube.com/watch?v=dQw4w9WgXcQ", "Freestyle Session", "Sesion de freestyle en el malecon de Caucasia", "2023-11-10", 6, 0),
            ]
            conn.executemany(
                """INSERT INTO artist_media(artist_id, tipo, url, titulo, descripcion, fecha, orden, destacado)
                   VALUES(?,?,?,?,?,?,?,?)""",
                media,
            )

            # ── Redes sociales ──────────────────────────────────────
            social = [
                (artist_id, "spotify", "https://open.spotify.com/artist/og-mauro", "ogmauro", "spotify", 1),
                (artist_id, "youtube", "https://youtube.com/@ogmauro", "ogmauro", "youtube", 2),
                (artist_id, "instagram", "https://instagram.com/ogmauro", "@ogmauro", "instagram", 3),
                (artist_id, "tiktok", "https://tiktok.com/@ogmauro", "@ogmauro", "tiktok", 4),
            ]
            conn.executemany(
                """INSERT INTO artist_social_links(artist_id, platform, url, username, icon, orden)
                   VALUES(?,?,?,?,?,?)""",
                social,
            )

            # ── Conexiones territoriales ────────────────────────────
            connections = [
                (artist_id, "collective", None, "Moneystack", "Sello independiente nacido en Caucasia. El sello que moue la cultura del Bajo Cauca.", "/assets/logos/moneystack.png", 1),
                (artist_id, "place", None, "Caucasia", "Ciudad del Bajo Cauca, cuna del talento y la cultura urbana antioquena.", None, 2),
                (artist_id, "event", None, "Festival Rio y Sabana 2026", "El festival mas importante del Bajo Cauca. Og Mauro participa como artista invitado.", None, 3),
                (artist_id, "story", None, "Las manos que tejen memoria", "Historia de las artesanas de El Pando que inspira la conexion entre musica y territorio.", None, 4),
            ]
            conn.executemany(
                """INSERT INTO artist_connections(artist_id, entity_type, entity_id, titulo, descripcion, imagen_url, orden)
                   VALUES(?,?,?,?,?,?,?)""",
                connections,
            )

            # ── Metricas mock (dashboard) ──────────────────────────
            metrics = [
                (artist_id, "monthly_listeners", 12500, "2026-09-01", None),
                (artist_id, "total_streams", 85000, "2026-09-01", None),
                (artist_id, "followers_spotify", 3200, "2026-09-01", None),
                (artist_id, "followers_instagram", 5800, "2026-09-01", None),
                (artist_id, "events_performed", 8, "2026-09-01", None),
                (artist_id, "releases_count", 5, "2026-09-01", None),
            ]
            conn.executemany(
                """INSERT INTO artist_metrics(artist_id, tipo, valor, fecha, metadata)
                   VALUES(?,?,?,?,?)""",
                metrics,
            )
