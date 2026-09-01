/**
 * State Store - Gestión centralizada del estado de la aplicación
 */
const STATE_STORE = (() => {
  const state = {
    token: localStorage.getItem('tejido_token'),
    user: null,
    publications: [],
    categories: [],
    kind: 'TODOS',
    search: '',
    favorites: []
  };

  const listeners = [];

  const subscribe = (listener) => {
    listeners.push(listener);
    return () => {
      listeners.splice(listeners.indexOf(listener), 1);
    };
  };

  const setState = (updates) => {
    Object.assign(state, updates);
    listeners.forEach((listener) => listener(state));
  };

  const getState = () => state;

  const setToken = (token) => {
    state.token = token;
    if (token) {
      localStorage.setItem('tejido_token', token);
    } else {
      localStorage.removeItem('tejido_token');
    }
  };

  const clearUser = () => {
    setToken(null);
    setState({ user: null });
  };

  return {
    state,
    getState,
    setState,
    setToken,
    clearUser,
    subscribe
  };
})();

window.STATE_STORE = STATE_STORE;
