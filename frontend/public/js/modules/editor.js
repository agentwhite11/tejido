/**
 * EDITOR.JS - Editor de Publicaciones
 * 
 * Responsabilidades:
 * - Crear nuevas publicaciones
 * - Editar publicaciones existentes
 * - Gestión de galería de imágenes
 * - Envío a revisión y moderación
 * - Eliminación de contenido
 */

const EDITOR = {
  // Estado local del editor
  galleryFieldIndex: 0,

  /**
   * Abre el modal de creación de contenido
   */
  newItem() {
    UI.closeAll();

    const editorTitle = $('#editorTitle');
    if (editorTitle) editorTitle.textContent = 'Crear contenido';

    const editorForm = $('#editorForm');
    if (editorForm) editorForm.reset();

    const editId = $('#editId');
    if (editId) editId.value = '';

    const editImage = $('#editImage');
    if (editImage) editImage.value = '';

    const editKind = $('#editKind');
    if (editKind) editKind.value = 'HISTORIA';

    this.renderCategoryOptions('HISTORIA');

    const editLocation = $('#editLocation');
    if (editLocation) editLocation.value = 'Caucasia';

    this.clearGalleryFields();
    UI.openModal('#editorModal');
  },

  /**
   * Abre editor para editar una publicación existente
   */
  async editItem(pub) {
    UI.closeAll();

    const editorTitle = $('#editorTitle');
    if (editorTitle) editorTitle.textContent = 'Editar contenido';

    const editId = $('#editId');
    if (editId) editId.value = pub.id;

    const editKind = $('#editKind');
    if (editKind) editKind.value = pub.kind;

    this.renderCategoryOptions(pub.kind, pub.category_id);

    const editTitle = $('#editTitle');
    if (editTitle) editTitle.value = pub.title;

    const editSummary = $('#editSummary');
    if (editSummary) editSummary.value = pub.summary;

    const editContent = $('#editContent');
    if (editContent) editContent.value = pub.content;

    const editLocation = $('#editLocation');
    if (editLocation) editLocation.value = pub.location || '';

    const editDate = $('#editDate');
    if (editDate) editDate.value = HELPERS.dateTimeInput(pub.start_date);

    const editEndDate = $('#editEndDate');
    if (editEndDate)
      editEndDate.value = HELPERS.dateTimeInput(pub.end_date);

    const editLink = $('#editLink');
    if (editLink) editLink.value = pub.link || '';

    const editImage = $('#editImage');
    if (editImage)
      editImage.value = pub.image?.startsWith('http') ? pub.image : '';

    UI.openModal('#editorModal');
    await this.loadGalleryImages(pub.id);
  },

  /**
   * Renderiza opciones de categoría según tipo
   */
  renderCategoryOptions(kind, selectedId = null) {
    const state = STATE_STORE.getState();
    const options = state.categories.filter(c => c.type === kind);
    const editCategory = $('#editCategory');
    
    if (editCategory) {
      editCategory.innerHTML = options
        .map(
          c =>
            `<option value="${c.id}" ${c.id == selectedId ? 'selected' : ''}>${HELPERS.escapeHTML(
              c.name
            )}</option>`
        )
        .join('');
    }
  },

  /**
   * Carga imágenes de galería existentes
   */
  async loadGalleryImages(publicationId) {
    this.clearGalleryFields();
    if (!publicationId) return;

    try {
      const images = await API_SERVICE.get(
        '/api/publications/' + publicationId + '/images'
      );
      if (Array.isArray(images)) {
        images.sort((a, b) => (a.position || 0) - (b.position || 0));
        images.forEach(img =>
          this.addGalleryField(
            img.url,
            img.alt_text || '',
            img.caption || '',
            String(img.id)
          )
        );
      }
    } catch (e) {
      // Ignorar si no hay galería
    }
  },

  /**
   * Agrega un campo de imagen a la galería
   */
  addGalleryField(url = '', alt = '', caption = '', imageId = '') {
    const container = $('#galleryImageFields');
    if (!container) return;

    const idx = this.galleryFieldIndex++;
    const field = document.createElement('div');
    field.className = 'gallery-field';
    field.dataset.imageId = imageId;

    field.innerHTML = `
      <div class="gallery-field-header">
        <span class="gallery-field-number">${container.children.length + 1}</span>
        <button type="button" class="gallery-remove" title="Quitar imagen">×</button>
      </div>
      <label>
        URL de la imagen
        <input type="url" class="gallery-url" value="${HELPERS.escapeHTML(
          url
        )}" placeholder="https://ejemplo.com/imagen.jpg">
      </label>
      <label>
        Texto alternativo
        <input class="gallery-alt" value="${HELPERS.escapeHTML(
          alt
        )}" maxlength="250" placeholder="Describe la imagen">
      </label>
      <label>
        Pie de foto
        <input class="gallery-caption" value="${HELPERS.escapeHTML(
          caption
        )}" maxlength="300" placeholder="Crédito o descripción">
      </label>
    `;

    container.appendChild(field);

    const removeBtn = field.querySelector('.gallery-remove');
    if (removeBtn) {
      removeBtn.onclick = () => {
        field.remove();
        this.renumberGalleryFields();
      };
    }

    this.renumberGalleryFields();
    return field;
  },

  /**
   * Renumera los campos de galería
   */
  renumberGalleryFields() {
    const fields = $$('#galleryImageFields .gallery-field');
    fields.forEach((f, i) => {
      const num = f.querySelector('.gallery-field-number');
      if (num) num.textContent = i + 1;
    });
  },

  /**
   * Limpia los campos de galería
   */
  clearGalleryFields() {
    const container = $('#galleryImageFields');
    if (container) container.innerHTML = '';
    this.galleryFieldIndex = 0;
  },

  /**
   * Obtiene datos de galería del formulario
   */
  getGalleryFieldData() {
    return $$('#galleryImageFields .gallery-field')
      .map(field => ({
        imageId: field.dataset.imageId || null,
        url: (field.querySelector('.gallery-url')?.value || '').trim(),
        alt_text: (field.querySelector('.gallery-alt')?.value || '').trim(),
        caption: (field.querySelector('.gallery-caption')?.value || '').trim()
      }))
      .filter(item => item.url);
  },

  /**
   * Guarda una publicación (nueva o editada)
   */
  async saveItem(e) {
    e.preventDefault();

    const id = $('#editId').value;
    const galleryData = this.getGalleryFieldData();
    const coverImage = galleryData.length > 0
      ? galleryData[0].url
      : ($('#editImage').value || null);

    const payload = {
      kind: $('#editKind').value,
      category_id: +$('#editCategory').value,
      title: $('#editTitle').value,
      summary: $('#editSummary').value,
      content: $('#editContent').value,
      location: $('#editLocation').value,
      start_date: $('#editDate').value || null,
      end_date: $('#editEndDate').value || null,
      link: $('#editLink').value || null,
      image: coverImage
    };

    try {
      const result = await API_SERVICE[id ? 'put' : 'post'](
        '/api/publications' + (id ? '/' + id : ''),
        payload
      );

      const pubId = id || result.id;

      // Sincronizar imágenes de galería
      if (pubId && galleryData.length > 0) {
        let existingImages = [];
        if (id) {
          try {
            existingImages = await API_SERVICE.get(
              '/api/publications/' + pubId + '/images'
            );
          } catch (e) {
            existingImages = [];
          }
        }

        const existingIds = new Set(
          (existingImages || []).map(i => String(i.id))
        );
        for (let i = 0; i < galleryData.length; i++) {
          const f = galleryData[i];
          if (!f.imageId || !existingIds.has(f.imageId)) {
            try {
              await API_SERVICE.post(
                '/api/publications/' + pubId + '/images',
                {
                  url: f.url,
                  alt_text: f.alt_text,
                  caption: f.caption,
                  position: i
                }
              );
            } catch (imgErr) {
              // Ignorar errores de imagen
            }
          }
        }
      }

      UI.closeAll();
      HELPERS.toast(id ? 'Contenido actualizado' : 'Borrador creado');
      await CORE_LOADER.loadInitialData();
      await CONTENT.openDrawer();
    } catch (e) {
      HELPERS.toast(e.message);
    }
  },

  /**
   * Envía una publicación a revisión
   */
  async submitItem(id) {
    try {
      await API_SERVICE.post('/api/publications/' + id + '/submit', {});
      HELPERS.toast('Enviado a revisión');
      await CORE_LOADER.loadInitialData();
      await CONTENT.openDrawer();
    } catch (e) {
      HELPERS.toast(e.message);
    }
  },

  /**
   * Modera una publicación (aprueba/rechaza)
   */
  async moderate(id, status, note = '') {
    try {
      await API_SERVICE.patch('/api/publications/' + id + '/status', {
        status,
        note
      });
      HELPERS.toast(
        status === 'PUBLISHED'
          ? 'Contenido aprobado y publicado'
          : 'Contenido rechazado con observación'
      );
      await CORE_LOADER.loadInitialData();
      await CONTENT.openDrawer();
    } catch (e) {
      HELPERS.toast(e.message);
    }
  },

  /**
   * Elimina una publicación
   */
  async deleteItem(id) {
    if (!confirm('¿Eliminar este contenido?')) return;

    try {
      await API_SERVICE.delete('/api/publications/' + id, {});
      HELPERS.toast('Contenido eliminado');
      await CORE_LOADER.loadInitialData();
      await CONTENT.openDrawer();
    } catch (e) {
      HELPERS.toast(e.message);
    }
  }
};

window.EDITOR = EDITOR;
