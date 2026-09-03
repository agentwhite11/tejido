def fix_text(value):
    if not isinstance(value, str):
        return value
    for _ in range(2):
        if not any(mark in value for mark in ("Ã", "Â", "â")):
            break
        try:
            repaired = value.encode("latin1").decode("utf8")
            if repaired == value:
                break
            value = repaired
        except (UnicodeEncodeError, UnicodeDecodeError):
            break
    return value


def rowdict(record):
    return {key: fix_text(value) for key, value in dict(record).items()} if record else None
