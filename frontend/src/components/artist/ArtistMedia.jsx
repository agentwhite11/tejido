import { useState } from 'react';

function ArtistDiscography({ tracks }) {
  const [selected, setSelected] = useState(null);

  if (!tracks || tracks.length === 0) {
    return (
      <section className="ax-discography">
        <h2 className="ax-section-title">Discografia</h2>
        <p className="ax-empty">Proximamente habra musica aqui</p>
      </section>
    );
  }

  return (
    <section className="ax-discography">
      <h2 className="ax-section-title">Discografia</h2>

      <div className="ax-releases">
        {tracks.map((track) => (
          <div
            key={track.id}
            className={`ax-release ${track.featured ? 'ax-release--featured' : ''} ${selected === track.id ? 'ax-release--open' : ''}`}
            onClick={() => setSelected(selected === track.id ? null : track.id)}
          >
            <div className="ax-release-cover">
              {track.cover_image ? (
                <img src={track.cover_image} alt={track.title} loading="lazy" />
              ) : (
                <div className="ax-release-cover-placeholder">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M9 18V5l12-2v13"/>
                    <circle cx="6" cy="18" r="3"/>
                    <circle cx="18" cy="16" r="3"/>
                  </svg>
                </div>
              )}
              {track.featured === 1 && <span className="ax-release-badge">Destacado</span>}
            </div>

            <div className="ax-release-info">
              <h3 className="ax-release-title">{track.title}</h3>
              <div className="ax-release-meta">
                <span>{track.album}</span>
                {track.duration && <span>{track.duration}</span>}
                {track.release_date && <span>{track.release_date.split('-')[0]}</span>}
              </div>
            </div>

            <div className="ax-release-links">
              {track.spotify_url && (
                <a href={track.spotify_url} target="_blank" rel="noopener noreferrer" className="ax-platform-link ax-platform-link--spotify" onClick={(e) => e.stopPropagation()}>
                  Spotify
                </a>
              )}
              {track.youtube_url && (
                <a href={track.youtube_url} target="_blank" rel="noopener noreferrer" className="ax-platform-link ax-platform-link--youtube" onClick={(e) => e.stopPropagation()}>
                  YouTube
                </a>
              )}
              {track.apple_music_url && (
                <a href={track.apple_music_url} target="_blank" rel="noopener noreferrer" className="ax-platform-link ax-platform-link--apple" onClick={(e) => e.stopPropagation()}>
                  Apple Music
                </a>
              )}
              {!track.spotify_url && !track.youtube_url && !track.apple_music_url && (
                <span className="ax-platform-link ax-platform-link--disabled">Proximamente</span>
              )}
            </div>

            {selected === track.id && track.description && (
              <div className="ax-release-detail">
                <p>{track.description}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function ArtistGallery({ media }) {
  const [lightbox, setLightbox] = useState(null);
  const [filter, setFilter] = useState('all');

  if (!media || media.length === 0) return null;

  const types = [...new Set(media.map((m) => m.tipo))];
  const filtered = filter === 'all' ? media : media.filter((m) => m.tipo === filter);

  return (
    <section className="ax-gallery">
      <h2 className="ax-section-title">Galeria</h2>

      <div className="ax-gallery-filters">
        <button
          className={`ax-gallery-filter ${filter === 'all' ? 'ax-gallery-filter--active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Todo
        </button>
        {types.map((t) => (
          <button
            key={t}
            className={`ax-gallery-filter ${filter === t ? 'ax-gallery-filter--active' : ''}`}
            onClick={() => setFilter(t)}
          >
            {t === 'image' ? 'Fotos' : t === 'video' ? 'Videos' : t === 'cover' ? 'Portadas' : 'Momentos'}
          </button>
        ))}
      </div>

      <div className="ax-gallery-grid">
        {filtered.map((item) => (
          <div
            key={item.id}
            className={`ax-gallery-item ${item.destacado ? 'ax-gallery-item--featured' : ''} ax-gallery-item--${item.tipo}`}
            onClick={() => item.tipo === 'image' ? setLightbox(item) : null}
          >
            {item.tipo === 'video' ? (
              <div className="ax-gallery-video">
                <div className="ax-gallery-video-thumb">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="white">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
                {item.titulo && <span className="ax-gallery-caption">{item.titulo}</span>}
              </div>
            ) : (
              <>
                <img src={item.url} alt={item.titulo || ''} loading="lazy" />
                {item.titulo && <span className="ax-gallery-caption">{item.titulo}</span>}
              </>
            )}
          </div>
        ))}
      </div>

      {lightbox && (
        <div className="ax-lightbox" onClick={() => setLightbox(null)}>
          <div className="ax-lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="ax-lightbox-close" onClick={() => setLightbox(null)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
            <img src={lightbox.url} alt={lightbox.titulo || ''} />
            {lightbox.titulo && <p className="ax-lightbox-title">{lightbox.titulo}</p>}
            {lightbox.descripcion && <p className="ax-lightbox-desc">{lightbox.descripcion}</p>}
          </div>
        </div>
      )}
    </section>
  );
}

function ArtistVideos({ media }) {
  if (!media || media.length === 0) return null;

  const videos = media.filter((m) => m.tipo === 'video');
  if (videos.length === 0) return null;

  function getYoutubeId(url) {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  }

  return (
    <section className="ax-videos">
      <h2 className="ax-section-title">Videos</h2>

      <div className="ax-videos-grid">
        {videos.map((video) => {
          const youtubeId = getYoutubeId(video.url);
          return (
            <div key={video.id} className="ax-video-card">
              <div className="ax-video-embed">
                {youtubeId ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${youtubeId}`}
                    title={video.titulo || 'Video'}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                  />
                ) : (
                  <a href={video.url} target="_blank" rel="noopener noreferrer" className="ax-video-link">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="white">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                    <span>Ver video</span>
                  </a>
                )}
              </div>
              {video.titulo && <h3 className="ax-video-title">{video.titulo}</h3>}
              {video.descripcion && <p className="ax-video-desc">{video.descripcion}</p>}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default function ArtistMedia({ tracks, media }) {
  const hasMedia = media && media.length > 0;
  const videos = media?.filter((m) => m.tipo === 'video') || [];
  const hasVideos = videos.length > 0;

  return (
    <>
      <div id="ax-discography">
        <ArtistDiscography tracks={tracks} />
      </div>

      {hasMedia && (
        <div id="ax-gallery">
          <ArtistGallery media={media} />
        </div>
      )}

      {hasVideos && (
        <div id="ax-videos">
          <ArtistVideos media={media} />
        </div>
      )}
    </>
  );
}
