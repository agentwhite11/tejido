def list_publications(conn, user, query):
    where = ["p.deleted=0"]
    args = []
    wants_mine = query.get("mine") == ["1"] and user
    wants_admin_status = query.get("status") and user and user["role"] == "ADMIN"

    if wants_mine:
        where.append("p.author_id=?")
        args.append(user["id"])
    elif wants_admin_status:
        where.append("p.status=?")
        args.append(query["status"][0])
    else:
        where.append("p.status='PUBLISHED'")

    if query.get("kind") and query["kind"][0] != "TODOS":
        where.append("p.kind=?")
        args.append(query["kind"][0])

    if query.get("search"):
        where.append("(p.title LIKE ? OR p.summary LIKE ? OR p.location LIKE ?)")
        term = "%" + query["search"][0] + "%"
        args.extend([term, term, term])

    sql = (
        "SELECT p.*, c.name category, c.color, u.name author, "
        "EXISTS(SELECT 1 FROM favorites f WHERE f.publication_id=p.id AND f.user_id=?) favorite "
        "FROM publications p JOIN categories c ON c.id=p.category_id JOIN users u ON u.id=p.author_id "
        "WHERE " + " AND ".join(where) + " ORDER BY p.featured DESC, COALESCE(p.start_date,p.created_at) DESC"
    )
    return conn.execute(sql, ([user["id"] if user else -1] + args)).fetchall()


def get_publication(conn, user, publication_id):
    return conn.execute(
        "SELECT p.*, c.name category, c.color, u.name author, "
        "EXISTS(SELECT 1 FROM favorites f WHERE f.publication_id=p.id AND f.user_id=?) favorite "
        "FROM publications p JOIN categories c ON c.id=p.category_id JOIN users u ON u.id=p.author_id "
        "WHERE p.id=? AND p.deleted=0",
        (user["id"] if user else -1, int(publication_id)),
    ).fetchone()


def get_publication_owner_state(conn, publication_id):
    return conn.execute("SELECT id, status, author_id FROM publications WHERE id=? AND deleted=0", (int(publication_id),)).fetchone()


def list_publication_images(conn, publication_id):
    return conn.execute(
        "SELECT id, url, alt_text, caption, position FROM publication_images WHERE publication_id=? ORDER BY position ASC",
        (int(publication_id),),
    ).fetchall()
