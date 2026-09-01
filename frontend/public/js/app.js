/**
 * APP.JS - Punto de Entrada Principal de TEJIDO
 * 
 * Archivos modularizados que usa:
 * ✓ modules/auth.js - Autenticación y sesión
 * ✓ modules/favorites.js - Gestión de favoritos
 * ✓ modules/filters.js - Filtros y búsqueda
 * ✓ modules/map.js - Mapa interactivo
 * ✓ modules/editor.js - Editor de contenido
 * ✓ modules/content.js - Panel de usuario
 * ✓ modules/interactions.js - Eventos de página
 * ✓ modules/constants.js - Constantes y etiquetas
 * ✓ components/detail.js - Vista de detalle
 * ✓ ui.js - Utilidades de UI (ya existía)
 * ✓ assistant.js - Asistente Hilo (ya existía)
 * 
 * Dependencias externas:
 * ✓ services/api.js - Cliente HTTP
 * ✓ state/store.js - Gestión de estado
 * ✓ core/loader.js - Carga inicial
 * ✓ utils/helpers.js - Funciones de utilidad
 * ✓ components/publications.js - Componente de publicaciones
 */

// ================================================
// INICIALIZACIÓN PRINCIPAL DE TEJIDO
// ================================================

/**
 * Función principal de inicialización
 * Se ejecuta cuando el DOM está listo
 */
async function initializeTEJIDO() {
  try {
    console.log('Iniciando TEJIDO...');
    
    // 1. Cargar datos iniciales del servidor
    await CORE_LOADER.loadInitialData();
    
    // 2. Renderizar información de sesión
    AUTH.renderSession();
    
    // 3. Vincular todos los eventos de interacción de la página
    INTERACTIONS.bindPageEvents();
    
    // 4. Inicializar asistente Hilo si está disponible
    if (window.TEJIDO_ASSISTANT && typeof window.TEJIDO_ASSISTANT.bind === 'function') {
      window.TEJIDO_ASSISTANT.bind();
    }
    
    console.log('✅ TEJIDO inicializado correctamente');
  } catch (error) {
    console.error('❌ Error al inicializar TEJIDO:', error);
    HELPERS.toast('Error al cargar TEJIDO');
  }
}

// Iniciar la aplicación cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeTEJIDO);
} else {
  // Si el DOM ya está listo, iniciar inmediatamente
  initializeTEJIDO();
}

// ================================================
// INTERFAZ GLOBAL PARA DEBUG Y EXTENSIBILIDAD
// ================================================

/**
 * API global expuesta para debugging y extensiones
 * Acceso: window.TEJIDO_APP
 */
window.TEJIDO_APP = {
  // Obtener estado actual
  getState: () => STATE_STORE.getState(),
  
  // Acceso directo al cliente API
  api: API_SERVICE,
  
  // Funciones principales
  showDetail: (id) => DETAIL.showDetail(id),
  upcomingEvents: () => FILTERS.getUpcomingEvents(),
  
  // Módulos disponibles
  modules: {
    auth: AUTH,
    favorites: FAVORITES,
    content: CONTENT,
    editor: EDITOR,
    map: MAP_MODULE,
    filters: FILTERS,
    detail: DETAIL,
    interactions: INTERACTIONS,
    publications: PUBLICATIONS_COMPONENT
  },
  
  // Versión de la aplicación
  version: '2.0 - Modularizado'
};
