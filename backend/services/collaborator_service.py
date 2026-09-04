import secrets
import json
from datetime import datetime, timezone

from backend.repositories.collaborators import (
    create_collaborator,
    get_collaborator_by_user,
    get_collaborator_by_code,
    add_points,
    update_level,
    create_activity,
    get_activities_by_collaborator,
    has_shared_publication,
    get_activity_type,
    get_rewards,
    get_reward_by_id,
    redeem_reward,
    get_redemptions_by_collaborator,
    get_ranking,
    get_user_count,
    get_total_points,
    get_total_shares,
)


LEVELS = {
    'INICIADO': 0,
    'ACTIVO': 500,
    'EMBAJADOR': 2000,
    'LIDER': 5000,
}


def calculate_level(points):
    if points >= 5000:
        return 'LIDER'
    if points >= 2000:
        return 'EMBAJADOR'
    if points >= 500:
        return 'ACTIVO'
    return 'INICIADO'


def next_level(current_level):
    order = ['INICIADO', 'ACTIVO', 'EMBAJADOR', 'LIDER']
    idx = order.index(current_level) if current_level in order else 0
    if idx < len(order) - 1:
        return order[idx + 1]
    return None


def points_for_next_level(current_level):
    nxt = next_level(current_level)
    if nxt:
        return LEVELS[nxt]
    return LEVELS['LIDER']


def generate_code(name):
    prefix = name.split()[0].upper()[:6] if name else 'USER'
    suffix = secrets.token_urlsafe(4).upper()
    return f"{prefix}-{suffix}"


def register_collaborator(conn, user_id, user_name):
    existing = get_collaborator_by_user(conn, user_id)
    if existing:
        raise ValueError("Ya eres colaborador de TEJIDO")

    code = generate_code(user_name)
    now = datetime.now(timezone.utc).isoformat()
    collab_id = create_collaborator(conn, user_id, code, now)
    return {
        'id': collab_id,
        'code': code,
        'points': 0,
        'level': 'INICIADO',
    }


def get_profile(conn, user_id):
    collab = get_collaborator_by_user(conn, user_id)
    if not collab:
        return None

    activities = get_activities_by_collaborator(conn, collab['id'])
    redemptions = get_redemptions_by_collaborator(conn, collab['id'])
    ranking = get_ranking(conn, 10)

    user_position = None
    for i, r in enumerate(ranking):
        if r['id'] == collab['id']:
            user_position = i + 1
            break

    return {
        'collaborator': collab,
        'activities': activities,
        'redemptions': redemptions,
        'ranking': ranking,
        'user_position': user_position,
        'next_level': next_level(collab['level']),
        'points_for_next': points_for_next_level(collab['level']),
    }


def share_publication(conn, collaborator_id, publication_id):
    if has_shared_publication(conn, collaborator_id, publication_id):
        return None

    collab = get_collaborator_by_user(conn, collaborator_id)
    if not collab:
        return None

    now = datetime.now(timezone.utc).isoformat()
    create_activity(
        conn, collab['id'], 'INTERNAL_SHARE', 10,
        'Compartió una publicación', None, publication_id, 'APPROVED', now
    )
    add_points(conn, collab['id'], 10)

    new_total = collab['points'] + 10
    new_level = calculate_level(new_total)
    if new_level != collab['level']:
        update_level(conn, collab['id'], new_level)

    return {'points_earned': 10, 'new_total': new_total, 'new_level': new_level}


def report_activity(conn, user_id, activity_type, description, evidence_url=None):
    collab = get_collaborator_by_user(conn, user_id)
    if not collab:
        raise ValueError("No eres colaborador")

    act_type = get_activity_type(conn, activity_type)
    if not act_type:
        raise ValueError("Tipo de actividad no válido")

    points = act_type['default_points']
    status = 'APPROVED'

    now = datetime.now(timezone.utc).isoformat()
    create_activity(
        conn, collab['id'], activity_type, points,
        description, evidence_url, None, status, now
    )
    add_points(conn, collab['id'], points)

    new_total = collab['points'] + points
    new_level = calculate_level(new_total)
    if new_level != collab['level']:
        update_level(conn, collab['id'], new_level)

    return {'points_earned': points, 'new_total': new_total, 'new_level': new_level}


def get_rewards_catalog(conn):
    return get_rewards(conn)


def redeem_reward_by_user(conn, user_id, reward_id):
    collab = get_collaborator_by_user(conn, user_id)
    if not collab:
        raise ValueError("No eres colaborador")

    reward = get_reward_by_id(conn, reward_id)
    if not reward:
        raise ValueError("Recompensa no encontrada")

    if collab['points'] < reward['points_cost']:
        raise ValueError("No tienes suficientes puntos")

    now = datetime.now(timezone.utc).isoformat()
    redeem_reward(conn, collab['id'], reward_id, reward['points_cost'], now)

    add_points(conn, collab['id'], -reward['points_cost'])
    new_total = collab['points'] - reward['points_cost']
    new_level = calculate_level(new_total)
    update_level(conn, collab['id'], new_level)

    return {'redeemed': True, 'new_total': new_total, 'new_level': new_level}


def get_ranking_top(conn):
    return get_ranking(conn, 10)


def get_stats(conn):
    return {
        'total_collaborators': get_user_count(conn),
        'total_points': get_total_points(conn),
        'total_shares': get_total_shares(conn),
    }
