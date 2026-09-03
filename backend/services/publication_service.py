import sqlite3

from backend.services.validation import publication_input, validate_category


def sync_publication_detail(conn, publication_id, item):
    conn.execute("DELETE FROM events WHERE publication_id=?", (publication_id,))
    conn.execute("DELETE FROM opportunities WHERE publication_id=?", (publication_id,))
    if item["kind"] == "EVENTO":
        conn.execute(
            "INSERT INTO events(publication_id, venue, capacity) VALUES(?,?,?)",
            (publication_id, item["location"], None),
        )
    elif item["kind"] == "OPORTUNIDAD":
        conn.execute(
            "INSERT INTO opportunities(publication_id, organization_name, deadline) VALUES(?,?,?)",
            (publication_id, None, item["end_date"]),
        )


def create_publication(conn, user, data, now):
    item = publication_input(data)
    validate_category(conn, item["category_id"], item["kind"])
    image = item["image"] or "linear-gradient(135deg,#2F6B59,#F6C453)"
    status = "PUBLISHED" if user["role"] == "ADMIN" and data.get("publish") else "DRAFT"
    fields = (
        user["id"], item["category_id"], item["kind"], item["title"], item["summary"], item["content"],
        image, item["location"], item["start_date"], item["end_date"], item["link"],
        int(bool(data.get("featured", False))) if user["role"] == "ADMIN" else 0,
        status, now(), now(),
    )
    try:
        cur = conn.execute(
            "INSERT INTO publications(author_id,category_id,kind,title,summary,content,image,location,start_date,end_date,link,featured,status,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
            fields,
        )
        sync_publication_detail(conn, cur.lastrowid, item)
    except sqlite3.IntegrityError:
        raise ValueError("No fue posible guardar el contenido con esos datos")
    return cur.lastrowid


def update_publication(conn, publication_id, item, now):
    conn.execute(
        "UPDATE publications SET category_id=?,kind=?,title=?,summary=?,content=?,image=?,location=?,start_date=?,end_date=?,link=?,status='DRAFT',moderation_note=NULL,updated_at=? WHERE id=?",
        (item["category_id"], item["kind"], item["title"], item["summary"], item["content"], item["image"], item["location"], item["start_date"], item["end_date"], item["link"], now(), publication_id),
    )
    sync_publication_detail(conn, publication_id, item)
