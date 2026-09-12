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
-- Artistas de Moneystack
CREATE TABLE IF NOT EXISTS artists(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    stage_name TEXT NOT NULL,
    slug TEXT,
    real_name TEXT,
    bio TEXT,
    image TEXT,
    hero_image TEXT,
    genre TEXT,
    city TEXT DEFAULT 'Caucasia',
    region TEXT DEFAULT 'Bajo Cauca, Antioquia',
    spotify_url TEXT,
    youtube_url TEXT,
    instagram_url TEXT,
    tiktok_url TEXT,
    featured INTEGER NOT NULL DEFAULT 0,
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT
);

-- Discografía / tracks
CREATE TABLE IF NOT EXISTS tracks(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    artist_id INTEGER NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT,
    album TEXT,
    genre TEXT,
    duration TEXT,
    cover_image TEXT,
    description TEXT,
    spotify_url TEXT,
    youtube_url TEXT,
    apple_music_url TEXT,
    amazon_music_url TEXT,
    release_date TEXT,
    status TEXT NOT NULL DEFAULT 'published',
    featured INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
);

-- Timeline del artista (storytelling)
CREATE TABLE IF NOT EXISTS artist_timeline(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    artist_id INTEGER NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    descripcion TEXT,
    fecha TEXT,
    imagen_url TEXT,
    video_url TEXT,
    orden INTEGER NOT NULL DEFAULT 0
);

-- Galería multimedia del artista
CREATE TABLE IF NOT EXISTS artist_media(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    artist_id INTEGER NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL DEFAULT 'image',
    url TEXT NOT NULL,
    titulo TEXT,
    descripcion TEXT,
    fecha TEXT,
    orden INTEGER NOT NULL DEFAULT 0,
    destacado INTEGER NOT NULL DEFAULT 0
);

-- Redes sociales extendidas del artista
CREATE TABLE IF NOT EXISTS artist_social_links(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    artist_id INTEGER NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
    platform TEXT NOT NULL,
    url TEXT NOT NULL,
    username TEXT,
    icon TEXT,
    orden INTEGER NOT NULL DEFAULT 0
);

-- Conexiones territoriales del artista
CREATE TABLE IF NOT EXISTS artist_connections(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    artist_id INTEGER NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
    entity_type TEXT NOT NULL,
    entity_id INTEGER,
    titulo TEXT NOT NULL,
    descripcion TEXT,
    imagen_url TEXT,
    url TEXT,
    orden INTEGER NOT NULL DEFAULT 0
);

-- Métricas del dashboard (privado, solo artista/admin)
CREATE TABLE IF NOT EXISTS artist_metrics(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    artist_id INTEGER NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL,
    valor REAL NOT NULL DEFAULT 0,
    fecha TEXT NOT NULL,
    metadata TEXT
);

-- Índices
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
CREATE INDEX IF NOT EXISTS idx_artists_stage_name ON artists(stage_name);
CREATE INDEX IF NOT EXISTS idx_tracks_artist ON tracks(artist_id, featured);
CREATE INDEX IF NOT EXISTS idx_artist_timeline_artist ON artist_timeline(artist_id, orden);
CREATE INDEX IF NOT EXISTS idx_artist_media_artist ON artist_media(artist_id, tipo, orden);
CREATE INDEX IF NOT EXISTS idx_artist_social_artist ON artist_social_links(artist_id, orden);
CREATE INDEX IF NOT EXISTS idx_artist_connections_artist ON artist_connections(artist_id, entity_type);
CREATE INDEX IF NOT EXISTS idx_artist_metrics_artist ON artist_metrics(artist_id, tipo, fecha);
