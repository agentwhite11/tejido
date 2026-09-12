"""
Servicio de artistas de Moneystack.
Logica de negocio para perfiles, discografia, timeline, media y dashboard.
"""

from backend.repositories.artists import (
    list_artists,
    get_artist_by_id,
    get_artist_by_slug,
    get_tracks_by_artist,
    get_featured_track,
)
from backend.repositories.artist_data import (
    get_timeline_by_artist,
    get_media_by_artist,
    get_social_links_by_artist,
    get_connections_by_artist,
    get_metrics_by_artist,
)


def get_all_artists(conn):
    return list_artists(conn)


def get_artist_profile(conn, slug):
    artist = get_artist_by_slug(conn, slug)
    if not artist:
        artist = get_artist_by_stage_name_fallback(conn, slug)
    if not artist:
        return None

    tracks = get_tracks_by_artist(conn, artist["id"])
    featured = get_featured_track(conn, artist["id"])
    timeline = get_timeline_by_artist(conn, artist["id"])
    media = get_media_by_artist(conn, artist["id"])
    social = get_social_links_by_artist(conn, artist["id"])
    connections = get_connections_by_artist(conn, artist["id"])

    upcoming = conn.execute(
        """SELECT p.id, p.title, p.summary, p.image, p.location, p.start_date,
                  e.venue, e.capacity
           FROM publications p
           LEFT JOIN events e ON e.publication_id = p.id
           WHERE p.kind='EVENTO' AND p.status='PUBLISHED' AND p.deleted=0
             AND (p.title LIKE '%' || ? || '%' OR p.content LIKE '%' || ? || '%')
           ORDER BY p.start_date ASC
           LIMIT 5""",
        (artist["stage_name"], artist["stage_name"]),
    ).fetchall()

    return {
        "artist": artist,
        "tracks": tracks,
        "featured_track": featured,
        "timeline": timeline,
        "media": media,
        "social_links": social,
        "connections": connections,
        "upcoming_events": [dict(e) for e in upcoming],
    }


def get_artist_discography(conn, slug):
    artist = get_artist_by_slug(conn, slug)
    if not artist:
        artist = get_artist_by_stage_name_fallback(conn, slug)
    if not artist:
        return None
    tracks = get_tracks_by_artist(conn, artist["id"])
    return {"artist": {"id": artist["id"], "stage_name": artist["stage_name"]}, "tracks": tracks}


def get_artist_timeline(conn, slug):
    artist = get_artist_by_slug(conn, slug)
    if not artist:
        artist = get_artist_by_stage_name_fallback(conn, slug)
    if not artist:
        return None
    return {"artist": {"id": artist["id"], "stage_name": artist["stage_name"]},
            "timeline": get_timeline_by_artist(conn, artist["id"])}


def get_artist_media(conn, slug, tipo=None):
    artist = get_artist_by_slug(conn, slug)
    if not artist:
        artist = get_artist_by_stage_name_fallback(conn, slug)
    if not artist:
        return None
    return {"artist": {"id": artist["id"], "stage_name": artist["stage_name"]},
            "media": get_media_by_artist(conn, artist["id"], tipo)}


def get_artist_social(conn, slug):
    artist = get_artist_by_slug(conn, slug)
    if not artist:
        artist = get_artist_by_stage_name_fallback(conn, slug)
    if not artist:
        return None
    return {"artist": {"id": artist["id"], "stage_name": artist["stage_name"]},
            "social_links": get_social_links_by_artist(conn, artist["id"])}


def get_artist_connections_data(conn, slug, entity_type=None):
    artist = get_artist_by_slug(conn, slug)
    if not artist:
        artist = get_artist_by_stage_name_fallback(conn, slug)
    if not artist:
        return None
    return {"artist": {"id": artist["id"], "stage_name": artist["stage_name"]},
            "connections": get_connections_by_artist(conn, artist["id"], entity_type)}


def get_artist_dashboard(conn, artist_id):
    metrics = get_metrics_by_artist(conn, artist_id)
    latest = {}
    for m in metrics:
        if m["tipo"] not in latest:
            latest[m["tipo"]] = m
    return {"metrics": metrics, "latest": latest}


def get_home_artist_data(conn):
    artists = list_artists(conn)
    if not artists:
        return None
    artist = artists[0]
    featured = get_featured_track(conn, artist["id"])
    return {"artist": artist, "featured_track": featured}


def get_artist_by_stage_name_fallback(conn, stage_name):
    from backend.repositories.artists import get_artist_by_stage_name
    return get_artist_by_stage_name(conn, stage_name)
