def publication_input(data):
    if not isinstance(data, dict):
        raise ValueError("El contenido enviado no es válido")

    kind = str(data.get("kind", "HISTORIA")).strip().upper()
    allowed = {"HISTORIA", "EVENTO", "OPORTUNIDAD", "TALENTO", "INICIATIVA"}

    if kind not in allowed:
        raise ValueError("Selecciona un tipo de publicación válido")

    try:
        category_id = int(data.get("category_id"))
    except (TypeError, ValueError):
        raise ValueError("Selecciona una categoría válida")

    title = str(data.get("title", "")).strip()
    summary = str(data.get("summary", "")).strip()
    content = str(data.get("content", "")).strip()
    location = str(data.get("location", "Caucasia")).strip() or "Caucasia"

    if not 5 <= len(title) <= 180:
        raise ValueError("El título debe tener entre 5 y 180 caracteres")
    if not 10 <= len(summary) <= 500:
        raise ValueError("El resumen debe tener entre 10 y 500 caracteres")
    if not 20 <= len(content) <= 20000:
        raise ValueError("El contenido debe tener entre 20 y 20000 caracteres")
    if len(location) > 180:
        raise ValueError("El lugar es demasiado largo")

    return {
        "category_id": category_id,
        "kind": kind,
        "title": title,
        "summary": summary,
        "content": content,
        "image": data.get("image"),
        "location": location,
        "start_date": data.get("start_date"),
        "end_date": data.get("end_date"),
        "link": data.get("link"),
    }


def validate_category(conn, category_id, kind):
    category = conn.execute(
        "SELECT type FROM categories WHERE id=? AND active=1",
        (category_id,),
    ).fetchone()

    if not category:
        raise ValueError("La categoría seleccionada no existe o está inactiva")
    if category["type"] != kind:
        raise ValueError("La categoría no corresponde al tipo de publicación")
