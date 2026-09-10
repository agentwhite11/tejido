import { useState, useEffect } from 'react';
import { fetchArtistProfile } from '../services/artistApi.js';
import ArtistHeader from '../components/artist/ArtistHeader.jsx';
import ArtistMedia from '../components/artist/ArtistMedia.jsx';
import ArtistInfo from '../components/artist/ArtistInfo.jsx';

function getSlug() {
  const hash = window.location.hash.replace('#', '');
  const parts = hash.split('/');
  return parts[1] || 'og-mauro';
}

export default function ArtistScreen() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const slug = getSlug();
    setLoading(true);
    setError('');
    fetchArtistProfile(slug)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    document.body.classList.add('ax-artist-page');
    return () => document.body.classList.remove('ax-artist-page');
  }, []);

  if (loading) {
    return (
      <div className="ax-loading">
        <div className="ax-loading-spinner" />
        <p>Cargando artista...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="ax-error">
        <h2>Artista no encontrado</h2>
        <p>{error || 'No se pudo cargar el perfil'}</p>
        <a href="#moneystack" className="ax-btn ax-btn--primary">Volver a Moneystack</a>
      </div>
    );
  }

  const { artist, tracks, featured_track, timeline, media, social_links, connections, upcoming_events } = data;

  return (
    <div className="ax-artist">
      <ArtistHeader
        artist={artist}
        featuredTrack={featured_track}
        socialLinks={social_links}
      />

      <ArtistMedia tracks={tracks} media={media} />

      <ArtistInfo
        timeline={timeline}
        connections={connections}
        events={upcoming_events}
      />

      <footer className="ax-footer">
        <div className="ax-footer-inner">
          <a href="#moneystack" className="ax-footer-back">← Moneystack</a>
          <a href="#inicio" className="ax-footer-home">TEJIDO</a>
        </div>
      </footer>
    </div>
  );
}
