/**
 * API Service - Maneja todas las comunicaciones con el servidor
 */
const API_SERVICE = (() => {
  const makeRequest = async (path, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    // Obtener token del estado global si existe
    if (window.TEJIDO_APP?.state?.token) {
      headers.Authorization = 'Bearer ' + window.TEJIDO_APP.state.token;
    }

    try {
      const response = await fetch(path, { ...options, headers });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || 'No fue posible completar la acción');
      }

      return data;
    } catch (error) {
      throw error;
    }
  };

  return {
    get: (path) => makeRequest(path, { method: 'GET' }),
    post: (path, body) => makeRequest(path, { method: 'POST', body: JSON.stringify(body) }),
    put: (path, body) => makeRequest(path, { method: 'PUT', body: JSON.stringify(body) }),
    patch: (path, body) => makeRequest(path, { method: 'PATCH', body: JSON.stringify(body) }),
    delete: (path) => makeRequest(path, { method: 'DELETE' }),
    request: makeRequest
  };
})();

window.API_SERVICE = API_SERVICE;
