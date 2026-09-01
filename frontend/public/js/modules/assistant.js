const TEJIDO_ASSISTANT = (() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const assistantAnswers = {
    'que-es': 'Soy Hilo, el asistente de TEJIDO. TEJIDO es una plataforma de descubrimiento territorial: ayuda a encontrar historias, eventos, talentos y oportunidades que están moviendo a Caucasia.',
    roles: 'En TEJIDO hay tres perfiles: ciudadano, gestor y administrador. El ciudadano explora, guarda y reporta. El gestor crea publicaciones. El administrador revisa, aprueba y modera contenidos.',
    publicar: 'Para publicar debes ingresar como gestor o administrador. Luego abre tu perfil y presiona Crear contenido. Puedes agregar título, resumen, lugar, fecha, enlace e imagen.',
    mapa: 'El mapa vivo sirve para ubicar eventos, historias, oportunidades y talentos del territorio. Selecciona un punto o una tarjeta para ver su información y abrir la ubicación exacta.',
    guardadas: 'Las guardadas son oportunidades que marcas con el corazón. Debes iniciar sesión para conservar tu selección personal.',
    oportunidades: 'Las oportunidades reúnen convocatorias, proyectos y opciones de participación para la comunidad.',
    eventos: 'La agenda muestra actividades del territorio: encuentros, mercados, festivales y espacios para participar.',
    talento: 'La sección Talento visibiliza personas, artistas, líderes, organizaciones e iniciativas que normalmente pasarían desapercibidas.',
    default: 'Cuéntame qué quieres hacer: encontrar un evento, ubicar un lugar, descubrir talento, revisar una oportunidad, publicar contenido o dejar una sugerencia.'
  };

  const assistantPoses = {
    saluda: '/images/hilo/hilo-saluda.png',
    senala: '/images/hilo/hilo-senala.png',
    lee: '/images/hilo/hilo-lee.png',
    piensa: '/images/hilo/hilo-piensa.png',
    explica: '/images/hilo/hilo-explica.png',
    celebra: '/images/hilo/hilo-celebra.png',
    sorprendido: '/images/hilo/hilo-sorprendido.png',
    descubre: '/images/hilo/hilo-descubre.png',
    teje: '/images/hilo/hilo-teje.png'
  };

  const assistantCardActions = {
    gente: { label: 'Conocer gente', pose: 'saluda', action: 'talento' },
    plan: { label: 'Encontrar un plan', pose: 'descubre', action: 'hoy' },
    feedback: { label: 'Sugerencias', pose: 'explica', action: 'sugerencia' },
    mapa: { label: 'Recorrer Caucasia', pose: 'senala', action: 'mapa' },
    oportunidades: { label: 'Convocatorias', pose: 'celebra', action: 'oportunidades' },
    buscar: { label: 'Buscar algo', pose: 'descubre', action: 'buscar' },
    ajustes: { label: 'Ajustes', pose: 'piensa', action: 'ajustes' },
    guardado: { label: 'Mis cosas', pose: 'lee', action: 'guardadas' },
    red: { label: 'Red social', pose: 'teje', action: 'red' }
  };

  let assistantBubbleTimer;
  let assistantContextTimer;
  let assistantMode = 'chat';

  function normalizeText(value = '') {
    return String(value).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  }

  function assistantPose(pose, message = '', duration = 4200) {
    const bubble = $('#assistantBubble');
    $$('[data-assistant-character]').forEach((character) => {
      if (!assistantPoses[pose]) return;
      character.src = assistantPoses[pose];
      character.classList.remove('is-changing');
      void character.offsetWidth;
      character.classList.add('is-changing');
    });
    if (!bubble || !message) return;
    bubble.textContent = message;
    bubble.classList.remove('is-hidden');
    clearTimeout(assistantBubbleTimer);
    assistantBubbleTimer = setTimeout(() => bubble.classList.add('is-hidden'), duration);
  }

  function assistantOpen() {
    const panel = $('#assistantPanel');
    const widget = $('#assistantWidget');
    const bubble = $('#assistantBubble');
    if (panel) panel.classList.remove('hidden');
    if (widget) widget.classList.add('assistant-open');
    if (bubble) bubble.classList.add('is-hidden');
    assistantPose('saluda');
    assistantClearScene();
    assistantShowGrid();
    assistantMode = 'chat';
    assistantResetInput();
  }

  function assistantClose(message = 'Aquí estaré cuando me necesites.') {
    const panel = $('#assistantPanel');
    const widget = $('#assistantWidget');
    if (panel) panel.classList.add('hidden');
    if (widget) widget.classList.remove('assistant-open');
    assistantPose('saluda', message, 3000);
  }

  function assistantResetInput() {
    const input = $('#assistantInput');
    const button = $('#assistantForm button');
    if (input) input.placeholder = 'Cuéntaselo a Hilo...';
    if (button) button.innerHTML = '<span aria-hidden="true">➜</span><span class="sr-only">Enviar</span>';
  }

  function assistantClearScene() {
    const grid = $('#assistantGrid');
    const content = $('#assistantContent');
    const pill = $('#assistantIntentPill');
    if (grid) grid.innerHTML = '';
    if (content) {
      const nodes = content.querySelectorAll('.assistant-body, .assistant-result-grid, .assistant-back');
      nodes.forEach((el) => el.remove());
    }
    if (pill) {
      pill.textContent = '';
      pill.classList.add('hidden');
    }
  }

  function assistantAddUserMessage(text) {
    const pill = $('#assistantIntentPill');
    if (pill) {
      pill.textContent = `Tú le dijiste a Hilo: “${text}”`;
      pill.classList.remove('hidden');
    }
  }

  function assistantShowGrid() {
    const grid = $('#assistantGrid');
    if (!grid) return;
    grid.innerHTML = '';

    const cards = [
      { key: 'gente', icon: '👥', label: 'Conocer gente', sub: 'Talentos locales' },
      { key: 'plan', icon: '📅', label: 'Encontrar un plan', sub: 'Eventos para hoy' },
      { key: 'feedback', icon: '📖', label: 'Sugerencias', sub: 'Dar feedback' },
      { key: 'mapa', icon: '📍', label: 'Recorrer Caucasia', sub: 'Explorar el mapa' },
      { key: 'oportunidades', icon: '📢', label: 'Convocatorias', sub: 'Ver oportunidades' },
      { key: 'buscar', icon: '🔍', label: 'Buscar algo', sub: 'Descubrir' },
      { key: 'ajustes', icon: '⚙️', label: 'Ajustes', sub: 'Configurar' },
      { key: 'guardado', icon: '📦', label: 'Mis cosas', sub: 'Ver guardado' },
      { key: 'red', icon: '🌐', label: 'Red social', sub: 'Conectar' }
    ];

    cards.forEach((item) => {
      const config = assistantCardActions[item.key];
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'hilo-card';
      button.setAttribute('role', 'listitem');
      button.dataset.action = item.key;
      button.innerHTML = `<span class="hilo-card-icon" aria-hidden="true">${item.icon}</span><span class="hilo-card-label">${item.label}</span><span class="hilo-card-sub">${item.sub}</span>`;
      button.addEventListener('mouseenter', () => assistantPose(config.pose));
      button.addEventListener('mouseleave', () => assistantPose('saluda'));
      button.addEventListener('focus', () => assistantPose(config.pose));
      button.addEventListener('blur', () => assistantPose('saluda'));
      button.onclick = () => assistantRunAction(config.action, item.label);
      grid.appendChild(button);
    });
  }

  function assistantAddBotMessage(text) {
    const content = $('#assistantContent');
    if (!content) return;
    let box = content.querySelector('.assistant-body');
    if (!box) {
      box = document.createElement('div');
      box.className = 'assistant-body';
      content.appendChild(box);
    }
    const paragraph = document.createElement('p');
    paragraph.className = 'hilo-message bot-message';
    paragraph.textContent = text;
    box.appendChild(paragraph);
    box.scrollTop = box.scrollHeight;
  }

  function assistantShowBack() {
    const content = $('#assistantContent');
    if (!content || content.querySelector('.assistant-back')) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'assistant-back';
    button.textContent = '← Elegir otra cosa';
    button.onclick = assistantHome;
    content.appendChild(button);
  }

  function assistantHome() {
    assistantMode = 'chat';
    assistantResetInput();
    assistantClearScene();
    assistantShowGrid();
    assistantPose('saluda');
  }

  function assistantResults(items) {
    const content = $('#assistantContent');
    if (!content) return;
    if (!items.length) {
      assistantAddBotMessage('No encontré resultados en este momento. Probemos otro camino.');
      assistantShowBack();
      return;
    }
    const container = document.createElement('div');
    container.className = 'assistant-result-grid';
    items.slice(0, 3).forEach((item) => {
      const button = document.createElement('button');
      button.className = 'assistant-result-card';
      button.dataset.assistantResult = item.id;
      button.innerHTML = `<b>${window.TEJIDO_UI.escapeHTML(item.title)}</b><small>${window.TEJIDO_UI.escapeHTML(item.location || item.kind || 'Caucasia')}</small><span>›</span>`;
      button.onclick = () => {
        assistantClose('Te abrí esta publicación.');
        if (window.TEJIDO_APP && typeof window.TEJIDO_APP.showDetail === 'function') {
          window.TEJIDO_APP.showDetail(Number(item.id));
        }
      };
      container.appendChild(button);
    });
    content.appendChild(container);
    assistantShowBack();
  }

  function assistantNavigate(hash, message) {
    assistantAddBotMessage(message);
    setTimeout(() => {
      location.hash = hash;
      assistantClose('Te traje hasta aquí. Sigue explorando.');
    }, 650);
  }

  function assistantRunAction(key, label = '') {
    assistantOpen();
    assistantClearScene();
    if (label) assistantAddUserMessage(label);
    assistantPose('descubre');

    if (key === 'hoy') {
      const events = typeof window.TEJIDO_APP?.upcomingEvents === 'function' ? window.TEJIDO_APP.upcomingEvents() : [];
      assistantAddBotMessage(events.length ? 'Estos son algunos eventos para participar:' : 'Todavía no hay eventos disponibles.');
      assistantPose('senala');
      assistantResults(events);
    } else if (key === 'oportunidades') {
      const items = (window.TEJIDO_APP?.state?.publications || []).filter((item) => item.kind === 'OPORTUNIDAD');
      assistantAddBotMessage(items.length ? 'Encontré estas oportunidades para ti:' : 'No hay oportunidades publicadas por ahora.');
      assistantPose('senala');
      assistantResults(items);
    } else if (key === 'talento') {
      const items = (window.TEJIDO_APP?.state?.publications || []).filter((item) => item.kind === 'TALENTO');
      assistantAddBotMessage(items.length ? 'Conoce estos talentos del territorio:' : 'Todavía no hay perfiles de talento publicados.');
      assistantPose('teje');
      assistantResults(items);
    } else if (key === 'mapa') {
      assistantPose('senala');
      assistantNavigate('#inicio', 'Voy a llevarte al mapa vivo de Caucasia.');
    } else if (key === 'sugerencia') {
      assistantMode = 'suggestion';
      const input = $('#assistantInput');
      if (input) input.placeholder = 'Escribe tu sugerencia...';
      const button = $('#assistantForm button');
      if (button) button.innerHTML = '<span aria-hidden="true">➜</span><span class="sr-only">Enviar sugerencia</span>';
      assistantAddBotMessage('Este es el buzón de atención de TEJIDO. Escribe tu sugerencia, felicitación o dificultad. Evita incluir contraseñas o información sensible.');
      assistantPose('explica');
      assistantShowBack();
    } else if (key === 'buscar') {
      assistantAddBotMessage('Escribe lo que buscas en el campo de abajo y lo encontraré entre los hilos de Caucasia.');
      assistantPose('descubre');
      $('#assistantInput')?.focus();
      assistantShowBack();
    } else if (key === 'ajustes') {
      assistantAddBotMessage('Los ajustes de usuario están disponibles en tu perfil. Abre el menú para configurar tu cuenta.');
      assistantPose('piensa');
      assistantShowBack();
    } else if (key === 'guardadas') {
      if (!window.TEJIDO_APP?.state?.user) {
        assistantAddBotMessage('Debes iniciar sesión para ver tus cosas guardadas.');
        assistantPose('explica');
        assistantShowBack();
        return;
      }
      location.hash = 'guardadas';
      assistantClose('Te traje a tus guardadas.');
    } else if (key === 'red') {
      assistantAddBotMessage('La red social de TEJIDO está en construcción. Pronto podrás conectar con la comunidad de Caucasia.');
      assistantPose('teje');
      assistantShowBack();
    }
  }

  async function assistantSendSuggestion(message) {
    try {
      assistantAddBotMessage('Estoy guardando tu mensaje en el buzón de TEJIDO…');
      assistantPose('teje');
      const result = await window.TEJIDO_APP.api('/api/suggestions', {
        method: 'POST',
        body: JSON.stringify({ message })
      });
      assistantMode = 'chat';
      assistantResetInput();
      assistantAddBotMessage(`Gracias por ayudar a mejorar TEJIDO. Tu mensaje quedó registrado con el número ${result.ticket}.`);
      assistantPose('celebra');
      assistantShowBack();
    } catch (error) {
      assistantAddBotMessage(error.message || 'No pude guardar la sugerencia. Inténtalo nuevamente.');
      assistantPose('sorprendido');
      assistantShowBack();
    }
  }

  function assistantReply(text) {
    const query = normalizeText(text);

    if (query.includes('salir') || query.includes('cerrar') || query === 'adios' || query === 'hasta luego') {
      return assistantClose('Conversación cerrada. Aquí estaré cuando quieras volver.');
    }
    if (query.includes('ver sugerencias') || query.includes('ver buzon') || query.includes('consultar buzon')) {
      return assistantShowSuggestionInbox();
    }
    if (query.includes('sugerencia') || query.includes('buzon') || query.includes('atencion')) {
      return assistantRunAction('sugerencia', text);
    }
    if (query.includes('que hay hoy') || query.includes('evento')) {
      return assistantRunAction('hoy', text);
    }
    if (query.includes('mapa') || query.includes('ubicacion')) {
      return assistantRunAction('mapa', text);
    }
    if (query.includes('oportun') || query.includes('convoc')) {
      return assistantRunAction('oportunidades', text);
    }
    if (query.includes('talento') || query.includes('artista')) {
      return assistantRunAction('talento', text);
    }
    if (query.includes('que es') || query.includes('tejido')) {
      assistantAddBotMessage(assistantAnswers['que-es']);
      assistantPose('explica');
      assistantShowBack();
      return;
    }
    if (query.includes('rol') || query.includes('admin') || query.includes('gestor') || query.includes('ciudadano')) {
      assistantAddBotMessage(assistantAnswers.roles);
      assistantPose('explica');
      assistantShowBack();
      return;
    }
    if (query.includes('public') || query.includes('crear') || query.includes('contenido') || query.includes('imagen')) {
      assistantAddBotMessage(assistantAnswers.publicar);
      assistantPose('teje');
      assistantShowBack();
      return;
    }
    if (query.includes('guard') || query.includes('favor')) {
      assistantAddBotMessage(assistantAnswers.guardadas);
      assistantPose('senala');
      assistantShowBack();
      return;
    }

    const found = (window.TEJIDO_APP?.state?.publications || []).find((p) =>
      normalizeText([p.title, p.summary, p.location, p.kind].join(' ')).includes(query)
    );

    if (found) {
      assistantAddBotMessage('Encontré algo relacionado con tu búsqueda:');
      assistantPose('descubre');
      assistantResults([found]);
      return;
    }

    assistantAddBotMessage(assistantAnswers.default);
    assistantPose('piensa');
    assistantShowGrid();
  }

  async function assistantShowSuggestionInbox() {
    if (window.TEJIDO_APP?.state?.user?.role !== 'ADMIN') {
      assistantAddBotMessage('El buzón recibido solo puede consultarlo un administrador. Cualquier persona sí puede enviar una sugerencia.');
      assistantPose('explica');
      assistantShowBack();
      return;
    }
    try {
      assistantPose('descubre', 'Consultando el buzón…', 1400);
      const items = await window.TEJIDO_APP.api('/api/admin/suggestions');
      if (!items.length) {
        assistantAddBotMessage('El buzón no tiene mensajes todavía.');
        assistantShowBack();
        return;
      }
      assistantAddBotMessage(`Encontré ${items.length} mensajes en el buzón. Estos son los más recientes:`);
      assistantPose('senala');
      const content = $('#assistantContent');
      const container = document.createElement('div');
      container.className = 'assistant-result-grid';
      items.slice(0, 5).forEach((item) => {
        const card = document.createElement('div');
        card.className = 'assistant-result-card';
        card.innerHTML = `<b>TEJ-${String(item.id).padStart(4, '0')} · ${window.TEJIDO_UI.escapeHTML(item.user_name || 'Visitante')}</b><small>${window.TEJIDO_UI.escapeHTML(item.message)}</small><span>✉</span>`;
        container.appendChild(card);
      });
      if (content) content.appendChild(container);
      assistantShowBack();
    } catch (error) {
      assistantAddBotMessage(error.message || 'No pude consultar el buzón.');
      assistantPose('sorprendido');
      assistantShowBack();
    }
  }

  function bind() {
    const panel = $('#assistantPanel');
    const toggle = $('#assistantToggle');
    const close = $('#assistantClose');
    const form = $('#assistantForm');
    const input = $('#assistantInput');
    const bubble = $('#assistantBubble');
    if (!panel || !toggle || !close || !form || !input) return;

    toggle.onclick = () => (panel.classList.contains('hidden') ? assistantOpen() : assistantClose());
    close.onclick = () => assistantClose();
    form.onsubmit = (event) => {
      event.preventDefault();
      const text = input.value.trim();
      if (!text) return;
      input.value = '';
      assistantAddUserMessage(text);
      if (assistantMode === 'suggestion') {
        assistantSendSuggestion(text);
        return;
      }
      assistantPose('piensa');
      setTimeout(() => assistantReply(text), 550);
    };

    $('#navHiloBtn')?.addEventListener('click', assistantOpen);
    $('#mapNavHiloBtn')?.addEventListener('click', assistantOpen);
    if (bubble) bubble.classList.add('is-hidden');

    clearTimeout(assistantContextTimer);
    assistantContextTimer = setTimeout(() => {
      const section = (location.hash || '#inicio').slice(1);
      const messages = {
        inicio: '¡Hola! Soy Hilo. ¿Qué quieres descubrir hoy en Caucasia?',
        explorar: 'Cuéntame qué te interesa y yo buscaré historias relacionadas.',
        mapa: '¿Buscas un lugar? Dime su nombre y te ayudaré a ubicarlo.',
        agenda: '¿Quieres un plan? Puedo mostrarte los próximos eventos.',
        oportunidades: '¿Buscas una convocatoria? Te mostraré las disponibles.',
        guardadas: 'Aquí puedes volver a las oportunidades que guardaste.',
        talento: '¿Quieres conocer artistas y creadores del territorio?'
      };
      const msg = messages[section] || messages.inicio;
      assistantPose('saluda', msg, 5600);
    }, 850);

    window.addEventListener('hashchange', () => {
      clearTimeout(assistantContextTimer);
      assistantContextTimer = setTimeout(() => {
        const section = (location.hash || '#inicio').slice(1);
        const messages = {
          inicio: '¡Hola! Soy Hilo. ¿Qué quieres descubrir hoy en Caucasia?',
          explorar: 'Cuéntame qué te interesa y yo buscaré historias relacionadas.',
          mapa: '¿Buscas un lugar? Dime su nombre y te ayudaré a ubicarlo.',
          agenda: '¿Quieres un plan? Puedo mostrarte los próximos eventos.',
          oportunidades: '¿Buscas una convocatoria? Te mostraré las disponibles.',
          guardadas: 'Aquí puedes volver a las oportunidades que guardaste.',
          talento: '¿Quieres conocer artistas y creadores del territorio?'
        };
        const msg = messages[section] || messages.inicio;
        assistantPose('saluda', msg, 5600);
      }, 320);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !panel.classList.contains('hidden')) {
        assistantClose();
      }
    });
  }

  return { bind };
})();

window.TEJIDO_ASSISTANT = TEJIDO_ASSISTANT;
