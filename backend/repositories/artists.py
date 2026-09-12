"""
Repositorio de artistas de Moneystack.
Maneja todas las consultas SQL relacionadas con artistas y su discografia.
"""

from backend.services.serialization import rowdict


def list_artists(conn):
    return [rowdict(r) for r in conn.execute(
        "SELECT * FROM artists WHERE active=1 ORDER BY featured DESC, name"
    ).fetchall()]


def get_artist_by_id(conn, artist_id):
    row = conn.execute("SELECT * FROM artists WHERE id=? AND active=1", (artist_id,)).fetchone()
    return rowdict(row) if row else None


def get_artist_by_slug(conn, slug):
    row = conn.execute(
        "SELECT * FROM artists WHERE LOWER(slug)=LOWER(?) AND active=1",
        (slug,),
    ).fetchone()
    return rowdict(row) if row else None


def get_artist_by_stage_name(conn, stage_name):
    row = conn.execute(
        "SELECT * FROM artists WHERE LOWER(REPLACE(stage_name, ' ', '-'))=LOWER(?) AND active=1",
        (stage_name,),
    ).fetchone()
    if row:
        return rowdict(row)
    return get_artist_by_slug(conn, stage_name)


def get_tracks_by_artist(conn, artist_id):
    rows = conn.execute(
        """SELECT * FROM tracks WHERE artist_id=?
           ORDER BY featured DESC, release_date DESC""",
        (artist_id,),
    ).fetchall()
    return [rowdict(r) for r in rows]


def get_featured_track(conn, artist_id):
    row = conn.execute(
        "SELECT * FROM tracks WHERE artist_id=? AND featured=1 LIMIT 1",
        (artist_id,),
    ).fetchone()
    return rowdict(row) if row else None


def get_track_by_id(conn, track_id):
    row = conn.execute("SELECT * FROM tracks WHERE id=?", (track_id,)).fetchone()
    return rowdict(row) if row else None
