/**
 * Publications Component - Maneja la lógica de publicaciones
 */
const PUBLICATIONS_COMPONENT = (() => {
  const { $, $$, escapeHTML, normalizeText, formatDate } = HELPERS;
  const LABELS = {
    HISTORIA: 'Historia',
    EVENTO: 'Evento',
    OPORTUNIDAD: 'Oportunidad',
    TALENTO: 'Talento',
    INICIATIVA: 'Iniciativa'
  };

  const KIND_IMAGES = {
    HISTORIA: 'https://colombiaextraordinaria.com/somos_colombia/external/img/img_departamentos/Caucasiaimagen_h.jpg',
    EVENTO: 'https://colombiaextraordinaria.com/somos_colombia/external/img/img_departamentos/Caucasiaimagen_t.jpg',
    OPORTUNIDAD: 'https://colombiaextraordinaria.com/somos_colombia/external/img/img_departamentos/Caucasiaimagen_ce.jpg',
    TALENTO: 'https://colombiaextraordinaria.com/somos_colombia/external/img/img_departamentos/Caucasiaimagen_h.jpg',
    INICIATIVA: 'https://colombiaextraordinaria.com/somos_colombia/external/img/img_departamentos/Caucasiaimagen_ce.jpg'
  };

  const publicationVisual = (publication) => {
    const image = publication.image || KIND_IMAGES[publication.kind];
    if (!image) return 'var(--mint)';
    return image.startsWith('linear-gradient')
      ? image
      : `linear-gradient(180deg,rgba(18,59,50,.05),rgba(18,59,50,.42)),url("${image}") center/cover`;
  };

  const cardTemplate = (publication) => {
    return `
      <div class="content-card" data-id="${publication.id}" tabindex="0">
        <div class="card-image" style="background:${escapeHTML(publicationVisual(publication))}">
          <span class="kind-tag">${LABELS[publication.kind] || publication.kind}</span>
          <button class="favorite ${publication.favorite ? 'on' : ''}" data-favorite="${publication.id}" aria-label="Guardar">${publication.favorite ? '♥' : '♡'}</button>
        </div>
        <div class="card-body">
          <div class="card-meta">
            <span>${formatDate(publication.start_date || publication.created_at)}</span>
            <span>·</span>
            <span>${escapeHTML(publication.location || 'Caucasia')}</span>
          </div>
          <h3>${escapeHTML(publication.title)}</h3>
          <p>${escapeHTML(publication.summary)}</p>
        </div>
      </div>
    `;
  };

  const renderPublications = ({ publications, kind, search, onDetail, onFavorite }) => {
    const filtered = publications.filter((p) => (
      (kind === 'TODOS' || p.kind === kind) &&
      (!search || normalizeText([p.title, p.summary, p.location].join(' ')).includes(normalizeText(search)))
    ));

    const contentGrid = $('#contentGrid');
    const emptyState = $('#emptyState');
    if (contentGrid) {
      contentGrid.innerHTML = filtered.map((p) => cardTemplate(p)).join('');
    }
    if (emptyState) {
      emptyState.classList.toggle('hidden', filtered.length > 0);
    }

    $$('.content-card').forEach((el) => {
      el.addEventListener('click', (event) => {
        if (!event.target.closest('[data-favorite]')) {
          onDetail(Number(el.dataset.id));
        }
      });
      el.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
          onDetail(Number(el.dataset.id));
        }
      });
    });

    $$('[data-favorite]').forEach((btn) => {
      btn.addEventListener('click', (event) => {
        event.stopPropagation();
        onFavorite(Number(btn.dataset.favorite), btn);
      });
    });

    return filtered;
  };

  return {
    renderPublications,
    cardTemplate,
    publicationVisual,
    LABELS,
    KIND_IMAGES
  };
})();

window.PUBLICATIONS_COMPONENT = PUBLICATIONS_COMPONENT;
