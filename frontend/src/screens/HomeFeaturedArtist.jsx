import { useState, useEffect } from 'react';

export default function HomeFeaturedArtist() {
  const [artistData, setArtistData] = useState(null);

  useEffect(() => {
    fetch('/api/artists/home')
      .then(res => res.json())
      .then(data => {
        if (data.artist) setArtistData(data);
      })
      .catch(() => {});
  }, []);

  if (!artistData || !artistData.artist) return null;

  const { artist, featured_track } = artistData;

  return (
    <section className="artist-section">
      <div className="artist-content">
        <span className="section-badge section-badge-light">Artista Destacado</span>
        <h2 className="artist-title">{artist.stage_name}</h2>
        <p className="artist-description">{artist.bio}</p>
        <div className="artist-meta">
          <span className="artist-tag">Moneystack</span>
          <span className="artist-tag">Bajo Cauca</span>
          <span className="artist-tag">Música Urbana</span>
        </div>

        {featured_track && (
          <div className="artist-audio">
            <div className="audio-player">
              {featured_track.spotify_url ? (
                <a href={featured_track.spotify_url} target="_blank" rel="noopener noreferrer" className="audio-play-btn" aria-label="Escuchar en Spotify">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3"/>
                  </svg>
                </a>
              ) : featured_track.youtube_url ? (
                <a href={featured_track.youtube_url} target="_blank" rel="noopener noreferrer" className="audio-play-btn" aria-label="Ver en YouTube">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3"/>
                  </svg>
                </a>
              ) : (
                <button className="audio-play-btn" type="button" disabled>
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3"/>
                  </svg>
                </button>
              )}
              <div className="audio-info">
                <span className="audio-title">{featured_track.title}</span>
                <div className="audio-progress">
                  <div className="audio-progress-bar"></div>
                </div>
                <span className="audio-time">{featured_track.duration}</span>
              </div>
            </div>
          </div>
        )}

        <div className="artist-social">
          {artist.instagram_url && (
            <a href={artist.instagram_url} target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Instagram">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
            </a>
          )}
          {artist.youtube_url && (
            <a href={artist.youtube_url} target="_blank" rel="noopener noreferrer" className="social-link" aria-label="YouTube">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/>
                <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/>
              </svg>
            </a>
          )}
          {artist.spotify_url && (
            <a href={artist.spotify_url} target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Spotify">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M8 15s4-1 6-2"/>
                <path d="M7 12s5-1.5 7.5-2.5"/>
                <path d="M6.5 9S12 7 17 9"/>
              </svg>
            </a>
          )}
        </div>

        <div className="artist-concert">
          <span className="concert-label">Sello Independiente</span>
          <a href="#moneystack" className="concert-date">Moneystack</a>
          <span className="concert-place">Bajo Cauca Antioqueño</span>
        </div>
      </div>
      <div className="artist-visual">
        <div className="artist-image-container">
          {artist.image ? (
            <img src={artist.image} alt={artist.stage_name} className="artist-image-real" />
          ) : (
            <div className="artist-image-placeholder">
              <span className="artist-initials">{artist.stage_name.charAt(0)}</span>
            </div>
          )}
        </div>
        <div className="artist-logo">
          <span className="logo-text">Moneystack</span>
        </div>
      </div>
    </section>
  );
}
