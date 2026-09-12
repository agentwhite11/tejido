from pathlib import Path

from backend.database.connection import get_db_connection

_ARTIST_MIGRATIONS = [
    "ALTER TABLE artists ADD COLUMN slug TEXT",
    "ALTER TABLE artists ADD COLUMN real_name TEXT",
    "ALTER TABLE artists ADD COLUMN hero_image TEXT",
    "ALTER TABLE artists ADD COLUMN genre TEXT",
    "ALTER TABLE artists ADD COLUMN city TEXT DEFAULT 'Caucasia'",
    "ALTER TABLE artists ADD COLUMN region TEXT DEFAULT 'Bajo Cauca, Antioquia'",
    "ALTER TABLE artists ADD COLUMN featured INTEGER NOT NULL DEFAULT 0",
    "ALTER TABLE artists ADD COLUMN updated_at TEXT",
    "ALTER TABLE tracks ADD COLUMN slug TEXT",
    "ALTER TABLE tracks ADD COLUMN genre TEXT",
    "ALTER TABLE tracks ADD COLUMN description TEXT",
    "ALTER TABLE tracks ADD COLUMN apple_music_url TEXT",
    "ALTER TABLE tracks ADD COLUMN amazon_music_url TEXT",
    "ALTER TABLE tracks ADD COLUMN status TEXT NOT NULL DEFAULT 'published'",
]

_ARTIST_INDEXES = [
    "CREATE INDEX IF NOT EXISTS idx_artists_slug ON artists(slug)",
]


def _apply_migrations(conn):
    for stmt in _ARTIST_MIGRATIONS:
        try:
            conn.execute(stmt)
        except Exception:
            pass
    for stmt in _ARTIST_INDEXES:
        try:
            conn.execute(stmt)
        except Exception:
            pass


def init_db():
    schema_path = Path(__file__).with_name("schema.sql")
    sql = schema_path.read_text(encoding="utf-8")

    with get_db_connection() as conn:
        collaborator_columns = {
            row[1]
            for row in conn.execute("PRAGMA table_info(collaborators)").fetchall()
        }
        if collaborator_columns and "user_id" not in collaborator_columns:
            conn.execute("ALTER TABLE collaborators RENAME TO collaborators_legacy")
        conn.executescript(sql)
        _apply_migrations(conn)

    from backend.database.seed import seed_database
    seed_database()
