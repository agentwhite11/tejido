from pathlib import Path

from backend.database.connection import get_db_connection


def init_db():
    schema_path = Path(__file__).with_name("schema.sql")
    sql = schema_path.read_text(encoding="utf-8")

    with get_db_connection() as conn:
        conn.executescript(sql)

    from backend.database.seed import seed_database
    seed_database()
