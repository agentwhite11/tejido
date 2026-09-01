/**
 * CONTENT.JS - Gestión del Panel de Contenido del Usuario
 * 
 * Responsabilidades:
 * - Abrir drawer de usuario
 * - Mostrar publicaciones propias
 * - Panel de administración (moderación)
 * - Estadísticas de admin
 * - Acciones de ciudadano (guardadas)
 */

const CONTENT = {
  /**
   * Abre el drawer/panel de contenido del usuario
   */
  async openDrawer() {
    const state = STATE_STORE.getState();
    
    if (!state.user) {
      UI.openModal('#loginModal');
      return;
    }

    UI.openModal('#userDrawer');
    
    const adminStats = $('#adminStats');
    if (adminStats) adminStats.classList.add('hidden');

    const role = state.user.role;

    if (role === 'CIUDADANO') {
      this.renderCitizenView();
      return;
    }

    try {
      this.renderCreatorView();
    } catch (e) {
      HELPERS.toast(e.message);
    }
  },

  /**
   * Renderiza vista para ciudadanos
   */
  renderCitizenView() {
    const state = STATE_STORE.getState();
    const saved = state.publications.filter(p => p.favorite);

    const panelTitle = $('#panelTitle');
    if (panelTitle) panelTitle.textContent = 'Mis contenidos guardados';

    const panelHelp = $('#panelHelp');
    if (panelHelp)
      panelHelp.textContent =
        'Aquí puedes consultar tu selección personal y reportar información incorrecta.';

    const myContent = $('#myContent');
    if (myContent) {
      myContent.innerHTML = saved.length
        ? saved
            .map(
              p => `
        <div class="my-item citizen-favorite">
          <div>
            <b>${HELPERS.escapeHTML(p.title)}</b>
            <small>${HELPERS.escapeHTML(p.location || 'Caucasia')}</small>
          </div>
          <div class="my-actions">
            <button data-citizen-open="${p.id}">Abrir</button>
            <button data-citizen-remove="${p.id}">Quitar</button>
          </div>
        </div>
      `
            )
            .join('')
        : '<div class="empty-panel">No tienes contenidos guardados todavía.</div>';
    }

    $$('[data-citizen-open]').forEach(b => {
      b.onclick = () => DETAIL.showDetail(+b.dataset.citizenOpen);
    });
    $$('[data-citizen-remove]').forEach(b => {
      b.onclick = async () => {
        await FAVORITES.toggleFavorite(+b.dataset.citizenRemove, b);
        this.openDrawer();
      };
    });
  },

  /**
   * Renderiza vista para gestores y admins
   */
  async renderCreatorView() {
    const state = STATE_STORE.getState();
    const admin = state.user.role === 'ADMIN';
    let items;

    if (admin) {
      const [review, own] = await Promise.all([
        API_SERVICE.get('/api/publications?status=REVIEW'),
        API_SERVICE.get('/api/publications?mine=1')
      ]);
      items = [
        ...review,
        ...own.filter(
          p =>
            ['DRAFT', 'REJECTED'].includes(p.status) &&
            !review.some(r => r.id === p.id)
        )
      ];
    } else {
      items = await API_SERVICE.get('/api/publications?mine=1');
    }

    const panelTitle = $('#panelTitle');
    if (panelTitle)
      panelTitle.textContent = admin
        ? 'Moderación y mis borradores'
        : 'Mis publicaciones';

    const panelHelp = $('#panelHelp');
    if (panelHelp)
      panelHelp.textContent = admin
        ? 'Aprueba o rechaza lo enviado por gestores y continúa tus propios borradores.'
        : 'Crea borradores, edítalos y envíalos al administrador para revisión.';

    const myContent = $('#myContent');
    if (myContent) {
      myContent.innerHTML = items.length
        ? items
            .map(p => {
              const own = p.author_id === state.user.id;
              const editable =
                ['DRAFT', 'REJECTED'].includes(p.status) && (!admin || own);
              const reviewable = admin && p.status === 'REVIEW';

              return `
          <div class="my-item">
            <div class="my-item-top">
              <b>${HELPERS.escapeHTML(p.title)}</b>
              <span class="status">${STATUS_LABELS[p.status]}</span>
            </div>
            ${
              p.moderation_note
                ? '<small>' + HELPERS.escapeHTML(p.moderation_note) + '</small>'
                : ''
            }
            <div class="my-actions">
              ${
                editable
                  ? `
                <button data-edit="${p.id}">Editar</button>
                <button data-submit="${p.id}">Enviar a revisión</button>
              `
                  : ''
              }
              ${
                reviewable
                  ? `
                <button class="approve" data-approve="${p.id}">Aprobar</button>
                <button class="reject" data-reject="${p.id}">Rechazar</button>
              `
                  : ''
              }
              <button data-delete="${p.id}">Eliminar</button>
            </div>
          </div>
        `;
            })
            .join('')
        : `<div class="empty-panel">${admin ? 'No hay contenidos pendientes ni borradores propios.' : 'Aún no has creado contenido.'}</div>`;
    }

    this.bindContentActions(items);

    // Mostrar estadísticas de admin
    if (admin) {
      try {
        const stats = await API_SERVICE.get('/api/admin/stats');
        const adminStats = $('#adminStats');
        if (adminStats) {
          adminStats.classList.remove('hidden');
          adminStats.innerHTML = Object.entries({
            Publicados: stats.published,
            'Por revisar': stats.pending,
            Usuarios: stats.users,
            Reportes: stats.reports
          })
            .map(
              ([k, v]) =>
                `<div class="stat"><b>${v}</b><span>${k}</span></div>`
            )
            .join('');
        }
      } catch (e) {
        // Ignorar errores de estadísticas
      }
    }
  },

  /**
   * Vincula eventos de acciones de contenido
   */
  bindContentActions(items) {
    $$('[data-edit]').forEach(b => {
      b.onclick = () => {
        const item = items.find(x => x.id == b.dataset.edit);
        if (item) EDITOR.editItem(item);
      };
    });

    $$('[data-submit]').forEach(b => {
      b.onclick = () => EDITOR.submitItem(+b.dataset.submit);
    });

    $$('[data-approve]').forEach(b => {
      b.onclick = () => EDITOR.moderate(+b.dataset.approve, 'PUBLISHED');
    });

    $$('[data-reject]').forEach(b => {
      b.onclick = () => {
        const note = prompt('Motivo del rechazo:');
        if (note) EDITOR.moderate(+b.dataset.reject, 'REJECTED', note);
      };
    });

    $$('[data-delete]').forEach(b => {
      b.onclick = () => EDITOR.deleteItem(+b.dataset.delete);
    });
  }
};

window.CONTENT = CONTENT;
