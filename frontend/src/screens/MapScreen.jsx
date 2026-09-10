/**
 * MAPSCREEN.JSX — Mapa Interactivo del Bajo Cauca
 *
 * Pantalla que muestra un mapa real de OpenStreetMap con:
 * - Filtros por tipo de publicación (Eventos, Historias, Talento, etc.)
 * - Sidebar con lista de publicaciones filtradas
 * - Tarjeta de detalle al seleccionar un punto
 * - Coordenadas reales de lugares conocidos de Caucasia
 *
 * Basado en el módulo legacy map.js del frontend vanilla JS.
 * Portado a React como parte de la FASE 1 del plan de magia.
 */

import { useState, useMemo } from 'react';
import ScreenIntro from '../components/ScreenIntro.jsx';
import { KIND_COLORS, KIND_LABELS, normalizeText } from '../utils/constants.js';

const KNOWN_PLACES = [
  { name: 'malecón de caucasia', coords: [7.9892, -75.1987] },
  { name: 'el pando', coords: [7.9768, -75.2052] },
  { name: 'parque de las banderas', coords: [7.9828, -75.1998] },
  { name: 'parques de caucasia', coords: [7.9817, -75.1879] },
];

const CAUCASIA_CENTER = [7.9865, -75.1935];

const MAP_FILTERS = [
  { key: 'TODOS', label: 'Todo' },
  { key: 'HISTORIA', label: 'Historias' },
  { key: 'EVENTO', label: 'Eventos' },
  { key: 'OPORTUNIDAD', label: 'Oportunidades' },
  { key: 'TALENTO', label: 'Talento' },
  { key: 'INICIATIVA', label: 'Iniciativas' },
];

/**
 * Obtiene coordenadas GPS para una publicación basándose en su campo location.
 * Busca coincidencias parciales en los lugares conocidos.
 * Si no hay coincidencia, retorna el centro de Caucasia.
 */
function getPublicationCoords(pub) {
  const location = normalizeText(pub.location || 'Caucasia');
  const match = KNOWN_PLACES.find((place) =>
    location.includes(normalizeText(place.name))
  );
  return match ? match.coords : CAUCASIA_CENTER;
}

/**
 * Genera la URL del embed de OpenStreetMap.
 * Calcula un bounding box alrededor de las coordenadas para encuadre óptimo.
 */
function getMapEmbedUrl(coords = CAUCASIA_CENTER) {
  const [lat, lon] = coords;
  // Bounding box: ±0.008 grados de longitud, ±0.005 de latitud
  const bbox = [lon - 0.008, lat - 0.005, lon + 0.008, lat + 0.005].join(',');
  return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${encodeURIComponent(`${lat},${lon}`)}`;
}

/**
 * Genera la URL para abrir la ubicación en OpenStreetMap (nueva pestaña).
 */
function getOsmUrl(coords = CAUCASIA_CENTER) {
  const [lat, lon] = coords;
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=16/${lat}/${lon}`;
}

/**
 * Genera la URL del embed por defecto (vista general de Caucasia).
 */
function getDefaultEmbedUrl() {
  return 'https://www.openstreetmap.org/export/embed.html?bbox=-75.222%2C7.964%2C-75.166%2C8.006&layer=mapnik';
}

export default function MapScreen({ publications = [] }) {
  /** Filtro activo: 'TODOS' por defecto, o el kind seleccionado */
  const [activeFilter, setActiveFilter] = useState('TODOS');

  /** ID de la publicación seleccionada en el sidebar */
  const [selectedId, setSelectedId] = useState(null);

  /**
   * Publicaciones filtradas según el filtro activo.
   * Se recalcula solo cuando cambia publications o activeFilter.
   */
  const filteredPubs = useMemo(() => {
    if (activeFilter === 'TODOS') return publications;
    return publications.filter((p) => p.kind === activeFilter);
  }, [publications, activeFilter]);

  /**
   * Publicación actualmente seleccionada.
   * Se busca por ID para obtener sus datos completos.
   */
  const selectedPub = useMemo(() => {
    if (!selectedId) return null;
    return publications.find((p) => p.id === selectedId) || null;
  }, [publications, selectedId]);

  /**
   * URL del iframe del mapa.
   * Si hay una publicación seleccionada, centra en sus coordenadas.
   * Si no, muestra la vista general de Caucasia.
   */
  const mapUrl = selectedPub
    ? getMapEmbedUrl(getPublicationCoords(selectedPub))
    : getDefaultEmbedUrl();

  /**
   * Maneja el clic en una publicación del sidebar.
   * Actualiza la selección y centra el mapa en esa ubicación.
   */
  function handleSelectPub(id) {
    setSelectedId(id === selectedId ? null : id);
  }

  return (
    <section className="section screen-section map-screen">
      {/* Encabezado de la pantalla */}
      <ScreenIntro
        eyebrow="Memoria, río y comunidad"
        title="Mapa vivo"
        description="Descubre dónde nacen las historias, eventos y talentos de Caucasia y el Bajo Cauca."
      />

      {/* Barra de filtros por tipo de publicación */}
      <div className="map-filters">
        {MAP_FILTERS.map((filter) => (
          <button
            key={filter.key}
            className={`map-filter-chip${activeFilter === filter.key ? ' active' : ''}`}
            onClick={() => {
              setActiveFilter(filter.key);
              setSelectedId(null); // Limpiar selección al cambiar filtro
            }}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Layout principal: mapa + sidebar */}
      <div className="map-layout">
        {/* Mapa de OpenStreetMap embebido */}
        <div className="map-container">
          <iframe
            className="map-iframe"
            src={mapUrl}
            title="Mapa interactivo de Caucasia"
            loading="lazy"
          />

          {/* Leyenda de colores del mapa */}
          <div className="map-legend">
            {Object.entries(KIND_COLORS).map(([kind, color]) => (
              <div key={kind} className="map-legend-item">
                <span className="map-legend-dot" style={{ background: color }} />
                <span>{KIND_LABELS[kind]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar con lista de publicaciones filtradas */}
        <aside className="map-sidebar">
          <div className="map-sidebar-header">
            <p className="eyebrow">Puntos del territorio</p>
            <h2>{filteredPubs.length} lugar{filteredPubs.length !== 1 ? 'es' : ''}</h2>
            <p className="map-sidebar-sub">
              {activeFilter === 'TODOS'
                ? 'Todos los contenidos publicados'
                : `Filtrado por ${KIND_LABELS[activeFilter] || activeFilter}`}
            </p>
          </div>

          {/* Lista scrolleable de publicaciones */}
          <div className="map-sidebar-list">
            {filteredPubs.length === 0 && (
              <div className="map-empty-state">
                <p>No hay publicaciones en esta categoría.</p>
              </div>
            )}

            {filteredPubs.map((pub) => (
              <button
                key={pub.id}
                className={`map-sidebar-item${selectedId === pub.id ? ' active' : ''}`}
                onClick={() => handleSelectPub(pub.id)}
              >
                {/* Punto de color según el tipo */}
                <span
                  className={`map-place-dot ${(pub.kind || '').toLowerCase()}`}
                  style={{ background: KIND_COLORS[pub.kind] || '#8a4f7d' }}
                />
                <div>
                  <b>{pub.title}</b>
                  <small>{pub.location || 'Caucasia'}</small>
                </div>
              </button>
            ))}
          </div>
        </aside>
      </div>

      {/* Tarjeta de detalle: aparece cuando se selecciona una publicación */}
      {selectedPub && (
        <div className="map-detail-card" role="complementary">
          <span className="map-detail-icon">{'\u2316'}</span>
          <p className="map-detail-meta">
            {KIND_LABELS[selectedPub.kind] || selectedPub.kind} ·{' '}
            {selectedPub.location || 'Caucasia'}
          </p>
          <h3>{selectedPub.title}</h3>
          <p>{selectedPub.summary}</p>
          <a
            className="map-detail-link"
            href={getOsmUrl(getPublicationCoords(selectedPub))}
            target="_blank"
            rel="noopener noreferrer"
          >
            Abrir ubicación en OpenStreetMap
          </a>
        </div>
      )}
    </section>
  );
}
