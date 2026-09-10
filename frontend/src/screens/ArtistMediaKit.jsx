import { useState, useEffect } from 'react';
import { fetchMediaKit } from '../services/artistApi.js';

function getSlug() {
  const hash = window.location.hash.replace('#', '');
  const parts = hash.split('/');
  return parts[1] || 'og-mauro';
}

export default function ArtistMediaKit() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const slug = getSlug();
    fetchMediaKit(slug)
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="mk-loading">
        <p>Cargando media kit...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mk-loading">
        <p>Artista no encontrado</p>
        <a href="#moneystack">Volver</a>
      </div>
    );
  }

  const { artist, tracks, featured_track, social_links, upcoming_events } = data;

  return (
    <div className="mk-kit">
      <header className="mk-header">
        <div className="mk-header-inner">
          <span className="mk-brand">TEJIDO</span>
          <span className="mk-divider">/</span>
          <span className="mk-section">Media Kit</span>
        </div>
      </header>

      <main className="mk-main">
        <div className="mk-hero">
          {artist.image && (
            <div className="mk-hero-image">
              <img src={artist.image} alt={artist.stage_name} />
            </div>
          )}
          <div className="mk-hero-info">
            <span className="mk-label">Media Kit</span>
            <h1 className="mk-name">{artist.stage_name}</h1>
            {artist.real_name && <p className="mk-realname">{artist.real_name}</p>}
            <div className="mk-meta">
              {artist.genre && <span>{artist.genre}</span>}
              {artist.city && <span>{artist.city}</span>}
              {artist.region && <span>{artist.region}</span>}
            </div>
          </div>
        </div>

        <section className="mk-section-block">
          <h2 className="mk-section-title">Biografia</h2>
          <p className="mk-bio">{artist.bio}</p>
        </section>

        {tracks && tracks.length > 0 && (
          <section className="mk-section-block">
            <h2 className="mk-section-title">Discografia destacada</h2>
            <div className="mk-tracks">
              {tracks.slice(0, 3).map((track) => (
                <div key={track.id} className="mk-track">
                  <div className="mk-track-info">
                    <span className="mk-track-title">{track.title}</span>
                    <span className="mk-track-meta">
                      {track.album} · {track.release_date?.split('-')[0]}
                    </span>
                  </div>
                  <div className="mk-track-links">
                    {track.spotify_url && (
                      <a href={track.spotify_url} target="_blank" rel="noopener noreferrer" className="mk-link mk-link--spotify">
                        Spotify
                      </a>
                    )}
                    {track.youtube_url && (
                      <a href={track.youtube_url} target="_blank" rel="noopener noreferrer" className="mk-link mk-link--youtube">
                        YouTube
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {social_links && social_links.length > 0 && (
          <section className="mk-section-block">
            <h2 className="mk-section-title">Redes sociales</h2>
            <div className="mk-social">
              {social_links.map((link) => (
                <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="mk-social-link">
                  <span className="mk-social-platform">{link.platform}</span>
                  <span className="mk-social-user">{link.username || link.url}</span>
                </a>
              ))}
            </div>
          </section>
        )}

        {upcoming_events && upcoming_events.length > 0 && (
          <section className="mk-section-block">
            <h2 className="mk-section-title">Eventos destacados</h2>
            <div className="mk-events">
              {upcoming_events.map((event) => (
                <div key={event.id} className="mk-event">
                  <span className="mk-event-date">
                    {event.start_date && new Date(event.start_date).toLocaleDateString('es-CO', { month: 'short', day: 'numeric' })}
                  </span>
                  <div>
                    <span className="mk-event-title">{event.title}</span>
                    <span className="mk-event-venue">{event.venue || event.location}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="mk-section-block mk-contact">
          <h2 className="mk-section-title">Contacto</h2>
          <p className="mk-contact-text">
            Para presentaciones, colaboraciones y medios:
          </p>
          <a href="mailto:contacto@tejido.co" className="mk-contact-email">
            contacto@tejido.co
          </a>
        </section>
      </main>

      <footer className="mk-footer">
        <span>Generado desde TEJIDO — {new Date().getFullYear()}</span>
      </footer>
    </div>
  );
}
