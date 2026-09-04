from backend.database.connection import get_db_connection
from backend.services.serialization import rowdict


def create_collaborator(conn, user_id, code, created_at):
    cur = conn.execute(
        "INSERT INTO collaborators(user_id, code, created_at) VALUES(?,?,?)",
        (user_id, code, created_at),
    )
    return cur.lastrowid


def get_collaborator_by_user(conn, user_id):
    row = conn.execute(
        "SELECT * FROM collaborators WHERE user_id=? AND active=1",
        (user_id,),
    ).fetchone()
    return rowdict(row) if row else None


def get_collaborator_by_code(conn, code):
    row = conn.execute(
        "SELECT * FROM collaborators WHERE code=? AND active=1",
        (code,),
    ).fetchone()
    return rowdict(row) if row else None


def add_points(conn, collaborator_id, points):
    conn.execute(
        "UPDATE collaborators SET points=points+? WHERE id=?",
        (points, collaborator_id),
    )


def update_level(conn, collaborator_id, level):
    conn.execute(
        "UPDATE collaborators SET level=? WHERE id=?",
        (level, collaborator_id),
    )


def create_activity(conn, collaborator_id, activity_type, points, description, evidence_url, publication_id, status, created_at):
    cur = conn.execute(
        "INSERT INTO collaborator_activities(collaborator_id, type, points, description, evidence_url, publication_id, status, created_at) VALUES(?,?,?,?,?,?,?,?)",
        (collaborator_id, activity_type, points, description, evidence_url, publication_id, status, created_at),
    )
    return cur.lastrowid


def get_activities_by_collaborator(conn, collaborator_id, limit=20):
    rows = conn.execute(
        "SELECT * FROM collaborator_activities WHERE collaborator_id=? ORDER BY created_at DESC LIMIT ?",
        (collaborator_id, limit),
    ).fetchall()
    return [rowdict(r) for r in rows]


def has_shared_publication(conn, collaborator_id, publication_id):
    row = conn.execute(
        "SELECT id FROM collaborator_activities WHERE collaborator_id=? AND type='INTERNAL_SHARE' AND publication_id=?",
        (collaborator_id, publication_id),
    ).fetchone()
    return row is not None


def get_activity_type(conn, activity_type):
    row = conn.execute(
        "SELECT * FROM activity_types WHERE type=?",
        (activity_type,),
    ).fetchone()
    return rowdict(row) if row else None


def get_activity_types(conn):
    rows = conn.execute("SELECT * FROM activity_types ORDER BY name").fetchall()
    return [rowdict(r) for r in rows]


def get_rewards(conn):
    rows = conn.execute(
        "SELECT * FROM rewards WHERE active=1 AND (stock=-1 OR stock>0) ORDER BY points_cost"
    ).fetchall()
    return [rowdict(r) for r in rows]


def get_reward_by_id(conn, reward_id):
    row = conn.execute(
        "SELECT * FROM rewards WHERE id=? AND active=1",
        (reward_id,),
    ).fetchone()
    return rowdict(row) if row else None


def redeem_reward(conn, collaborator_id, reward_id, points_cost, created_at):
    cur = conn.execute(
        "INSERT INTO reward_redemptions(collaborator_id, reward_id, points_cost, created_at) VALUES(?,?,?,?)",
        (collaborator_id, reward_id, points_cost, created_at),
    )
    conn.execute(
        "UPDATE rewards SET stock=stock-1 WHERE id=? AND stock>0",
        (reward_id,),
    )
    return cur.lastrowid


def get_redemptions_by_collaborator(conn, collaborator_id):
    rows = conn.execute(
        """SELECT rr.*, r.name as reward_name, r.category as reward_category
           FROM reward_redemptions rr
           JOIN rewards r ON r.id=rr.reward_id
           WHERE rr.collaborator_id=?
           ORDER BY rr.created_at DESC""",
        (collaborator_id,),
    ).fetchall()
    return [rowdict(r) for r in rows]


def get_ranking(conn, limit=10):
    rows = conn.execute(
        """SELECT c.id, c.points, c.level, u.name
           FROM collaborators c
           JOIN users u ON u.id=c.user_id
           WHERE c.active=1
           ORDER BY c.points DESC
           LIMIT ?""",
        (limit,),
    ).fetchall()
    return [rowdict(r) for r in rows]


def get_user_count(conn):
    return conn.execute("SELECT COUNT(*) FROM collaborators WHERE active=1").fetchone()[0]


def get_total_points(conn):
    row = conn.execute("SELECT COALESCE(SUM(points),0) FROM collaborators WHERE active=1").fetchone()
    return row[0]


def get_total_shares(conn):
    row = conn.execute(
        "SELECT COUNT(*) FROM collaborator_activities WHERE type IN ('INTERNAL_SHARE','EXTERNAL_SHARE')"
    ).fetchone()
    return row[0]
