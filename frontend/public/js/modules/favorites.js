/**
 * FAVORITES.JS - Gestión de Favoritos y Guardadas
 * 
 * Responsabilidades:
 * - Alternar estado de favoritos
 * - Mostrar sección de guardadas
 * - Eliminar de favoritos
 * - Reportar contenido
 */

const FAVORITES = {
  /**
   * Alterna estado de favorito
   */
  async toggleFavorite(id, button, detail = false) {
    const state = STATE_STORE.getState();
    
    if (!state.user) {
      window.PENDING_FAVORITE_ID = id;
      UI.closeAll();
      UI.openModal('#loginModal');
      return;
    }
    
    try {
      const pub = state.publications.find(x => x.id === id);
      const isFav = !!pub?.favorite;
      
      const result = await API_SERVICE[isFav ? 'delete' : 'post'](
        '/api/publications/' + id + '/favorite',
        isFav ? {} : {}
      );
      
      if (pub) pub.favorite = result.favorite;
      
      if (detail) {
        button.textContent = result.favorite ? '♥ Guardado' : '♡ Guardar';
      }
      
      // Actualizar vistas
      PUBLICATIONS_COMPONENT.renderPublications();
      this.renderSaved();
      
      HELPERS.toast(
        result.favorite ? 'Guardado en favoritos' : 'Retirado de favoritos'
      );
    } catch (e) {
      HELPERS.toast(e.message);
    }
  },

  /**
   * Renderiza la sección de guardadas
   */
  renderSaved() {
    const state = STATE_STORE.getState();
    const section = $('#guardadas');
    const nav = $('#savedNav');
    const mobile = $('.mobile-saved');
    const logged = !!state.user;
    
    if (section) section.classList.toggle('hidden', !logged);
    if (nav) nav.classList.toggle('hidden', !logged);
    if (mobile) mobile.classList.toggle('hidden', !logged);
    
    if (!logged) return;
    
    const saved = state.publications.filter(p => p.favorite);
    const savedGrid = $('#savedGrid');
    const savedEmpty = $('#savedEmpty');
    
    if (savedGrid) {
      savedGrid.innerHTML = saved.length
        ? saved
            .map(
              p => `
        <article class="saved-card">
          <button class="remove-saved" data-remove-saved="${p.id}" aria-label="Quitar de guardadas">♥</button>
          <span class="saved-kind">${HELPERS.escapeHTML(
            LABELS[p.kind] || p.kind
          )} guardado</span>
          <h3>${HELPERS.escapeHTML(p.title)}</h3>
          <p>${HELPERS.escapeHTML(p.summary)}</p>
          <div class="saved-meta">
            <span>⌖ ${HELPERS.escapeHTML(p.location || 'Caucasia')}</span>
            <span>◷ ${HELPERS.formatDate(p.end_date || p.start_date)}</span>
          </div>
          <button class="text-link" data-saved-open="${p.id}">Ver contenido →</button>
        </article>
      `
            )
            .join('')
        : '';
    }
    
    if (savedEmpty) savedEmpty.classList.toggle('hidden', saved.length > 0);
    
    // Bind events
    $$('[data-saved-open]').forEach(b => {
      b.onclick = () => DETAIL.showDetail(+b.dataset.savedOpen);
    });
    $$('[data-remove-saved]').forEach(b => {
      b.onclick = () => this.toggleFavorite(+b.dataset.removeSaved, b);
    });
  },

  /**
   * Reporta un contenido
   */
  async reportContent(id) {
    const state = STATE_STORE.getState();
    
    if (!state.user) {
      UI.closeAll();
      UI.openModal('#loginModal');
      return;
    }
    
    const reason = prompt('¿Por qué deseas reportar este contenido?');
    if (!reason) return;
    
    try {
      await API_SERVICE.post('/api/publications/' + id + '/report', {
        reason
      });
      HELPERS.toast('Gracias. Revisaremos el reporte.');
    } catch (e) {
      HELPERS.toast(e.message);
    }
  }
};

window.FAVORITES = FAVORITES;
