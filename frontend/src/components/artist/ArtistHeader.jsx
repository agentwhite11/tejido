import { useState, useEffect, useRef } from 'react';

const navSections = [
  { id: 'profile', label: 'Perfil' },
  { id: 'discography', label: 'Musica' },
  { id: 'timeline', label: 'Historia' },
  { id: 'gallery', label: 'Galeria' },
  { id: 'videos', label: 'Videos' },
  { id: 'territory', label: 'Territorio' },
  { id: 'events', label: 'Eventos' },
];

const platformIcons = {
  spotify: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
    </svg>
  ),
  youtube: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  ),
  instagram: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
    </svg>
  ),
  tiktok: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
    </svg>
  ),
};

function ArtistHero({ artist, featuredTrack }) {
  const [loaded, setLoaded] = useState(false);
  const heroRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    function onScroll() {
      const scrollY = window.scrollY;
      const opacity = Math.max(0, 1 - scrollY / 600);
      const translateY = scrollY * 0.3;
      hero.style.opacity = opacity;
      hero.style.transform = `translateY(${translateY}px)`;
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const heroStyle = artist.hero_image || artist.image
    ? { backgroundImage: `url(${artist.hero_image || artist.image})` }
    : {};

  return (
    <section className={`ax-hero ${loaded ? 'ax-hero--loaded' : ''}`} ref={heroRef}>
      <div className="ax-hero-bg" style={heroStyle}>
        {!heroStyle.backgroundImage && (
          <div className="ax-hero-placeholder">
            <span>{artist.stage_name?.charAt(0)}</span>
          </div>
        )}
        <div className="ax-hero-overlay" />
        <div className="ax-hero-grain" aria-hidden="true" />
      </div>

      <div className="ax-hero-content">
        <a href="#moneystack" className="ax-hero-back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          <span>Moneystack</span>
        </a>

        <div className="ax-hero-info">
          <div className="ax-hero-tags">
            {artist.genre && <span className="ax-hero-tag">{artist.genre}</span>}
            {artist.city && <span className="ax-hero-tag">{artist.city}</span>}
            {artist.region && <span className="ax-hero-tag">{artist.region}</span>}
          </div>

          <h1 className="ax-hero-name">{artist.stage_name}</h1>
          {artist.real_name && artist.real_name !== artist.stage_name && (
            <p className="ax-hero-realname">{artist.real_name}</p>
          )}

          <div className="ax-hero-actions">
            {featuredTrack?.spotify_url ? (
              <a href={featuredTrack.spotify_url} target="_blank" rel="noopener noreferrer" className="ax-btn ax-btn--primary">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                Escuchar ahora
              </a>
            ) : (
              <button className="ax-btn ax-btn--primary" onClick={() => {
                document.querySelector('.ax-discography')?.scrollIntoView({ behavior: 'smooth' });
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                Escuchar ahora
              </button>
            )}
            <button className="ax-btn ax-btn--ghost" onClick={() => {
              document.querySelector('.ax-profile')?.scrollIntoView({ behavior: 'smooth' });
            }}>
              Conocer la historia
            </button>
          </div>
        </div>
      </div>

      <div className="ax-hero-scroll" aria-hidden="true">
        <div className="ax-hero-scroll-line" />
      </div>
    </section>
  );
}

function ArtistNav() {
  const [active, setActive] = useState('');

  useEffect(() => {
    function onScroll() {
      const scrollY = window.scrollY + 120;
      for (let i = navSections.length - 1; i >= 0; i--) {
        const el = document.getElementById(`ax-${navSections[i].id}`);
        if (el && el.offsetTop <= scrollY) {
          setActive(navSections[i].id);
          return;
        }
      }
      setActive('');
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function scrollTo(id) {
    const el = document.getElementById(`ax-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  return (
    <nav className="ax-nav">
      <div className="ax-nav-inner">
        {navSections.map((s) => (
          <button
            key={s.id}
            className={`ax-nav-btn ${active === s.id ? 'ax-nav-btn--active' : ''}`}
            onClick={() => scrollTo(s.id)}
          >
            {s.label}
          </button>
        ))}
      </div>
    </nav>
  );
}

function ArtistProfile({ artist, socialLinks }) {
  return (
    <section className="ax-profile">
      <div className="ax-profile-inner">
        <div className="ax-profile-image">
          {artist.image ? (
            <img src={artist.image} alt={artist.stage_name} loading="lazy" />
          ) : (
            <div className="ax-profile-image-placeholder">
              <span>{artist.stage_name?.charAt(0)}</span>
            </div>
          )}
        </div>

        <div className="ax-profile-info">
          <h2 className="ax-section-label">Sobre el artista</h2>
          <p className="ax-profile-bio">{artist.bio}</p>

          {socialLinks && socialLinks.length > 0 && (
            <div className="ax-profile-social">
              {socialLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ax-social-link"
                  title={link.platform}
                >
                  {platformIcons[link.platform] || <span>{link.platform.charAt(0).toUpperCase()}</span>}
                  <span className="ax-social-link-label">{link.username || link.platform}</span>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default function ArtistHeader({ artist, featuredTrack, socialLinks }) {
  return (
    <>
      <ArtistHero artist={artist} featuredTrack={featuredTrack} />
      <ArtistNav />
      <div id="ax-profile">
        <ArtistProfile artist={artist} socialLinks={socialLinks} />
      </div>
    </>
  );
}
