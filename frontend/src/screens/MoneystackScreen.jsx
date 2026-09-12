/**
 * MoneystackScreen.jsx — Home del sello Moneystack dentro de TEJIDO.
 *
 * Muestra: artista destacado, último lanzamiento, eventos próximos,
 * y una breve descripción del sello.
 *
 * Ruta: #moneystack
 */

import { useState, useEffect } from 'react';

export default function MoneystackScreen() {
  // Estado para artistas y loading
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar artistas al montar el componente
  useEffect(() => {
    fetch('/api/artists')
      .then((res) => {
        if (!res.ok) return [];
        return res.json();
      })
      .then((data) => {
        const list = Array.isArray(data) ? data : Array.isArray(data?.artists) ? data.artists : [];
        setArtists(list);
      })
      .catch((err) => {
        console.error('Error loading artists:', err);
        setArtists([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // Estado de carga
  if (loading) {
    return (
      <section className="moneystack-section">
        <div className="moneystack-loading">Cargando Moneystack...</div>
      </section>
    );
  }

  return (
    <section className="moneystack-section">
      {/* Hero del sello */}
      <div className="moneystack-hero">
        <div className="moneystack-hero-content">
          <span className="section-badge section-badge-light">Sello Independiente</span>
          <h1 className="moneystack-title">Moneystack</h1>
          <p className="moneystack-subtitle">
            El sello que mueve la cultura del Bajo Cauca.
            Música, eventos y comunidad desde Caucasia, Antioquia.
          </p>
          <div className="moneystack-tags">
            <span className="moneystack-tag">Música Urbana</span>
            <span className="moneystack-tag">Bajo Cauca</span>
            <span className="moneystack-tag">Independiente</span>
          </div>
        </div>

        <div className="moneystack-logo-placeholder" aria-label="Logo de MoneyStack">
          <img
            className="moneystack-logo-image"
            src="/images/moneystack/logo.png"
            alt="Logo de MoneyStack"
            onError={(event) => {
              event.currentTarget.style.display = 'none';
              event.currentTarget.parentElement?.classList.add('moneystack-logo-fallback-visible');
            }}
          />
          <span className="moneystack-logo-fallback">MS</span>
        </div>
      </div>

      {/* Artistas del sello */}
      <div className="moneystack-artists">
        <h2 className="moneystack-section-title">Nuestros Artistas</h2>
        {artists.length === 0 ? (
          <p className="moneystack-empty">Pronto habrá artistas aquí</p>
        ) : (
          <div className="moneystack-artist-grid">
            {artists.map(artist => (
              <a key={artist.id} href={`/artistas/${artist.slug || 'og-mauro'}`} className="moneystack-artist-card">
                {/* Imagen del artista — usa la imagen real si existe, si no placeholder */}
                <div
                  className="moneystack-artist-image"
                  style={{
                    backgroundImage: artist.image ? `url(${artist.image})` : undefined,
                  }}
                >
                  {!artist.image && <span>{artist.stage_name.charAt(0)}</span>}
                </div>
                <div className="moneystack-artist-info">
                  <h3>{artist.stage_name}</h3>
                  <p>{artist.name}</p>
                  <span className="moneystack-artist-cta">Ver perfil →</span>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Sobre el sello */}
      <div className="moneystack-about">
        <h2 className="moneystack-section-title">Sobre el Sello</h2>
        <div className="moneystack-about-content">
          <p>
            Moneystack es un sello independiente nacido en Caucasia, Bajo Cauca.
            Nacemos de la necesidad de contar nuestras propias historias a través
            de la música, llevando la esencia del territorio a cada escenario.
          </p>
          <p>
            Creemos en el talento local, en la música que nace del río y la calle,
            y en la cultura como motor de cambio. Cada canción es un pedazo
            del Bajo Cauca que viaja más allá de sus fronteras.
          </p>
          <div className="moneystack-stats">
            <div className="moneystack-stat">
              <span className="moneystack-stat-number">{artists.length}</span>
              <span className="moneystack-stat-label">Artista{artists.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="moneystack-stat">
              <span className="moneystack-stat-number">5+</span>
              <span className="moneystack-stat-label">Eventos realizados</span>
            </div>
            <div className="moneystack-stat">
              <span className="moneystack-stat-number">Bajo Cauca</span>
              <span className="moneystack-stat-label">Territorio</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
