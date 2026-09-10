/**
 * HILOASSISTANT.JSX — Asistente Virtual con Personalidad
 *
 * Hilo es el guía virtual de TEJIDO. No es solo un botón — es un compañero
 * que reacciona a lo que haces en la plataforma.
 *
 * Características de personalidad:
 * - Cambia de pose según el contexto y las acciones del usuario
 * - Saluda según la hora del día ("Buenos días", "Buenas tardes")
 * - Celebra cuando el usuario comparte contenido (confeti)
 * - Se sorprende al descubrir cosas nuevas
 * - Se pone a pensar cuando no encuentra algo
 * - Reacciona a la navegación entre pantallas
 *
 * Poses de Hilo (imágenes PNG en /images/hilo/):
 * - saluda: saludo inicial
 * - senala: señalando algo
 * - lee: leyendo
 * - piensa: pensando
 * - explica: explicando
 * - celebra: celebrando
 * - sorprendido: sorpresa
 * - descubre: descubriendo algo
 * - teje: tejiendo (construyendo)
 *
 * Parte de la FASE 4 del plan de magia.
 */

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Acciones disponibles para Hilo.
 * Cada acción tiene: key, emoji, label, sublabel, navegación, pose de Hilo
 */
const OPTIONS = [
  ['gente', '\uD83D\uDC65', 'Conocer gente', 'Talentos locales', 'talento', 'hilo-saluda.png'],
  ['plan', '\uD83D\uDCC5', 'Encontrar un plan', 'Eventos para hoy', 'agenda', 'hilo-descubre.png'],
  ['feedback', '\uD83D\uDCD6', 'Sugerencias', 'Dar feedback', 'sugerencia', 'hilo-explica.png'],
  ['mapa', '\uD83D\uDCCD', 'Recorrer Caucasia', 'Explorar el mapa', 'mapa', 'hilo-senala.png'],
  ['oportunidades', '\uD83D\uDCE2', 'Convocatorias', 'Ver oportunidades', 'oportunidades', 'hilo-celebra.png'],
  ['buscar', '\uD83D\uDD0D', 'Buscar algo', 'Descubrir', 'buscar', 'hilo-descubre.png'],
  ['ajustes', '\u2699\uFE0F', 'Ajustes', 'Configurar', 'ajustes', 'hilo-piensa.png'],
  ['guardado', '\uD83D\uDCE6', 'Mis cosas', 'Ver guardado', 'guardadas', 'hilo-lee.png'],
  ['red', '\uD83C\uDF10', 'Red social', 'Conectar', 'red', 'hilo-teje.png'],
];

/**
 * Respuestas estáticas de Hilo para acciones que no navegan.
 */
const ANSWERS = {
  sugerencia: 'Este es el buzón de atención de TEJIDO. Escribe una sugerencia, felicitación o dificultad.',
  buscar: 'Escribe lo que buscas en el campo de abajo y lo encontraré entre los hilos de Caucasia.',
  ajustes: 'Los ajustes de usuario estarán disponibles en tu perfil.',
  red: 'La red social de TEJIDO está en construcción. Pronto podrás conectar con la comunidad.',
};

/**
 * Saludos de Hilo según la hora del día.
 */
function getGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return '¡Buenos días! Soy Hilo. ';
  if (hour >= 12 && hour < 18) return '¡Buenas tardes! Soy Hilo. ';
  return '¡Buenas noches! Soy Hilo. ';
}

/**
 * Mensajes reactivos de Hilo según la acción del usuario.
 * Se usan para dar personalidad a las interacciones.
 */
const REACTIVE_MESSAGES = {
  share: [
    '¡Genial! Compartir es tejer comunidad. +10 puntos para ti.',
    '¡Eso! Cada share une más al Bajo Cauca.',
    'Compartido. La gente se entera gracias a ti.',
  ],
  favorite: [
    '¡Buena elección! Lo guardo en tu hilo personal.',
    'Guardado. Ese contenido es especial.',
    'Added a tu colección. No se te va a olvidar.',
  ],
  explore: [
    'Descubriendo el territorio... me encanta.',
    'Cada rincón de Caucasia tiene algo que contar.',
    'Sigues el río de las historias.',
  ],
  idle: [
    '¿Sigues ahí? Puedo contarte algo del Bajo Cauca.',
    'Hey, no te vayas sin explorar todo.',
    'Hay mucho por descubrir aún.',
  ],
};

/**
 * Elige un mensaje aleatorio de una lista.
 */
function pickRandom(messages) {
  return messages[Math.floor(Math.random() * messages.length)];
}

/**
 * Genera confetti simple usando CSS animations (sin librería externa).
 * Crea partículas de colores que caen y desaparecen.
 */
function triggerConfetti() {
  const container = document.createElement('div');
  container.className = 'hilo-confetti-container';
  container.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;';

  const colors = ['#d4a843', '#1d8fa3', '#d85b36', '#8a4f7d', '#75b79b', '#f4b942'];

  for (let i = 0; i < 30; i++) {
    const particle = document.createElement('div');
    const color = colors[Math.floor(Math.random() * colors.length)];
    const left = Math.random() * 100;
    const delay = Math.random() * 0.5;
    const size = 6 + Math.random() * 8;

    particle.style.cssText = `
      position:absolute;
      top:-20px;
      left:${left}%;
      width:${size}px;
      height:${size}px;
      background:${color};
      border-radius:${Math.random() > 0.5 ? '50%' : '2px'};
      animation:hiloConfettiFall ${1.5 + Math.random()}s ease-out ${delay}s forwards;
    `;
    container.appendChild(particle);
  }

  document.body.appendChild(container);
  // Limpiar después de la animación
  setTimeout(() => container.remove(), 3000);
}

export default function HiloAssistant({ publications = [] }) {
  /** Si el panel de Hilo está abierto */
  const [open, setOpen] = useState(false);
  /** Pose actual de Hilo (imagen PNG) */
  const [pose, setPose] = useState('hilo-saluda.png');
  /** Mensaje actual de Hilo */
  const [message, setMessage] = useState(`${getGreeting()}¿Te ayudo a descubrir Caucasia?`);
  /** Texto del input de búsqueda */
  const [input, setInput] = useState('');
  /** Historial de conversación */
  const [conversation, setConversation] = useState([]);
  /** Contador de interacciones del usuario */
  const [interactions, setInteractions] = useState(0);
  /** Timestamp de la última interacción (para detectar idle) */
  const lastInteractionRef = useRef(Date.now());
  /** Flag para saber si Hilo ya habló en idle */
  const idleMessageRef = useRef(false);

  /**
   * Detecta inactividad del usuario y Hilo reacciona.
   * Si el usuario no hace nada por 60 segundos, Hilo dice algo.
   */
  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Date.now() - lastInteractionRef.current;
      if (elapsed > 60000 && !idleMessageRef.current && !open) {
        setMessage(pickRandom(REACTIVE_MESSAGES.idle));
        setPose('hilo-piensa.png');
        idleMessageRef.current = true;
      }
    }, 10000); // Revisar cada 10 segundos

    return () => clearInterval(interval);
  }, [open]);

  /**
   * Registra una interacción del usuario (resetea el timer de idle).
   */
  const recordInteraction = useCallback(() => {
    lastInteractionRef.current = Date.now();
    idleMessageRef.current = false;
    setInteractions((prev) => prev + 1);
  }, []);

  /**
   * Cierra el panel de Hilo.
   */
  function close() {
    setOpen(false);
    setPose('hilo-saluda.png');
    setMessage('Aquí estaré cuando me necesites.');
  }

  /**
   * Ejecuta una acción seleccionada por el usuario.
   * Navega a la pantalla correspondiente o muestra una respuesta.
   */
  function runAction(action, label, nextPose) {
    recordInteraction();
    setPose(nextPose);
    setConversation([{ type: 'user', text: label }]);

    // Acciones que navegan a otra pantalla
    if (['mapa', 'agenda', 'oportunidades', 'talento', 'guardadas'].includes(action)) {
      setMessage('Te traje hasta aquí. Sigue explorando.');
      window.location.hash = action;
      setOpen(false);
      return;
    }

    // Feedback: confeti + pose especial
    if (action === 'sugerencia') {
      setPose('hilo-celebra.png');
      triggerConfetti();
    }

    setMessage(ANSWERS[action] || 'Cuéntame qué quieres hacer en TEJIDO.');
  }

  /**
   * Maneja el envío de un mensaje de búsqueda.
   * Busca en las publicaciones y reacciona con la pose correspondiente.
   */
  function sendMessage(event) {
    event.preventDefault();
    const text = input.trim();
    if (!text) return;

    recordInteraction();
    const normalized = text.toLowerCase();

    // Buscar coincidencia en publicaciones
    const found = publications.find((item) =>
      [item.title, item.summary, item.location, item.kind]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(normalized)
    );

    // Agregar mensaje del usuario al historial
    setConversation((current) => [...current, { type: 'user', text }]);

    if (found) {
      // Encontró: Hilo se sorprende y muestra confeti
      setPose('hilo-sorprendido.png');
      setMessage(`¡Encontré algo! "${found.title}" — ${found.location || 'Caucasia'}`);
      // Breve confeti de celebración
      setTimeout(() => {
        setPose('hilo-descubre.png');
        triggerConfetti();
      }, 800);
    } else {
      // No encontró: Hilo se pone a pensar
      setPose('hilo-piensa.png');
      setMessage('No encontré nada con eso. Prueba con otro nombre, evento o lugar del Bajo Cauca.');
    }

    setInput('');
  }

  /**
   * Maneja hover sobre las tarjetas de acción.
   * Hilo cambia de pose según la tarjeta.
   */
  function handleCardHover(nextPose) {
    setPose(nextPose);
  }

  return (
    <section
      className={open ? 'virtual-assistant assistant-open' : 'virtual-assistant'}
      aria-label="Asistente virtual de TEJIDO"
    >
      {/* Burbuja de mensaje cuando el panel está cerrado */}
      {!open && (
        <div className="assistant-bubble">{message}</div>
      )}

      {/* Botón flotante de Hilo */}
      {!open && (
        <button
          className="assistant-toggle"
          type="button"
          onClick={() => {
            setOpen(true);
            setMessage('');
            recordInteraction();
          }}
          aria-label="Hablar con Hilo"
        >
          <img
            className="assistant-character-img"
            src={`/images/hilo/${pose}`}
            alt="Hilo, asistente virtual de TEJIDO"
          />
          <span className="assistant-name">Habla con Hilo</span>
        </button>
      )}

      {/* Panel de conversación abierto */}
      {open && (
        <aside className="assistant-panel" role="dialog" aria-label="Conversación con Hilo">
          {/* Barra superior */}
          <div className="hilo-toolbar">
            <span>HILO ESTÁ CONTIGO | Una conversación para descubrir Caucasia</span>
            <button type="button" onClick={close} aria-label="Cerrar asistente">
              &times;
            </button>
          </div>

          {/* Escena del avatar con saludo contextual */}
          <div className="hilo-scene-new">
            <div className="hilo-avatar-wrapper">
              <img
                className="hilo-avatar"
                src={`/images/hilo/${pose}`}
                alt="Hilo, guía de TEJIDO"
              />
            </div>
            <p className="hilo-greeting">
              {getGreeting()}Cuéntame qué quieres hacer hoy en Caucasia.
            </p>
          </div>

          {/* Área de contenido: mensajes + tarjetas de acción */}
          <div className="hilo-content">
            {/* Historial de conversación */}
            {conversation.map((item, index) => (
              <p
                className={`hilo-message ${item.type === 'user' ? 'user-message' : 'bot-message'}`}
                key={`${item.text}-${index}`}
              >
                {item.text}
              </p>
            ))}

            {/* Grid de acciones */}
            <div className="hilo-grid">
              {OPTIONS.map(([key, icon, label, sub, action, nextPose]) => (
                <button
                  className={`hilo-card hilo-card-${key}`}
                  type="button"
                  key={key}
                  onMouseEnter={() => handleCardHover(nextPose)}
                  onClick={() => runAction(action, label, nextPose)}
                >
                  <span className="hilo-card-art">
                    <img src={`/images/hilo/${nextPose}`} alt="" aria-hidden="true" />
                  </span>
                  <span className="hilo-card-icon">{icon}</span>
                  <span className="hilo-card-label">{label}</span>
                  <span className="hilo-card-sub">{sub}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Formulario de búsqueda */}
          <form className="assistant-form" onSubmit={sendMessage}>
            <label className="sr-only" htmlFor="hilo-input">
              Cuéntaselo a Hilo
            </label>
            <input
              id="hilo-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Cuéntaselo a Hilo..."
            />
            <button type="submit" aria-label="Enviar">
              ➜
            </button>
          </form>
        </aside>
      )}
    </section>
  );
}
