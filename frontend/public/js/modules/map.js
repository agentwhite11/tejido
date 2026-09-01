/**
 * MAP.JS - Gestión del Mapa Interactivo
 * 
 * Responsabilidades:
 * - Renderizar mapa OpenStreetMap
 * - Gestionar filtros por categoría
 * - Mostrar puntos de interés
 * - Actualizar vista según selección
 */

const MAP_MODULE = {
  // Estado local del módulo
  mapKind: 'TODOS',
  caucasiaCenter: [7.9865, -75.1935],
  knownPlaces: [
    ['malecón de caucasia', [7.9892, -75.1987]],
    ['el pando', [7.9768, -75.2052]],
    ['parque de las banderas', [7.9828, -75.1998]],
    ['parques de caucasia', [7.9817, -75.1879]]
  ],

  /**
   * Normaliza texto de ubicación
   */
  normalizeLocation(value = '') {
    return HELPERS.normalizeText(value);
  },

  /**
   * Obtiene coordenadas de una publicación
   */
  publicationCoords(pub) {
    const location = this.normalizeLocation(pub.location || 'Caucasia');
    const known = this.knownPlaces.find(([name]) =>
      location.includes(this.normalizeLocation(name))
    );
    return known ? known[1] : this.caucasiaCenter;
  },

  /**
   * Genera URL de OpenStreetMap
   */
  osmUrl(coords = this.caucasiaCenter) {
    const [lat, lon] = coords;
    return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=16/${lat}/${lon}`;
  },

  /**
   * Genera URL de embed del mapa
   */
  mapEmbedUrl(coords) {
    if (!coords)
      return 'https://www.openstreetmap.org/export/embed.html?bbox=-75.222%2C7.964%2C-75.166%2C8.006&layer=mapnik';

    const [lat, lon] = coords;
    const bbox = [lon - 0.008, lat - 0.005, lon + 0.008, lat + 0.005].join(',');
    return (
      `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${encodeURIComponent(
        lat + ',' + lon
      )}`
    );
  },

  /**
   * Renderiza el mapa con publicaciones filtradas
   */
  renderMap() {
    const state = STATE_STORE.getState();
    const map = $('#territoryMap');
    
    const items = state.publications.filter(
      p => this.mapKind === 'TODOS' || p.kind === this.mapKind
    );
    
    if (map) {
      map.innerHTML = `<iframe class="osm-frame" src="${this.mapEmbedUrl()}" title="Mapa real de Caucasia"></iframe>`;
    }
    
    const sidebar = $('#mapPlaceList');
    if (sidebar) {
      sidebar.innerHTML = items
        .map(
          p => `
        <button class="map-sidebar-item" data-place-id="${p.id}" 
          title="${HELPERS.escapeHTML(p.title)} — ${HELPERS.escapeHTML(
            p.location || 'Caucasia'
          )}">
          <span class="place-dot ${p.kind.toLowerCase()}"></span>
          <div>
            <b>${HELPERS.escapeHTML(p.title)}</b>
            <small>${HELPERS.escapeHTML(p.location || 'Caucasia')}</small>
          </div>
        </button>
      `
        )
        .join('');

      $$('[data-place-id]', sidebar).forEach(button => {
        button.onclick = () => this.selectMapItem(+button.dataset.placeId);
      });

      const first = $('.map-sidebar-item[data-place-id]', sidebar);
      if (first) {
        this.selectMapItem(+first.dataset.placeId);
      } else {
        const mapCard = $('#mapCard');
        if (mapCard) {
          mapCard.innerHTML =
            '<span class="map-card-icon">+</span><h3>No hay puntos en esta categoría</h3><p>Prueba otro filtro para seguir explorando el territorio.</p>';
          mapCard.classList.remove('visible');
        }
      }
    }
  },

  /**
   * Selecciona un punto del mapa
   */
  selectMapItem(id) {
    const state = STATE_STORE.getState();
    const map = $('#territoryMap');
    const pub = state.publications.find(item => item.id === id);
    
    if (!pub) return;
    
    const coords = this.publicationCoords(pub);
    const frame = $('.osm-frame', map);
    
    $$('.map-sidebar-item').forEach(item => {
      item.classList.toggle('active', +item.dataset.placeId === id);
    });
    
    if (frame) frame.src = this.mapEmbedUrl(coords);
    
    const mapCard = $('#mapCard');
    if (mapCard) {
      mapCard.innerHTML = `
        <span class="map-card-icon">⌖</span>
        <p class="map-meta">${LABELS[pub.kind] || pub.kind} · ${HELPERS.escapeHTML(
        pub.location || 'Caucasia'
      )}</p>
        <h3>${HELPERS.escapeHTML(pub.title)}</h3>
        <p>${HELPERS.escapeHTML(pub.summary)}</p>
        <a class="text-link external-map" href="${this.osmUrl(coords)}" 
           target="_blank" rel="noopener">
          Abrir ubicación en OpenStreetMap
        </a>
        <button class="btn btn-primary" data-map-open="${pub.id}">
          Ver publicación
        </button>
      `;
      mapCard.classList.add('visible');

      const mapOpenBtn = $('[data-map-open]', mapCard);
      if (mapOpenBtn) {
        mapOpenBtn.onclick = () => DETAIL.showDetail(id);
      }
    }
  }
};

window.MAP_MODULE = MAP_MODULE;
