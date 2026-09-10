/**
 * CONSTANTS.JS — Constantes compartidas de TEJIDO
 *
 * Colores, etiquetas, ubicaciones y utilidades usadas
 * en múltiples pantallas y componentes.
 */

// ─── Colores por tipo de publicación ───────────────────────
export const KIND_COLORS = {
  EVENTO: '#d85b36',
  HISTORIA: '#f4b942',
  TALENTO: '#173f36',
  OPORTUNIDAD: '#8a4f7d',
  INICIATIVA: '#3b82f6',
};

// ─── Etiquetas legibles por tipo ───────────────────────────
export const KIND_LABELS = {
  EVENTO: 'Evento',
  HISTORIA: 'Historia',
  TALENTO: 'Talento',
  OPORTUNIDAD: 'Oportunidad',
  INICIATIVA: 'Iniciativa',
};

// ─── Íconos por tipo de publicación ────────────────────────
export const KIND_ICONS = {
  EVENTO: '\uD83C\uDFB6',
  HISTORIA: '\uD83D\uDCD6',
  TALENTO: '\uD83C\uDFA4',
  OPORTUNIDAD: '\uD83C\uDF1F',
  INICIATIVA: '\uD83D\uDCD1',
};

// ─── Municipios del Bajo Cauca ─────────────────────────────
export const MUNICIPALITIES = [
  { id: 'caucasia', name: 'Caucasia', emoji: '\uD83C\uDFF0', color: '#d4a843', theme: 'Capital' },
  { id: 'caceres', name: 'Cáceres', emoji: '\uD83C\uDFDB', color: '#1d8fa3', theme: 'Historia' },
  { id: 'taraza', name: 'Tarazá', emoji: '\u2615', color: '#75b79b', theme: 'Café' },
  { id: 'nechi', name: 'Nechí', emoji: '\uD83C\uDF0A', color: '#1d8fa3', theme: 'Río' },
  { id: 'elbagre', name: 'El Bagre', emoji: '\u2B50', color: '#d4a843', theme: 'Oro' },
  { id: 'zaragoza', name: 'Zaragoza', emoji: '\u2693', color: '#8a4f7d', theme: 'Fundación' },
];

// ─── Palabras clave para agrupar publicaciones por municipio ─
export const MUNICIPALITY_LOCATION_MAP = {
  caucasia: ['caucasia', 'malecón', 'parque de las banderas', 'parques de caucasia', 'pando'],
  caceres: ['cáceres', 'caceres'],
  taraza: ['tarazá', 'taraza'],
  nechi: ['nechí', 'nechi'],
  elbagre: ['el bagre', 'bagre'],
  zaragoza: ['zaragoza'],
};

// ─── Datos completos de municipios (para UI del mapa) ───────
export const MUNICIPALITIES_DATA = {
  caucasia: {
    name: 'Caucasia',
    title: 'Capital del Bajo Cauca',
    description: 'Centro comercial y administrativo de la región, ubicada en la confluencia de los ríos Cauca y Nechí. Capital del Bajo Cauca, fundada en 1866.',
    image: '/assets/municipios/caucasia.jpg',
    tags: ['Capital', 'Confluencia', 'Comercio']
  },
  caceres: {
    name: 'Cáceres',
    title: 'Historia y Tradición',
    description: 'Fundado en 1576. Uno de los pueblos más antiguos de Antioquia con rica historia minera y tradición colonial que se respira en sus calles empedradas.',
    image: '/assets/municipios/caceres.jpg',
    tags: ['Colonial', 'Minería', 'Historia']
  },
  taraza: {
    name: 'Tarazá',
    title: 'Tierra de Café',
    description: 'Tierra de cafetaleros y tradición campesina. Conocido por su calidez humana, producción agrícola y los paisajes verdes de sus montañas.',
    image: '/assets/municipios/taraza.jpg',
    tags: ['Café', 'Agricultura', 'Campesinos']
  },
  nechi: {
    name: 'Nechí',
    title: 'Río y Tradición Minera',
    description: 'Fundado en 1636 como campamento minero. Hogar de comunidades afrocolombianas que mantienen vivas las tradiciones ancestrales del río.',
    image: '/assets/municipios/nechi.jpg',
    tags: ['Minería', 'Afrocolombiano', 'Río']
  },
  elbagre: {
    name: 'El Bagre',
    title: 'Cuna de Artistas',
    description: 'Primer productor de oro de Antioquia. Tierra de artistas y músicos que enamoran con su folklore y la alegría de su gente.',
    image: '/assets/municipios/elbagre.jpg',
    tags: ['Oro', 'Folklore', 'Música']
  },
  zaragoza: {
    name: 'Zaragoza',
    title: 'Municipio Fundado',
    description: 'Fundado en 1581. Pueblo con historia minera milenaria y paisajes naturales impresionantes donde el río Cauca narra historias.',
    image: '/assets/municipios/zaragoza.jpg',
    tags: ['Fundación', 'Naturaleza', 'Minería']
  }
};

// ─── Coordenadas SVG de municipios para el mapa interactivo ─
export const MUNICIPALITY_SVG_POSITIONS = {
  caucasia: { x: 365, y: 205 },
  caceres: { x: 195, y: 190 },
  taraza: { x: 235, y: 108 },
  nechi: { x: 335, y: 115 },
  elbagre: { x: 490, y: 128 },
  zaragoza: { x: 215, y: 330 },
};

// ─── Utilidad: normalizar texto para comparación ────────────
export function normalizeText(text = '') {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}
