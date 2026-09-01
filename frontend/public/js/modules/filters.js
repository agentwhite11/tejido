/**
 * FILTERS.JS - Sistema de Filtrado y Búsqueda
 * 
 * Responsabilidades:
 * - Filtrado por categoría (TODOS, HISTORIA, EVENTO, etc.)
 * - Búsqueda por texto
 * - Renderizado de lista de publicaciones
 * - Renderizado de próximos eventos
 * - Renderizado de oportunidades
 */

const FILTERS = {
  /**
   * Obtiene eventos próximos ordenados por fecha
   */
  getUpcomingEvents() {
    const state = STATE_STORE.getState();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return state.publications
      .filter(
        p =>
          p.kind === 'EVENTO' &&
          HELPERS.parseLocalDate(p.start_date || p.created_at) >= today
      )
      .sort(
        (a, b) =>
          HELPERS.parseLocalDate(a.start_date || a.created_at) -
          HELPERS.parseLocalDate(b.start_date || b.created_at)
      );
  },

  /**
   * Renderiza la agenda de próximos eventos
   */
  renderAgenda() {
    const events = this.getUpcomingEvents().slice(0, 4);
    const agendaList = $('#agendaList');
    
    if (!agendaList) return;

    agendaList.innerHTML =
      events.length > 0
        ? events
            .map(p => {
              const d = HELPERS.parseLocalDate(p.start_date || p.created_at);
              return `
          <div class="agenda-item">
            <div class="date-box">
              <b>${d.getDate()}</b>
              <span>${d.toLocaleDateString('es-CO', { month: 'short' })}</span>
            </div>
            <div>
              <h3>${HELPERS.escapeHTML(p.title)}</h3>
              <p>
                ${HELPERS.escapeHTML(p.location || 'Caucasia')} · 
                ${d.toLocaleTimeString('es-CO', {
                  hour: 'numeric',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <button data-open="${p.id}" aria-label="Abrir ${HELPERS.escapeHTML(
              p.title
            )}">+</button>
          </div>
        `;
            })
            .join('')
        : '<div class="empty-panel">No hay próximos eventos publicados.</div>';

    $$('[data-open]', agendaList).forEach(b => {
      b.onclick = () => DETAIL.showDetail(+b.dataset.open);
    });
  },

  /**
   * Renderiza oportunidades destacadas
   */
  renderOpportunities() {
    const state = STATE_STORE.getState();
    const items = state.publications
      .filter(p => p.kind === 'OPORTUNIDAD')
      .slice(0, 3);
    
    const opportunityGrid = $('#opportunityGrid');
    if (!opportunityGrid) return;

    opportunityGrid.innerHTML = items
      .map(
        p => `
      <article class="opp-card">
        <span>OPORTUNIDAD · ${HELPERS.formatDate(p.end_date)}</span>
        <h3>${HELPERS.escapeHTML(p.title)}</h3>
        <p>${HELPERS.escapeHTML(p.summary)}</p>
        <button class="text-link" data-open="${p.id}">Conocer más →</button>
      </article>
    `
      )
      .join('');

    $$('[data-open]', opportunityGrid).forEach(b => {
      b.onclick = () => DETAIL.showDetail(+b.dataset.open);
    });
  },

  /**
   * Aplica filtros y actualiza vistas
   */
  applyFilters() {
    PUBLICATIONS_COMPONENT.renderPublications();
    this.renderAgenda();
    this.renderOpportunities();
  }
};

window.FILTERS = FILTERS;
