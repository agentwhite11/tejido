/**
 * AUTH.JS - Gestión de Autenticación y Sesión
 * 
 * Responsabilidades:
 * - Login y logout
 * - Gestión de tokens
 * - Renderizado de panel de usuario
 * - Validación de sesión
 */

const AUTH = {
  /**
   * Renderiza la información de sesión del usuario
   */
  renderSession() {
    const logged = !!STATE_STORE.getState().user;
    const loginBtn = $('#loginBtn');
    const userBtn = $('#userBtn');
    const mobileLoginBtn = $('#mobileLoginBtn');
    
    if (loginBtn) loginBtn.classList.toggle('hidden', logged);
    if (userBtn) userBtn.classList.toggle('hidden', !logged);
    if (mobileLoginBtn) mobileLoginBtn.textContent = logged ? 'Abrir mi perfil' : 'Ingresar a mi cuenta';
    
    if (!logged) {
      if (userBtn) userBtn.textContent = '';
      return;
    }
    
    const state = STATE_STORE.getState();
    const user = state.user;
    
    const configs = {
      ADMIN: {
        label: 'ADMINISTRADOR',
        className: 'admin',
        items: [
          'Moderar publicaciones pendientes',
          'Aprobar o rechazar contenido',
          'Consultar estadísticas y eliminar registros'
        ]
      },
      GESTOR: {
        label: 'GESTOR DE CONTENIDO',
        className: 'gestor',
        items: [
          'Crear y editar publicaciones propias',
          'Enviar borradores a revisión',
          'Consultar el estado de cada entrega'
        ]
      },
      CIUDADANO: {
        label: 'CIUDADANO',
        className: 'ciudadano',
        items: [
          'Guardar contenidos favoritos',
          'Consultar contenido publicado',
          'Reportar información incorrecta'
        ]
      }
    };
    
    const cfg = configs[user.role];
    if (userBtn) userBtn.textContent = user.name
      .split(' ')
      .map(x => x[0])
      .slice(0, 2)
      .join('');
    
    const summary = $('#userSummary');
    if (summary) {
      summary.innerHTML = `
        <span class="role-badge">${cfg.label}</span>
        <h2>Hola, ${HELPERS.escapeHTML(user.name.split(' ')[0])}.</h2>
        <p>${HELPERS.escapeHTML(user.email)}</p>
      `;
    }
    
    const roleCapabilities = $('#roleCapabilities');
    if (roleCapabilities) {
      roleCapabilities.className = 'role-capabilities ' + cfg.className;
      roleCapabilities.innerHTML = `
        <b>Permisos de este perfil</b>
        <ul>${cfg.items.map(x => '<li>' + x + '</li>').join('')}</ul>
      `;
    }
    
    const createBtn = $('#createBtn');
    if (createBtn) createBtn.classList.toggle('hidden', user.role === 'CIUDADANO');
  },

  /**
   * Manejador del formulario de login
   */
  async handleLogin(e) {
    e.preventDefault();
    
    try {
      const email = $('#loginEmail').value;
      const password = $('#loginPassword').value;
      
      const data = await API_SERVICE.post('/api/auth/login', {
        email,
        password
      });
      
      STATE_STORE.setToken(data.token);
      STATE_STORE.setState('user', data.user);
      localStorage.setItem('tejido_token', data.token);
      
      UI.closeAll();
      HELPERS.toast('Bienvenido a TEJIDO');
      
      // Recargar datos después de login
      await CORE_LOADER.loadInitialData();
      
      // Si había un favorito pendiente, procesarlo
      if (window.PENDING_FAVORITE_ID) {
        const id = window.PENDING_FAVORITE_ID;
        window.PENDING_FAVORITE_ID = null;
        await FAVORITES.toggleFavorite(id, document.createElement('button'));
      }
    } catch (e) {
      HELPERS.toast(e.message);
    }
  },

  /**
   * Manejador del logout
   */
  async handleLogout() {
    try {
      await API_SERVICE.post('/api/auth/logout', {});
    } catch (e) {
      // Ignorar errores en logout
    }
    
    localStorage.removeItem('tejido_token');
    STATE_STORE.setToken(null);
    STATE_STORE.setState('user', null);
    
    UI.closeAll();
    await CORE_LOADER.loadInitialData();
    HELPERS.toast('Sesión cerrada');
  },

  /**
   * Rellena automáticamente campos de demo
   */
  fillDemoCredentials(role) {
    const accounts = {
      admin: ['admin@tejido.co', 'Admin123!'],
      gestor: ['gestor@tejido.co', 'Gestor123!'],
      ciudadano: ['ciudadano@tejido.co', 'Ciudadano123!']
    };
    
    const [email, password] = accounts[role];
    const emailInput = $('#loginEmail');
    const passwordInput = $('#loginPassword');
    
    if (emailInput) emailInput.value = email;
    if (passwordInput) passwordInput.value = password;
  }
};

window.AUTH = AUTH;
