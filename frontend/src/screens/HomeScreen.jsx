import { useState, useEffect, useRef } from 'react';
import HeroSection from '../components/HeroSection.jsx';

const municipalitiesData = {
  caucasia: {
    name: 'Caucasia',
    title: 'Capital del Bajo Cauca',
    description: 'Centro comercial y administrativo de la región, ubicada en la confluencia de los ríos Cauca y Nechí. Capital del Bajo Cauca, fundada en 1866.',
    image: '/assets/municipios/caucasia.jpg',
    tags: ['Capital', 'Confluencia', 'Comercio']
  },
  caceres: {
    name: 'Cáceres',
    title: 'Historia y Tradición',
    description: 'Fundado en 1576. Uno de los pueblos más antiguos de Antioquia con rica historia minera y tradición colonial que se respira en sus calles empedradas.',
    image: '/assets/municipios/caceres.jpg',
    tags: ['Colonial', 'Minería', 'Historia']
  },
  taraza: {
    name: 'Tarazá',
    title: 'Tierra de Café',
    description: 'Tierra de cafetaleros y tradición campesina. Conocido por su calidez humana, producción agrícola y los paisajes verdes de sus montañas.',
    image: '/assets/municipios/taraza.jpg',
    tags: ['Café', 'Agricultura', 'Campesinos']
  },
  nechi: {
    name: 'Nechí',
    title: 'Río y Tradición Minera',
    description: 'Fundado en 1636 como campamento minero. Hogar de comunidades afrocolombianas que mantienen vivas las tradiciones ancestrales del río.',
    image: '/assets/municipios/nechi.jpg',
    tags: ['Minería', 'Afrocolombiano', 'Río']
  },
  elbagre: {
    name: 'El Bagre',
    title: 'Cuna de Artistas',
    description: 'Primer productor de oro de Antioquia. Tierra de artistas y músicos que enamoran con su folklore y la alegría de su gente.',
    image: '/assets/municipios/elbagre.jpg',
    tags: ['Oro', 'Folklore', 'Música']
  },
  zaragoza: {
    name: 'Zaragoza',
    title: 'Municipio Fundado',
    description: 'Fundado en 1581. Pueblo con historia minera milenaria y paisajes naturales impresionantes donde el río Cauca narra historias.',
    image: '/assets/municipios/zaragoza.jpg',
    tags: ['Fundación', 'Naturaleza', 'Minería']
  }
};

export default function HomeScreen({ onExplore }) {
  const mapRef = useRef(null);
  const [selectedMunicipality, setSelectedMunicipality] = useState(null);
  const [hoveredMunicipality, setHoveredMunicipality] = useState(null);
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!mapRef.current) return;
    const municipalities = mapRef.current.querySelectorAll('.municipality');

    municipalities.forEach((muni) => {
      muni.addEventListener('mouseenter', (e) => {
        const name = muni.getAttribute('data-name').toLowerCase().replace(/\s/g, '');
        setHoveredMunicipality(municipalitiesData[name]);
        const rect = muni.getBoundingClientRect();
        const containerRect = mapRef.current.getBoundingClientRect();
        setHoverPos({
          x: rect.left - containerRect.left + rect.width / 2,
          y: rect.top - containerRect.top - 10
        });
      });

      muni.addEventListener('mouseleave', () => {
        setHoveredMunicipality(null);
      });

      muni.addEventListener('click', () => {
        const name = muni.getAttribute('data-name').toLowerCase().replace(/\s/g, '');
        setSelectedMunicipality(municipalitiesData[name]);
      });

      muni.style.cursor = 'pointer';
    });
  }, []);

  return (
    <>
      <HeroSection onExplore={onExplore} />

      {/* Sección: Og Mauro - Moneystack */}
      <section className="artist-section">
        <div className="artist-content">
          <span className="section-badge section-badge-light">Artista Destacado</span>
          <h2 className="artist-title">Og Mauro</h2>
          <p className="artist-description">
            Artista del Bajo Cauca que lleva la esencia de nuestro territorio 
            a cada escenario. Su música conecta las raíces del río Cauca con 
            el ritmo urbano, creando un sonido único que representa la identidad 
            del Bajo Cauca antioqueño.
          </p>
          <div className="artist-meta">
            <span className="artist-tag">Moneystack</span>
            <span className="artist-tag">Bajo Cauca</span>
            <span className="artist-tag">Música Urbana</span>
          </div>
          
          <div className="artist-audio">
            <div className="audio-player">
              <button className="audio-play-btn" type="button">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
              </button>
              <div className="audio-info">
                <span className="audio-title">Sustancias</span>
                <div className="audio-progress">
                  <div className="audio-progress-bar"></div>
                </div>
                <span className="audio-time">1:24 / 3:45</span>
              </div>
            </div>
          </div>

          <div className="artist-social">
            <a href="#" className="social-link" aria-label="Instagram">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
            </a>
            <a href="#" className="social-link" aria-label="YouTube">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/>
                <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/>
              </svg>
            </a>
            <a href="#" className="social-link" aria-label="Spotify">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M8 15s4-1 6-2"/>
                <path d="M7 12s5-1.5 7.5-2.5"/>
                <path d="M6.5 9S12 7 17 9"/>
              </svg>
            </a>
          </div>

          <div className="artist-concert">
            <span className="concert-label">Próximamente</span>
            <span className="concert-date">Og Mauro x Moneystack</span>
            <span className="concert-place">Bajo Cauca Antioqueño</span>
          </div>
        </div>
        <div className="artist-visual">
          <div className="artist-image-container">
            <div className="artist-image-placeholder">
              <span className="artist-initials">OM</span>
            </div>
          </div>
          <div className="artist-gallery">
            <div className="gallery-thumb gallery-1"></div>
            <div className="gallery-thumb gallery-2"></div>
            <div className="gallery-thumb gallery-3"></div>
          </div>
          <div className="artist-logo">
            <span className="logo-text">Moneystack</span>
          </div>
        </div>
      </section>

      {/* Sección: Mapa del Bajo Cauca */}
      <section className="municipalities-section">
        <div className="municipalities-header">
          <span className="section-badge">Geografía</span>
          <h2 className="section-title">Nuestros <em>seis</em> municipios</h2>
        </div>
        <div className="map-container" ref={mapRef}>
          <svg className="bajo-cauca-map" viewBox="0 0 700 500" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="mapGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f5e6c4" stopOpacity="0.4"/>
                <stop offset="100%" stopColor="#e8f4f8" stopOpacity="0.4"/>
              </linearGradient>
              <linearGradient id="riverGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#1d8fa3" stopOpacity="0.3"/>
                <stop offset="50%" stopColor="#1d8fa3" stopOpacity="0.6"/>
                <stop offset="100%" stopColor="#1d8fa3" stopOpacity="0.3"/>
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            
            <path 
              className="region-path"
              d="M100,60 L600,60 Q640,60 640,100 L640,400 Q640,440 600,440 L100,440 Q60,440 60,400 L60,100 Q60,60 100,60 Z"
              fill="url(#mapGradient)"
              stroke="#1d8fa3"
              strokeWidth="2"
              strokeOpacity="0.4"
            />
            
            <path 
              className="river-path"
              d="M100,150 Q180,180 250,200 Q350,220 450,250 Q520,270 580,300"
              stroke="url(#riverGradient)"
              strokeWidth="10"
              strokeLinecap="round"
              fill="none"
            />
            
            <path 
              className="river-path river-nechi"
              d="M200,100 Q220,150 240,200 Q260,250 280,280"
              stroke="url(#riverGradient)"
              strokeWidth="6"
              strokeLinecap="round"
              fill="none"
            />
            
            <g className="municipality-points">
              <g className="municipality caucasia" data-name="Caucasia">
                <circle cx="350" cy="220" r="18" fill="#d4a843" filter="url(#glow)"/>
                <circle cx="350" cy="220" r="8" fill="#fff"/>
                <text x="350" y="260" className="municipality-label">Caucasia</text>
                <text x="350" y="278" className="municipality-sublabel">Capital</text>
              </g>
              
              <g className="municipality caceres" data-name="Cáceres">
                <circle cx="180" cy="200" r="15" fill="#d4a843" filter="url(#glow)"/>
                <circle cx="180" cy="200" r="7" fill="#fff"/>
                <text x="180" y="232" className="municipality-label">Cáceres</text>
                <text x="180" y="250" className="municipality-sublabel">Historia</text>
              </g>
              
              <g className="municipality taraza" data-name="Tarazá">
                <circle cx="220" cy="120" r="15" fill="#d4a843" filter="url(#glow)"/>
                <circle cx="220" cy="120" r="7" fill="#fff"/>
                <text x="220" y="152" className="municipality-label">Tarazá</text>
                <text x="220" y="170" className="municipality-sublabel">Café</text>
              </g>
              
              <g className="municipality nechi" data-name="Nechí">
                <circle cx="320" cy="130" r="15" fill="#d4a843" filter="url(#glow)"/>
                <circle cx="320" cy="130" r="7" fill="#fff"/>
                <text x="320" y="162" className="municipality-label">Nechí</text>
                <text x="320" y="180" className="municipality-sublabel">Río</text>
              </g>
              
              <g className="municipality elbagre" data-name="El Bagre">
                <circle cx="480" cy="140" r="15" fill="#d4a843" filter="url(#glow)"/>
                <circle cx="480" cy="140" r="7" fill="#fff"/>
                <text x="480" y="172" className="municipality-label">El Bagre</text>
                <text x="480" y="190" className="municipality-sublabel">Oro</text>
              </g>
              
              <g className="municipality zaragoza" data-name="Zaragoza">
                <circle cx="200" cy="340" r="15" fill="#d4a843" filter="url(#glow)"/>
                <circle cx="200" cy="340" r="7" fill="#fff"/>
                <text x="200" y="372" className="municipality-label">Zaragoza</text>
                <text x="200" y="390" className="municipality-sublabel">Fundado</text>
              </g>
            </g>
            
            <text x="350" y="470" className="map-title">BAJO CAUCA ANTIOQUEÑO</text>
          </svg>

          {/* Hover flotante */}
          {hoveredMunicipality && (
            <div 
              className="municipality-hover-card"
              style={{ left: hoverPos.x, top: hoverPos.y }}
            >
              <div className="hover-card-image" style={{backgroundImage: `url(${hoveredMunicipality.image})`}}></div>
              <div className="hover-card-content">
                <h4>{hoveredMunicipality.name}</h4>
                <p>{hoveredMunicipality.description}</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Sección: Invitación */}
      <section className="invitation-section">
        <div className="invitation-content">
          <h2 className="invitation-title">¿Listo para <em>tejer</em> historia?</h2>
          <p className="invitation-text">
            Únete a la comunidad que construye el futuro del Bajo Cauca. 
            Comparte, descubre, participa.
          </p>
          
          <div className="invitation-form">
            <input 
              type="email" 
              className="invitation-input" 
              placeholder="Tu correo electrónico"
            />
            <button className="btn-primary-cultural" type="button">
              Quiero Participar
            </button>
          </div>

          <div className="invitation-actions">
            <button className="btn-primary-cultural" type="button" onClick={onExplore}>
              Comenzar Ahora
            </button>
            <a className="btn-outline-cultural" href="#mapa">
              Ver Mapa
            </a>
          </div>
        </div>
      </section>

      {/* Modal de Municipio */}
      {selectedMunicipality && (
        <div className="municipality-modal-overlay" onClick={() => setSelectedMunicipality(null)}>
          <div className="municipality-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedMunicipality(null)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
            <div className="modal-image" style={{backgroundImage: `url(${selectedMunicipality.image})`}}></div>
            <div className="modal-content">
              <span className="modal-badge">Municipio</span>
              <h3 className="modal-title">{selectedMunicipality.name}</h3>
              <p className="modal-subtitle">{selectedMunicipality.title}</p>
              <p className="modal-description">{selectedMunicipality.description}</p>
              <div className="modal-tags">
                {selectedMunicipality.tags.map((tag, index) => (
                  <span key={index} className="modal-tag">{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
