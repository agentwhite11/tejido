from pathlib import Path

from backend.database.connection import get_db_connection


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

    from backend.database.seed import seed_database
    seed_database()
