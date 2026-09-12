/**
 * HEROINTERACTIVE.JSX — Hero Conversacional con Hilo
 *
 * El hero no es una pagina estatica — es una experiencia interactiva
 * donde Hilo te guia por la esencia del Bajo Cauca.
 *
 * Flujo:
 *   greeting -> choose -> explore -> municipality -> detail
 *
 * Cada escena cambia:
 *   - La pose de Hilo
 *   - El fondo visual
 *   - Las opciones disponibles
 *   - El mensaje de Hilo
 */

import { useState, useEffect, useCallback, useMemo } from 'react';

/* --- ESCENAS -------------------------------------------------- */

const SCENES = {
  greeting: {
    pose: 'hilo-saluda.png',
    message: '¡Buenos días! Soy Hilo. Soy el hilo que une al Bajo Cauca. ¿Qué quieres descubrir?',
    background: 'default',
    options: [
      { id: 'historias', icon: '📖', label: 'Historias del río', sub: 'Lo que el Bajo Cauca cuenta' },
      { id: 'gente', icon: '🏘️', label: 'Conocer gente', sub: 'Quiénes mueven el territorio' },
      { id: 'musica', icon: '🎵', label: 'Música viva', sub: 'El sonido del territorio' },
    ],
  },
  historias: {
    pose: 'hilo-senala.png',
    message: 'Las historias nacen del río. Cada piedra guarda un secreto. ¿De cuál municipio quieres saber?',
    background: 'river',
    options: [
      { id: 'muni-caucasia', icon: '🏛️', label: 'Caucasia', sub: 'Capital, confluencia', color: '#d4a843' },
      { id: 'muni-caceres', icon: '🏰', label: 'Cáceres', sub: 'Historia, 1576', color: '#1d8fa3' },
      { id: 'muni-taraza', icon: '☕', label: 'Tarazá', sub: 'Tierra de café', color: '#75b79b' },
      { id: 'muni-nechi', icon: '🌊', label: 'Nechí', sub: 'Río y tradición', color: '#0f6b7a' },
      { id: 'muni-elbagre', icon: '⭐', label: 'El Bagre', sub: 'Oro ancestral', color: '#c4713a' },
      { id: 'muni-zaragoza', icon: '⚓', label: 'Zaragoza', sub: 'Fundación, 1581', color: '#6b3a7d' },
    ],
  },
  gente: {
    pose: 'hilo-saluda.png',
    message: 'El Bajo Cauca está vivo por su gente. Los gestores son los hilos que tejen la comunidad.',
    background: 'people',
    options: [
      { id: 'gestores', icon: '🧵', label: 'Gestores', sub: 'Los que tejen el territorio' },
      { id: 'artistas', icon: '🎨', label: 'Artistas', sub: 'Las voces del Bajo Cauca' },
      { id: 'back', icon: '↩️', label: 'Volver', sub: 'Seguir explorando' },
    ],
  },
  musica: {
    pose: 'hilo-celebra.png',
    message: 'La música es el latido del Bajo Cauca. De las corralejas a la música urbana, todo se conecta.',
    background: 'music',
    options: [
      { id: 'moneystack', icon: '🎶', label: 'Moneystack', sub: 'El sello del territorio' },
      { id: 'folklore', icon: '🪘', label: 'Folklore', sub: 'Tuna, tambora y décima' },
      { id: 'back', icon: '↩️', label: 'Volver', sub: 'Seguir explorando' },
    ],
  },
  gestores: {
    pose: 'hilo-explica.png',
    message: 'Los gestores son personas que conectan al Bajo Cauca a través del pensamiento crítico. Cada gestor es un hilo del tejido.',
    background: 'people',
    options: [
      { id: 'explorar-gestores', icon: '🔍', label: 'Ver gestores', sub: 'En la plataforma' },
      { id: 'back-gente', icon: '↩️', label: 'Volver', sub: 'Más opciones' },
    ],
  },
  artistas: {
    pose: 'hilo-descubre.png',
    message: 'Los artistas del Bajo Cauca cuentan historias que el río guarda. Moneystack es su sello.',
    background: 'music',
    options: [
      { id: 'explorar-artistas', icon: '🎤', label: 'Ver artistas', sub: 'En la plataforma' },
      { id: 'back-gente', icon: '↩️', label: 'Volver', sub: 'Más opciones' },
    ],
  },
  moneystack: {
    pose: 'hilo-celebra.png',
    message: 'Moneystack es el sello independiente del Bajo Cauca. Aquí nacen los artistas que hacen latir al territorio.',
    background: 'music',
    options: [
      { id: 'ir-moneystack', icon: '🎵', label: 'Ir a Moneystack', sub: 'Explorar el sello' },
      { id: 'back-musica', icon: '↩️', label: 'Volver', sub: 'Más opciones' },
    ],
  },
  folklore: {
    pose: 'hilo-explica.png',
    message: 'La tuna y la tambora, la décima, los cantos de vaquería, la zafra, el grito del monte. La música que acompaña las corralejas y los fandangos.',
    background: 'music',
    options: [
      { id: 'explorar-folklore', icon: '📖', label: 'Explorar historias', sub: 'Del folklore' },
      { id: 'back-musica', icon: '↩️', label: 'Volver', sub: 'Más opciones' },
    ],
  },
};

/* --- DATOS DE MUNICIPIOS -------------------------------------- */

const MUNICIPALITIES = {
  'muni-caucasia': {
    pose: 'hilo-descubre.png',
    name: 'Caucasia',
    color: '#d4a843',
    title: 'Capital del Bajo Cauca',
    description: 'Centro comercial y administrativo de la región. Confluencia de los ríos Cauca y Nechí. Fundada en 1866. Donde todo se conecta.',
    tags: ['Capital', 'Confluencia', 'Comercio'],
    background: 'muni-caucasia',
  },
  'muni-caceres': {
    pose: 'hilo-descubre.png',
    name: 'Cáceres',
    color: '#1d8fa3',
    title: 'Historia y Tradición',
    description: 'Fundado en 1576. Uno de los pueblos más antiguos de Antioquia con rica historia minera y tradición colonial que se respira en sus calles empedradas.',
    tags: ['Colonial', 'Minería', 'Historia'],
    background: 'muni-caceres',
  },
  'muni-taraza': {
    pose: 'hilo-descubre.png',
    name: 'Tarazá',
    color: '#75b79b',
    title: 'Tierra de Café',
    description: 'Tierra de cafetaleros y tradición campesina. Conocido por su calidez humana, producción agrícola y los paisajes verdes de sus montañas.',
    tags: ['Café', 'Agricultura', 'Campesinos'],
    background: 'muni-taraza',
  },
  'muni-nechi': {
    pose: 'hilo-descubre.png',
    name: 'Nechí',
    color: '#0f6b7a',
    title: 'Río y Tradición Minera',
    description: 'Fundado en 1636 como campamento minero. Hogar de comunidades afrocolombianas que mantienen vivas las tradiciones ancestrales del río.',
    tags: ['Minería', 'Afrocolombiano', 'Río'],
    background: 'muni-nechi',
  },
  'muni-elbagre': {
    pose: 'hilo-descubre.png',
    name: 'El Bagre',
    color: '#c4713a',
    title: 'Cuna de Artistas',
    description: 'Primer productor de oro de Antioquia. Tierra de artistas y músicos que enamoran con su folklore y la alegría de su gente.',
    tags: ['Oro', 'Folklore', 'Música'],
    background: 'muni-elbagre',
  },
  'muni-zaragoza': {
    pose: 'hilo-descubre.png',
    name: 'Zaragoza',
    color: '#6b3a7d',
    title: 'Municipio Fundado',
    description: 'Fundado en 1581. Pueblo con historia minera milenaria y paisajes naturales impresionantes donde el río Cauca narra historias.',
    tags: ['Fundación', 'Naturaleza', 'Minería'],
    background: 'muni-zaragoza',
  },
};

/* --- UTILIDADES ----------------------------------------------- */

function getGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return '¡Buenos días!';
  if (hour >= 12 && hour < 18) return '¡Buenas tardes!';
  return '¡Buenas noches!';
}

function getSceneBackground(scene) {
  if (scene === 'greeting') return 'hero-bg-default';
  if (scene === 'historias') return 'hero-bg-river';
  if (scene === 'gente' || scene === 'gestores' || scene === 'artistas') return 'hero-bg-people';
  if (scene === 'musica' || scene === 'moneystack' || scene === 'folklore') return 'hero-bg-music';
  if (scene.startsWith('muni-')) return `hero-bg-${scene}`;
  return 'hero-bg-default';
}

/* --- COMPONENTE ----------------------------------------------- */

export default function HeroInteractive({ onExplore, publications = [] }) {
  const [scene, setScene] = useState('greeting');
  const [history, setHistory] = useState([]);
  const [showContent, setShowContent] = useState(true);

  const currentData = MUNICIPALITIES[scene] || SCENES[scene] || SCENES.greeting;
  const isMunicipality = !!MUNICIPALITIES[scene];

  const pubsForMuni = useMemo(() => {
    if (!isMunicipality) return [];
    const muniName = MUNICIPALITIES[scene].name.toLowerCase();
    return publications
      .filter((p) => p.location && p.location.toLowerCase().includes(muniName))
      .slice(0, 3);
  }, [scene, isMunicipality, publications]);

  const greeting = useMemo(() => getGreeting(), []);

  const navigateTo = useCallback(
    (nextScene) => {
      setShowContent(false);
      setTimeout(() => {
        setHistory((prev) => [...prev, scene]);
        setScene(nextScene);
        setTimeout(() => setShowContent(true), 50);
      }, 400);
    },
    [scene]
  );

  const goBack = useCallback(() => {
    setShowContent(false);
    setTimeout(() => {
      setHistory((prev) => {
        const next = [...prev];
        next.pop();
        return next;
      });
      setScene((prev) => {
        const idx = history.lastIndexOf(prev);
        return idx > 0 ? history[idx - 1] : 'greeting';
      });
      setTimeout(() => setShowContent(true), 50);
    }, 400);
  }, [history]);

  function handleOptionClick(option) {
    if (option.id === 'back') return goBack();
    if (option.id === 'back-gente') return navigateTo('gente');
    if (option.id === 'back-musica') return navigateTo('musica');
    if (option.id === 'explorar-gestores') return (window.location.hash = 'talento');
    if (option.id === 'explorar-artistas') return (window.location.hash = 'moneystack');
    if (option.id === 'explorar-folklore') return (window.location.hash = 'explorar');
    if (option.id === 'ir-moneystack') return (window.location.hash = 'moneystack');
    if (onExplore && option.id === 'explorar') return onExplore();
    navigateTo(option.id);
  }

  const bgClass = getSceneBackground(scene);

  return (
    <section className={`hero-interactive ${bgClass}`} id="inicio">
      {/* Fondo animado */}
      <div className="hero-interactive-bg" aria-hidden="true">
        <div className="hero-bg-sun" />
        <svg
          className="hero-river-svg"
          viewBox="0 0 1400 600"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <linearGradient id="heroRiverGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1d8fa3" stopOpacity="0.03" />
              <stop offset="20%" stopColor="#1d8fa3" stopOpacity="0.18" />
              <stop offset="80%" stopColor="#1d8fa3" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#1d8fa3" stopOpacity="0.03" />
            </linearGradient>
          </defs>
          <path
            className="hero-river-path"
            d="M-80,320 C120,220 280,420 480,280 C680,140 840,380 1040,260 C1240,140 1360,340 1480,280"
            fill="none"
            stroke="url(#heroRiverGrad)"
            strokeWidth="80"
            strokeLinecap="round"
          />
          <path
            className="hero-river-spine"
            d="M-80,320 C120,220 280,420 480,280 C680,140 840,380 1040,260 C1240,140 1360,340 1480,280"
            fill="none"
            stroke="url(#heroRiverGrad)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="14 9"
          />
        </svg>
        {/* Particulas de oro */}
        <div className="hero-gold-particles" aria-hidden="true">
          {[...Array(8)].map((_, i) => (
            <span key={i} className={`hero-particle p${i + 1}`} />
          ))}
        </div>
      </div>

      {/* Contenido principal */}
      <div className={`hero-interactive-content ${showContent ? 'visible' : ''}`}>
        {/* Avatar de Hilo */}
        <div className="hero-hilo">
          <div className="hero-hilo-avatar-wrapper">
            <img
              className="hero-hilo-avatar"
              src={`/images/hilo/${currentData.pose || 'hilo-saluda.png'}`}
              alt="Hilo, guia de TEJIDO"
            />
          </div>

          {/* Mensaje de Hilo */}
          <p className="hero-hilo-message">{currentData.message}</p>
        </div>

        {/* Opciones interactivas */}
        {currentData.options && (
          <div className="hero-options">
            {currentData.options.map((option, index) => (
              <button
                key={option.id}
                className="hero-option"
                type="button"
                onClick={() => handleOptionClick(option)}
                style={{
                  animationDelay: `${index * 0.1 + 0.3}s`,
                  '--option-color': option.color || 'var(--river)',
                }}
              >
                <span className="hero-option-icon">{option.icon}</span>
                <span className="hero-option-label">{option.label}</span>
                <span className="hero-option-sub">{option.sub}</span>
              </button>
            ))}
          </div>
        )}

        {/* Tarjetas de publicaciones (solo en vista de municipio) */}
        {isMunicipality && pubsForMuni.length > 0 && (
          <div className="hero-muni-pubs">
            <h3 className="hero-muni-pubs-title">Lo que se esta contando</h3>
            <div className="hero-muni-pubs-grid">
              {pubsForMuni.map((pub) => (
                <div key={pub.id} className="hero-muni-pub-card">
                  <span className="hero-muni-pub-kind">{pub.kind}</span>
                  <h4 className="hero-muni-pub-title">{pub.title}</h4>
                  <p className="hero-muni-pub-summary">{pub.summary}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tags del municipio */}
        {isMunicipality && (
          <div className="hero-muni-info">
            <div className="hero-muni-tags">
              {currentData.tags.map((tag, i) => (
                <span key={i} className="hero-muni-tag" style={{ borderColor: currentData.color }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Stats del ecosistema */}
        {scene === 'greeting' && (
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-number">6</span>
              <span className="hero-stat-label">Municipios</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="hero-stat-number">{publications.length || '247'}</span>
              <span className="hero-stat-label">Historias</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="hero-stat-number">1</span>
              <span className="hero-stat-label">Rio que conecta</span>
            </div>
          </div>
        )}

        {/* Boton de explorar (solo en greeting) */}
        {scene === 'greeting' && (
          <div className="hero-explore-cta">
            <button className="btn-primary-cultural" type="button" onClick={() => onExplore && onExplore()}>
              Explorar el Territorio
            </button>
          </div>
        )}
      </div>

      {/* Boton de regreso (no en greeting) */}
      {scene !== 'greeting' && (
        <button className="hero-back-btn" type="button" onClick={goBack} aria-label="Volver">
          ← Volver
        </button>
      )}
    </section>
  );
}
