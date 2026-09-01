/**
 * DETAIL.JS - Vista Detallada de Publicaciones
 * 
 * Responsabilidades:
 * - Mostrar detalle completo de una publicación
 * - Gestionar acciones en detalle (favorito, compartir, reportar)
 * - Manejo de rutas compartidas (#contenido-{id})
 */

const DETAIL = {
  /**
   * Muestra el detalle completo de una publicación
   */
  async showDetail(id) {
    try {
      const pub = await API_SERVICE.get('/api/publications/' + id);
      
      const external = pub.link
        ? `<a class="btn btn-soft" href="${HELPERS.escapeHTML(pub.link)}" target="_blank" rel="noopener">Abrir enlace ↗</a>`
        : '';
      
      const detailContent = $('#detailContent');
      if (detailContent) {
        detailContent.innerHTML = `
          <div class="detail-hero" style="background:${HELPERS.escapeHTML(
            PUBLICATIONS_COMPONENT.publicationVisual(pub)
          )}"></div>
          <p class="eyebrow">${LABELS[pub.kind]}</p>
          <h2>${HELPERS.escapeHTML(pub.title)}</h2>
          <div class="detail-meta">
            <span>◷ ${HELPERS.formatDate(pub.start_date || pub.created_at)}</span>
            <span>⌖ ${HELPERS.escapeHTML(pub.location || 'Caucasia')}</span>
            <span>Por ${HELPERS.escapeHTML(pub.author)}</span>
          </div>
          <p><b>${HELPERS.escapeHTML(pub.summary)}</b></p>
          <p>${HELPERS.escapeHTML(pub.content)}</p>
          <div class="detail-actions">
            <button class="btn btn-primary" id="detailFav">
              ${pub.favorite ? '♥ Guardado' : '♡ Guardar'}
            </button>
            ${external}
            <button class="btn btn-soft" id="shareBtn">Compartir</button>
            <button class="btn btn-soft" id="reportBtn">Reportar</button>
          </div>
        `;
      }
      
      UI.closeAll();
      UI.openModal('#detailModal');
      
      const detailFav = $('#detailFav');
      if (detailFav) {
        detailFav.onclick = () =>
          FAVORITES.toggleFavorite(id, detailFav, true);
      }
      
      const shareBtn = $('#shareBtn');
      if (shareBtn) {
        shareBtn.onclick = async () => {
          try {
            await navigator.clipboard.writeText(
              location.origin + '/#contenido-' + id
            );
            HELPERS.toast('Enlace copiado');
          } catch {
            HELPERS.toast('No fue posible copiar el enlace');
          }
        };
      }
      
      const reportBtn = $('#reportBtn');
      if (reportBtn) {
        reportBtn.onclick = () => FAVORITES.reportContent(id);
      }
    } catch (e) {
      HELPERS.toast(e.message);
    }
  },

  /**
   * Maneja rutas compartidas (#contenido-{id})
   */
  handleSharedRoute() {
    const match = /^#contenido-(\d+)$/.exec(location.hash);
    if (match) {
      this.showDetail(+match[1]);
    }
  }
};

window.DETAIL = DETAIL;
