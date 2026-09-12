"""
Repositorio de datos extendidos del artista.
Timeline, media, social links, connections, metrics.
"""

from backend.services.serialization import rowdict


def get_timeline_by_artist(conn, artist_id):
    rows = conn.execute(
        "SELECT * FROM artist_timeline WHERE artist_id=? ORDER BY orden ASC, fecha ASC",
        (artist_id,),
    ).fetchall()
    return [rowdict(r) for r in rows]


def get_media_by_artist(conn, artist_id, tipo=None):
    if tipo:
        rows = conn.execute(
            "SELECT * FROM artist_media WHERE artist_id=? AND tipo=? ORDER BY orden ASC",
            (artist_id, tipo),
        ).fetchall()
    else:
        rows = conn.execute(
            "SELECT * FROM artist_media WHERE artist_id=? ORDER BY orden ASC",
            (artist_id,),
        ).fetchall()
    return [rowdict(r) for r in rows]


def get_social_links_by_artist(conn, artist_id):
    rows = conn.execute(
        "SELECT * FROM artist_social_links WHERE artist_id=? ORDER BY orden ASC",
        (artist_id,),
    ).fetchall()
    return [rowdict(r) for r in rows]


def get_connections_by_artist(conn, artist_id, entity_type=None):
    if entity_type:
        rows = conn.execute(
            "SELECT * FROM artist_connections WHERE artist_id=? AND entity_type=? ORDER BY orden ASC",
            (artist_id, entity_type),
        ).fetchall()
    else:
        rows = conn.execute(
            "SELECT * FROM artist_connections WHERE artist_id=? ORDER BY orden ASC",
            (artist_id,),
        ).fetchall()
    return [rowdict(r) for r in rows]


def get_metrics_by_artist(conn, artist_id):
    rows = conn.execute(
        "SELECT * FROM artist_metrics WHERE artist_id=? ORDER BY fecha DESC",
        (artist_id,),
    ).fetchall()
    return [rowdict(r) for r in rows]


def get_metric_latest(conn, artist_id, tipo):
    row = conn.execute(
        "SELECT * FROM artist_metrics WHERE artist_id=? AND tipo=? ORDER BY fecha DESC LIMIT 1",
        (artist_id, tipo),
    ).fetchone()
    return rowdict(row) if row else None


def create_timeline_entry(conn, artist_id, data):
    cur = conn.execute(
        """INSERT INTO artist_timeline(artist_id, titulo, descripcion, fecha, imagen_url, video_url, orden)
           VALUES(?,?,?,?,?,?,?)""",
        (artist_id, data["titulo"], data.get("descripcion"), data.get("fecha"),
         data.get("imagen_url"), data.get("video_url"), data.get("orden", 0)),
    )
    return cur.lastrowid


def update_timeline_entry(conn, artist_id, entry_id, data):
    fields = []
    values = []
    for key in ("titulo", "descripcion", "fecha", "imagen_url", "video_url", "orden"):
        if key in data:
            fields.append(f"{key}=?")
            values.append(data[key])
    if not fields:
        return 0
    values.extend([artist_id, entry_id])
    cur = conn.execute(
        f"UPDATE artist_timeline SET {','.join(fields)} WHERE artist_id=? AND id=?",
        values,
    )
    return cur.rowcount


def delete_timeline_entry(conn, artist_id, entry_id):
    cur = conn.execute(
        "DELETE FROM artist_timeline WHERE artist_id=? AND id=?",
        (artist_id, entry_id),
    )
    return cur.rowcount


def create_media_item(conn, artist_id, data):
    cur = conn.execute(
        """INSERT INTO artist_media(artist_id, tipo, url, titulo, descripcion, fecha, orden, destacado)
           VALUES(?,?,?,?,?,?,?,?)""",
        (artist_id, data.get("tipo", "image"), data["url"], data.get("titulo"),
         data.get("descripcion"), data.get("fecha"), data.get("orden", 0), data.get("destacado", 0)),
    )
    return cur.lastrowid


def update_media_item(conn, artist_id, media_id, data):
    fields = []
    values = []
    for key in ("tipo", "url", "titulo", "descripcion", "fecha", "orden", "destacado"):
        if key in data:
            fields.append(f"{key}=?")
            values.append(data[key])
    if not fields:
        return 0
    values.extend([artist_id, media_id])
    cur = conn.execute(
        f"UPDATE artist_media SET {','.join(fields)} WHERE artist_id=? AND id=?",
        values,
    )
    return cur.rowcount


def delete_media_item(conn, artist_id, media_id):
    cur = conn.execute(
        "DELETE FROM artist_media WHERE artist_id=? AND id=?",
        (artist_id, media_id),
    )
    return cur.rowcount


def create_social_link(conn, artist_id, data):
    cur = conn.execute(
        """INSERT INTO artist_social_links(artist_id, platform, url, username, icon, orden)
           VALUES(?,?,?,?,?,?)""",
        (artist_id, data["platform"], data["url"], data.get("username"),
         data.get("icon"), data.get("orden", 0)),
    )
    return cur.lastrowid


def delete_social_link(conn, artist_id, link_id):
    cur = conn.execute(
        "DELETE FROM artist_social_links WHERE artist_id=? AND id=?",
        (artist_id, link_id),
    )
    return cur.rowcount


def create_connection(conn, artist_id, data):
    cur = conn.execute(
        """INSERT INTO artist_connections(artist_id, entity_type, entity_id, titulo, descripcion, imagen_url, url, orden)
           VALUES(?,?,?,?,?,?,?,?)""",
        (artist_id, data["entity_type"], data.get("entity_id"), data["titulo"],
         data.get("descripcion"), data.get("imagen_url"), data.get("url"), data.get("orden", 0)),
    )
    return cur.lastrowid


def delete_connection(conn, artist_id, connection_id):
    cur = conn.execute(
        "DELETE FROM artist_connections WHERE artist_id=? AND id=?",
        (artist_id, connection_id),
    )
    return cur.rowcount


def create_metric(conn, artist_id, tipo, valor, fecha, metadata=None):
    cur = conn.execute(
        "INSERT INTO artist_metrics(artist_id, tipo, valor, fecha, metadata) VALUES(?,?,?,?,?)",
        (artist_id, tipo, valor, fecha, metadata),
    )
    return cur.lastrowid
