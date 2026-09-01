const UI = (() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  function escapeHTML(value = '') {
    return String(value).replace(/[&<>"']/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[char]));
  }

  function toast(message) {
    const el = $('#toast');
    if (!el) return;
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(toast.t);
    toast.t = setTimeout(() => el.classList.remove('show'), 2800);
  }

  function openModal(id) {
    const overlay = $('#overlay');
    const target = $(id);
    if (overlay) overlay.classList.remove('hidden');
    if (target) target.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeAll() {
    const overlay = $('#overlay');
    $$('#overlay,.modal,.drawer').forEach((element) => element.classList.add('hidden'));
    document.body.style.overflow = '';
    if (overlay) overlay.classList.add('hidden');
  }

  function bindCardsAndFavorites({ publications, onDetail, onFavorite }) {
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
  }

  function renderPublications({ publications, state, onDetail, onFavorite }) {
    const search = normalizeText(state.search);
    const filtered = publications.filter((p) => (
      (state.kind === 'TODOS' || p.kind === state.kind) &&
      (!search || normalizeText([p.title, p.summary, p.location].join(' ')).includes(search))
    ));

    const contentGrid = $('#contentGrid');
    const emptyState = $('#emptyState');
    if (contentGrid) {
      contentGrid.innerHTML = filtered.map((p) => cardTemplate(p)).join('');
    }
    if (emptyState) {
      emptyState.classList.toggle('hidden', filtered.length > 0);
    }

    bindCardsAndFavorites({ publications: filtered, onDetail, onFavorite });
  }

  function normalizeText(value = '') {
    return String(value).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  }

  function publicationVisual(p) {
    const kindImages = {
      HISTORIA: 'https://colombiaextraordinaria.com/somos_colombia/external/img/img_departamentos/Caucasiaimagen_h.jpg',
      EVENTO: 'https://colombiaextraordinaria.com/somos_colombia/external/img/img_departamentos/Caucasiaimagen_t.jpg',
      OPORTUNIDAD: 'https://colombiaextraordinaria.com/somos_colombia/external/img/img_departamentos/Caucasiaimagen_ce.jpg',
      TALENTO: 'https://colombiaextraordinaria.com/somos_colombia/external/img/img_departamentos/Caucasiaimagen_h.jpg',
      INICIATIVA: 'https://colombiaextraordinaria.com/somos_colombia/external/img/img_departamentos/Caucasiaimagen_ce.jpg'
    };

    const image = p.image || kindImages[p.kind];
    if (!image) return 'var(--mint)';
    return image.startsWith('linear-gradient')
      ? image
      : `linear-gradient(180deg,rgba(18,59,50,.05),rgba(18,59,50,.42)),url("${image}") center/cover`;
  }

  function cardTemplate(p) {
    const labels = {
      HISTORIA: 'Historia',
      EVENTO: 'Evento',
      OPORTUNIDAD: 'Oportunidad',
      TALENTO: 'Talento',
      INICIATIVA: 'Iniciativa'
    };

    const imageStyle = `background:${escapeHTML(publicationVisual(p))}`;
    return `
      <div class="content-card" data-id="${p.id}" tabindex="0">
        <div class="card-image" style="${imageStyle}">
          <span class="kind-tag">${labels[p.kind] || p.kind}</span>
          <button class="favorite ${p.favorite ? 'on' : ''}" data-favorite="${p.id}" aria-label="Guardar">${p.favorite ? '♥' : '♡'}</button>
        </div>
        <div class="card-body">
          <div class="card-meta">
            <span>${formatDate(p.start_date || p.created_at)}</span>
            <span>·</span>
            <span>${escapeHTML(p.location || 'Caucasia')}</span>
          </div>
          <h3>${escapeHTML(p.title)}</h3>
          <p>${escapeHTML(p.summary)}</p>
        </div>
      </div>
    `;
  }

  function parseLocalDate(value) {
    if (!value) return null;
    const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    return dateOnly ? new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3])) : new Date(value);
  }

  function formatDate(value) {
    const date = parseLocalDate(value);
    if (!date || Number.isNaN(date.getTime())) return 'Para descubrir';
    return new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
  }

  return {
    $, $$, escapeHTML, toast, openModal, closeAll, renderPublications, normalizeText, formatDate, publicationVisual
  };
})();

window.TEJIDO_UI = UI;
