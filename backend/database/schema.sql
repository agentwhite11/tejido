PRAGMA foreign_keys=ON;

CREATE TABLE IF NOT EXISTS roles(
    id INTEGER PRIMARY KEY,
    name TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS users(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role_id INTEGER NOT NULL REFERENCES roles(id),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS categories(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL,
    color TEXT NOT NULL,
    active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS organizations(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id),
    name TEXT NOT NULL,
    description TEXT,
    contact TEXT,
    active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS publications(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    author_id INTEGER NOT NULL REFERENCES users(id),
    category_id INTEGER NOT NULL REFERENCES categories(id),
    kind TEXT NOT NULL,
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    content TEXT NOT NULL,
    image TEXT,
    location TEXT,
    start_date TEXT,
    end_date TEXT,
    link TEXT,
    featured INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'DRAFT',
    moderation_note TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS events(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    publication_id INTEGER UNIQUE NOT NULL REFERENCES publications(id) ON DELETE CASCADE,
    venue TEXT,
    capacity INTEGER
);

CREATE TABLE IF NOT EXISTS opportunities(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    publication_id INTEGER UNIQUE NOT NULL REFERENCES publications(id) ON DELETE CASCADE,
    organization_name TEXT,
    deadline TEXT
);

CREATE TABLE IF NOT EXISTS favorites(
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    publication_id INTEGER NOT NULL REFERENCES publications(id) ON DELETE CASCADE,
    created_at TEXT NOT NULL,
    PRIMARY KEY(user_id, publication_id)
);

CREATE TABLE IF NOT EXISTS reports(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id),
    publication_id INTEGER NOT NULL REFERENCES publications(id),
    reason TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'OPEN',
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS suggestions(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'NEW',
    created_at TEXT NOT NULL,
    reviewed_at TEXT
);

CREATE TABLE IF NOT EXISTS publication_images(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    publication_id INTEGER NOT NULL REFERENCES publications(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    alt_text TEXT NOT NULL DEFAULT '',
    caption TEXT,
    position INTEGER NOT NULL DEFAULT 0,
    UNIQUE(publication_id, position)
);

CREATE TABLE IF NOT EXISTS sessions(
    token TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TEXT NOT NULL
);

-- Colaboradores
CREATE TABLE IF NOT EXISTS collaborators(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    code TEXT UNIQUE NOT NULL,
    points INTEGER NOT NULL DEFAULT 0,
    level TEXT NOT NULL DEFAULT 'INICIADO',
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS collaborator_activities(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    collaborator_id INTEGER NOT NULL REFERENCES collaborators(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    points INTEGER NOT NULL,
    description TEXT NOT NULL,
    evidence_url TEXT,
    publication_id INTEGER REFERENCES publications(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'APPROVED',
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS rewards(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    points_cost INTEGER NOT NULL,
    category TEXT NOT NULL,
    image TEXT,
    stock INTEGER NOT NULL DEFAULT -1,
    active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS reward_redemptions(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    collaborator_id INTEGER NOT NULL REFERENCES collaborators(id),
    reward_id INTEGER NOT NULL REFERENCES rewards(id),
    points_cost INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING',
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS activity_types(
    type TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    default_points INTEGER NOT NULL,
    requires_evidence INTEGER NOT NULL DEFAULT 0,
    description TEXT
);

CREATE INDEX IF NOT EXISTS idx_publications_status ON publications(status, deleted);
CREATE INDEX IF NOT EXISTS idx_publications_kind ON publications(kind);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_publication_images_publication ON publication_images(publication_id, position);
CREATE INDEX IF NOT EXISTS idx_suggestions_status ON suggestions(status);
CREATE INDEX IF NOT EXISTS idx_collaborators_user ON collaborators(user_id);
CREATE INDEX IF NOT EXISTS idx_collaborators_code ON collaborators(code);
CREATE INDEX IF NOT EXISTS idx_collaborator_activities_collab ON collaborator_activities(collaborator_id, created_at);
CREATE INDEX IF NOT EXISTS idx_collaborator_activities_status ON collaborator_activities(status);
CREATE INDEX IF NOT EXISTS idx_reward_redemptions_collab ON reward_redemptions(collaborator_id);
