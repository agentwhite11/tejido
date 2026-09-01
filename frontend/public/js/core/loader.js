/**
 * Core Loader - Orquesta la carga de módulos
 */
const CORE_LOADER = (() => {
  const loadInitialData = async () => {
    try {
      const [categories, publications, user] = await Promise.all([
        API_SERVICE.get('/api/categories'),
        API_SERVICE.get('/api/publications'),
        API_SERVICE.get('/api/me')
      ]);

      STATE_STORE.setState({
        categories,
        publications,
        user: user.user
      });

      if (STATE_STORE.state.token && !user.user) {
        STATE_STORE.clearUser();
      }

      return { categories, publications, user };
    } catch (error) {
      HELPERS.toast('No pudimos conectar con TEJIDO');
      throw error;
    }
  };

  const initApp = async () => {
    await loadInitialData();
    
    // Asegurar compatibilidad con el app.js global
    if (window.TEJIDO_APP) {
      Object.assign(window.TEJIDO_APP, {
        state: STATE_STORE.getState(),
        api: API_SERVICE.request
      });
    }
  };

  return {
    loadInitialData,
    initApp
  };
})();

window.CORE_LOADER = CORE_LOADER;
