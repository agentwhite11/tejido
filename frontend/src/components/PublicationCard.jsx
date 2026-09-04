import { useState } from 'react';

export default function PublicationCard({ publication, user }) {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [shareStatus, setShareStatus] = useState(null);
  const image = publication.image || '';
  const isGradient = image.startsWith('linear-gradient(');

  const shareUrl = `${window.location.origin}/#publicacion/${publication.id}`;

  async function handleShare(platform) {
    let url = '';
    const text = `${publication.title} - TEJIDO Bajo Cauca`;

    if (platform === 'whatsapp') {
      url = `https://wa.me/?text=${encodeURIComponent(text + ' ' + shareUrl)}`;
    } else if (platform === 'facebook') {
      url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    } else if (platform === 'copy') {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setShareStatus('copied');
        setTimeout(() => setShareStatus(null), 2000);
      } catch {
        setShareStatus('error');
      }
      setShowShareMenu(false);
      return;
    }

    if (url) window.open(url, '_blank');
    setShowShareMenu(false);

    if (user) {
      try {
        await fetch('/api/collaborators/share', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ publication_id: publication.id }),
        });
        setShareStatus('points');
        setTimeout(() => setShareStatus(null), 2000);
      } catch {}
    }
  }

  return (
    <article className="publication-card">
      <div
        className="publication-image"
        style={{ backgroundImage: isGradient ? image : `url("${image}")` }}
        role="img"
        aria-label={publication.title}
      />
      <div className="publication-body">
        <span className="publication-kind">{publication.kind}</span>
        <h3>{publication.title}</h3>
        <p>{publication.summary}</p>
        <small>{publication.location || 'Caucasia'}</small>
        <div className="publication-card-footer">
          <div className="share-wrapper">
            <button
              className="share-btn"
              onClick={() => setShowShareMenu(!showShareMenu)}
              title="Compartir"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                <circle cx="18" cy="5" r="3"/>
                <circle cx="6" cy="12" r="3"/>
                <circle cx="18" cy="19" r="3"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
              </svg>
              Compartir
            </button>
            {showShareMenu && (
              <div className="share-menu">
                <button onClick={() => handleShare('whatsapp')}>WhatsApp</button>
                <button onClick={() => handleShare('facebook')}>Facebook</button>
                <button onClick={() => handleShare('copy')}>
                  {shareStatus === 'copied' ? 'Copiado' : 'Copiar enlace'}
                </button>
              </div>
            )}
          </div>
          {shareStatus === 'points' && (
            <span className="share-points-toast">+10 pts</span>
          )}
        </div>
      </div>
    </article>
  );
}
