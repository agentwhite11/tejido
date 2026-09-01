/**
 * INTERACTIONS.JS - Gestión de Eventos e Interacciones
 * 
 * Responsabilidades:
 * - Eventos de página (búsqueda, filtros, navegación)
 * - Soporte (WhatsApp)
 * - Colaboración
 * - Formularios (newsletter)
 * - Atajos de teclado
 */

const INTERACTIONS = {
  /**
   * Vincula todos los eventos de interacción de la página
   */
  bindPageEvents() {
    // Filtros de mapa
    $$('[data-map-kind]').forEach(button => {
      button.onclick = () => {
        MAP_MODULE.mapKind = button.dataset.mapKind;
        $$('[data-map-kind]').forEach(item =>
          item.classList.toggle('active', item === button)
        );
        MAP_MODULE.renderMap();
      };
    });

    // Cerrar modales
    $$('[data-close]').forEach(button => {
      button.onclick = UI.closeAll;
    });

    $$('#mobileMenu a').forEach(link => {
      link.onclick = UI.closeAll;
    });

    const overlay = $('#overlay');
    if (overlay) overlay.onclick = UI.closeAll;

    // Botones de navegación
    const menuBtn = $('#menuBtn');
    if (menuBtn) menuBtn.onclick = () => UI.openModal('#mobileMenu');

    const mobileLoginBtn = $('#mobileLoginBtn');
    if (mobileLoginBtn) {
      mobileLoginBtn.onclick = () => {
        UI.closeAll();
        const state = STATE_STORE.getState();
        state.user ? CONTENT.openDrawer() : UI.openModal('#loginModal');
      };
    }

    const loginBtn = $('#loginBtn');
    if (loginBtn) loginBtn.onclick = () => UI.openModal('#loginModal');

    const userBtn = $('#userBtn');
    if (userBtn) userBtn.onclick = () => CONTENT.openDrawer();

    // Formulario de login
    const loginForm = $('#loginForm');
    if (loginForm) loginForm.onsubmit = e => AUTH.handleLogin(e);

    const logoutBtn = $('#logoutBtn');
    if (logoutBtn) logoutBtn.onclick = () => AUTH.handleLogout();

    // Editor
    const createBtn = $('#createBtn');
    if (createBtn) createBtn.onclick = () => EDITOR.newItem();

    const editorForm = $('#editorForm');
    if (editorForm) editorForm.onsubmit = e => EDITOR.saveItem(e);

    const addGalleryImage = $('#addGalleryImage');
    if (addGalleryImage) {
      addGalleryImage.onclick = () => EDITOR.addGalleryField();
    }

    const editKind = $('#editKind');
    if (editKind) {
      editKind.onchange = () =>
        EDITOR.renderCategoryOptions($('#editKind').value);
    }

    // Búsqueda
    const searchToggle = $('#searchToggle');
    if (searchToggle) {
      searchToggle.onclick = () => {
        const searchInput = $('#searchInput');
        if (searchInput) searchInput.focus();
        location.hash = 'explorar';
      };
    }

    const searchInput = $('#searchInput');
    if (searchInput) {
      searchInput.oninput = event => {
        STATE_STORE.setState('search', event.target.value);
        PUBLICATIONS_COMPONENT.renderPublications();
      };
    }

    // Filtros por categoría
    $$('.chip').forEach(button => {
      button.onclick = () => {
        $$('.chip').forEach(item => item.classList.remove('active'));
        button.classList.add('active');
        STATE_STORE.setState('kind', button.dataset.kind);
        PUBLICATIONS_COMPONENT.renderPublications();
      };
    });

    $$('[data-filter]').forEach(link => {
      link.onclick = () => {
        STATE_STORE.setState('kind', link.dataset.filter);
        $$('.chip').forEach(item =>
          item.classList.toggle('active', item.dataset.kind === STATE_STORE.getState().kind)
        );
        setTimeout(() => PUBLICATIONS_COMPONENT.renderPublications(), 0);
      };
    });

    // Botón aleatorio
    const randomBtn = $('#randomBtn');
    if (randomBtn) {
      randomBtn.onclick = () => {
        const state = STATE_STORE.getState();
        const items = state.publications;
        if (items.length)
          DETAIL.showDetail(
            items[Math.floor(Math.random() * items.length)].id
          );
      };
    }

    // Cuentas de demo
    $$('[data-demo]').forEach(button => {
      button.onclick = () => {
        const accounts = {
          admin: ['admin@tejido.co', 'Admin123!'],
          gestor: ['gestor@tejido.co', 'Gestor123!'],
          ciudadano: ['ciudadano@tejido.co', 'Ciudadano123!']
        };
        const [email, password] = accounts[button.dataset.demo];
        const emailInput = $('#loginEmail');
        const passwordInput = $('#loginPassword');
        if (emailInput) emailInput.value = email;
        if (passwordInput) passwordInput.value = password;
      };
    });

    // Newsletter
    const newsletterForm = $('#newsletterForm');
    if (newsletterForm) {
      newsletterForm.onsubmit = event => {
        event.preventDefault();
        HELPERS.toast('El boletín estará disponible en una próxima versión.');
      };
    }

    // Soporte (WhatsApp)
    this.setupSupportButtons();

    // Colaboración
    this.setupCollaborationButtons();

    // Tecla Escape para cerrar
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') UI.closeAll();
    });

    // Cambio de hash
    window.addEventListener('hashchange', () => DETAIL.handleSharedRoute());
  },

  /**
   * Configura botones de soporte (WhatsApp)
   */
  setupSupportButtons() {
    let selectedAmount = 5;
    const supportBase = 'https://wa.me/573007378306?text=';

    function updateSupportLink() {
      const msg = `Hola, quiero apoyar TEJIDO con $${selectedAmount}`;
      const supportBtn = $('#supportBtn');
      if (supportBtn) supportBtn.href = supportBase + encodeURIComponent(msg);
    }

    $$('.amount-btn').forEach(btn => {
      btn.onclick = () => {
        $$('.amount-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selectedAmount = +btn.dataset.amount;
        updateSupportLink();

        try {
          API_SERVICE.post('/api/support', {
            name: 'Anónimo',
            amount: selectedAmount,
            method: 'whatsapp'
          });
        } catch (e) {
          // Ignorar errores
        }
      };
    });

    updateSupportLink();
  },

  /**
   * Configura botones de colaboración
   */
  setupCollaborationButtons() {
    $$('.collab-btn').forEach(btn => {
      btn.onclick = () => {
        try {
          API_SERVICE.post('/api/collaborate', {
            name: 'Desde WhatsApp',
            email: 'whatsapp@tejido.co',
            role: 'colaborador',
            message: 'Postulación desde el sitio web'
          });
        } catch (e) {
          // Ignorar errores
        }
      };
    });
  }
};

window.INTERACTIONS = INTERACTIONS;
