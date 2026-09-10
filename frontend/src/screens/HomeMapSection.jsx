import { useState, useEffect, useRef } from 'react';
import {
  MUNICIPALITIES_DATA,
  MUNICIPALITY_LOCATION_MAP,
  MUNICIPALITY_SVG_POSITIONS,
  normalizeText
} from '../utils/constants.js';

function groupPubsByMunicipality(publications) {
  const groups = {};
  Object.keys(MUNICIPALITY_LOCATION_MAP).forEach((key) => {
    groups[key] = [];
  });
  publications.forEach((pub) => {
    const location = normalizeText(pub.location || '');
    for (const [muni, keywords] of Object.entries(MUNICIPALITY_LOCATION_MAP)) {
      if (keywords.some((kw) => location.includes(normalizeText(kw)))) {
        groups[muni].push(pub);
        return;
      }
    }
    groups.caucasia.push(pub);
  });
  return groups;
}

export default function HomeMapSection({ publications = [] }) {
  const mapRef = useRef(null);
  const [selectedMunicipality, setSelectedMunicipality] = useState(null);
  const [hoveredMunicipality, setHoveredMunicipality] = useState(null);
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });

  const pubsByMunicipality = groupPubsByMunicipality(publications);

  useEffect(() => {
    if (!mapRef.current) return;
    const municipalities = mapRef.current.querySelectorAll('.geo-muni');

    municipalities.forEach((muni) => {
      muni.addEventListener('mouseenter', () => {
        const name = muni.getAttribute('data-name');
        setHoveredMunicipality(MUNICIPALITIES_DATA[name]);
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
        const name = muni.getAttribute('data-name');
        setSelectedMunicipality(MUNICIPALITIES_DATA[name]);
      });

      muni.style.cursor = 'pointer';
    });
  }, []);

  return (
    <section className="geo-section">
      <div className="geo-header">
        <span className="section-badge">Geografía</span>
        <h2 className="section-title">Nuestros <em>seis</em> municipios</h2>
        <p className="geo-subtitle">Un recorrido por el Bajo Cauca Antioqueño</p>
      </div>

      <div className="geo-stage" ref={mapRef}>
        <svg className="geo-map" viewBox="0 0 800 560" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="geoGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#1d8fa3" stopOpacity="0.25"/>
              <stop offset="100%" stopColor="#1d8fa3" stopOpacity="0"/>
            </radialGradient>
            <linearGradient id="riverGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1d8fa3" stopOpacity="0.15"/>
              <stop offset="40%" stopColor="#1d8fa3" stopOpacity="0.55"/>
              <stop offset="60%" stopColor="#1d8fa3" stopOpacity="0.55"/>
              <stop offset="100%" stopColor="#1d8fa3" stopOpacity="0.15"/>
            </linearGradient>
            <linearGradient id="regionFill" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f5e6c4" stopOpacity="0.18"/>
              <stop offset="50%" stopColor="#e8f4f8" stopOpacity="0.12"/>
              <stop offset="100%" stopColor="#f5e6c4" stopOpacity="0.18"/>
            </linearGradient>
            <linearGradient id="pathDash" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#1d8fa3" stopOpacity="0"/>
              <stop offset="15%" stopColor="#1d8fa3" stopOpacity="0.3"/>
              <stop offset="85%" stopColor="#1d8fa3" stopOpacity="0.3"/>
              <stop offset="100%" stopColor="#1d8fa3" stopOpacity="0"/>
            </linearGradient>
            <filter id="softGlow">
              <feGaussianBlur stdDeviation="4" result="blur"/>
              <feMerge>
                <feMergeNode in="blur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <filter id="bigGlow">
              <feGaussianBlur stdDeviation="8" result="blur"/>
              <feMerge>
                <feMergeNode in="blur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          <path
            className="geo-region"
            d="M140,55 Q180,30 340,35 Q500,30 620,55 Q680,75 685,140 Q690,220 670,300 Q650,380 600,430 Q530,480 400,490 Q270,495 180,450 Q110,410 85,340 Q60,270 70,190 Q80,100 140,55 Z"
            fill="url(#regionFill)"
            stroke="#1d8fa3"
            strokeWidth="1.5"
            strokeOpacity="0.2"
          />

          <g className="geo-routes">
            <path className="geo-route" d="M195,210 Q260,160 235,128" strokeDasharray="6 8"/>
            <path className="geo-route" d="M235,128 Q280,100 335,135" strokeDasharray="6 8"/>
            <path className="geo-route" d="M335,135 Q410,150 490,148" strokeDasharray="6 8"/>
            <path className="geo-route" d="M195,210 Q250,280 215,350" strokeDasharray="6 8"/>
            <path className="geo-route" d="M365,225 Q390,280 365,340" strokeDasharray="6 8"/>
            <path className="geo-route" d="M490,148 Q430,200 365,225" strokeDasharray="6 8"/>
          </g>

          <path className="geo-river" d="M90,120 Q160,160 230,195 Q340,230 460,260 Q540,285 620,320" stroke="url(#riverGrad)" strokeWidth="12" strokeLinecap="round" fill="none"/>
          <path className="geo-river-flow" d="M90,120 Q160,160 230,195 Q340,230 460,260 Q540,285 620,320" stroke="url(#riverGrad)" strokeWidth="6" strokeLinecap="round" fill="none"/>
          <path className="geo-river geo-river-tributary" d="M210,70 Q230,120 250,175 Q270,240 290,290" stroke="url(#riverGrad)" strokeWidth="7" strokeLinecap="round" fill="none"/>

          <g className="geo-particles">
            <circle className="geo-particle p1" cx="150" cy="180" r="2"/>
            <circle className="geo-particle p2" cx="300" cy="90" r="1.5"/>
            <circle className="geo-particle p3" cx="500" cy="200" r="2"/>
            <circle className="geo-particle p4" cx="250" cy="350" r="1.5"/>
            <circle className="geo-particle p5" cx="580" cy="300" r="2"/>
            <circle className="geo-particle p6" cx="420" cy="400" r="1.5"/>
            <circle className="geo-particle p7" cx="130" cy="300" r="1.8"/>
            <circle className="geo-particle p8" cx="620" cy="150" r="1.5"/>
          </g>

          <g className="geo-municipalities">
            <g className="geo-muni caucasia" data-name="caucasia">
              <circle className="muni-ring ring-outer" cx="365" cy="225" r="28" />
              <circle className="muni-ring ring-mid" cx="365" cy="225" r="20" />
              <circle className="muni-dot" cx="365" cy="225" r="10" />
              <circle className="muni-core" cx="365" cy="225" r="4" />
              <text className="muni-name" x="365" y="268">Caucasia</text>
              <text className="muni-role" x="365" y="286">Capital</text>
            </g>
            <g className="geo-muni caceres" data-name="caceres">
              <circle className="muni-ring ring-outer" cx="195" cy="210" r="22" />
              <circle className="muni-ring ring-mid" cx="195" cy="210" r="16" />
              <circle className="muni-dot" cx="195" cy="210" r="8" />
              <circle className="muni-core" cx="195" cy="210" r="3.5" />
              <text className="muni-name" x="195" y="248">Cáceres</text>
              <text className="muni-role" x="195" y="264">Historia</text>
            </g>
            <g className="geo-muni taraza" data-name="taraza">
              <circle className="muni-ring ring-outer" cx="235" cy="128" r="22" />
              <circle className="muni-ring ring-mid" cx="235" cy="128" r="16" />
              <circle className="muni-dot" cx="235" cy="128" r="8" />
              <circle className="muni-core" cx="235" cy="128" r="3.5" />
              <text className="muni-name" x="235" y="166">Tarazá</text>
              <text className="muni-role" x="235" y="182">Café</text>
            </g>
            <g className="geo-muni nechi" data-name="nechi">
              <circle className="muni-ring ring-outer" cx="335" cy="135" r="22" />
              <circle className="muni-ring ring-mid" cx="335" cy="135" r="16" />
              <circle className="muni-dot" cx="335" cy="135" r="8" />
              <circle className="muni-core" cx="335" cy="135" r="3.5" />
              <text className="muni-name" x="335" y="173">Nechí</text>
              <text className="muni-role" x="335" y="189">Río</text>
            </g>
            <g className="geo-muni elbagre" data-name="elbagre">
              <circle className="muni-ring ring-outer" cx="490" cy="148" r="22" />
              <circle className="muni-ring ring-mid" cx="490" cy="148" r="16" />
              <circle className="muni-dot" cx="490" cy="148" r="8" />
              <circle className="muni-core" cx="490" cy="148" r="3.5" />
              <text className="muni-name" x="490" y="186">El Bagre</text>
              <text className="muni-role" x="490" y="202">Oro</text>
            </g>
            <g className="geo-muni zaragoza" data-name="zaragoza">
              <circle className="muni-ring ring-outer" cx="215" cy="350" r="22" />
              <circle className="muni-ring ring-mid" cx="215" cy="350" r="16" />
              <circle className="muni-dot" cx="215" cy="350" r="8" />
              <circle className="muni-core" cx="215" cy="350" r="3.5" />
              <text className="muni-name" x="215" y="388">Zaragoza</text>
              <text className="muni-role" x="215" y="404">Fundación</text>
            </g>
          </g>

          <g className="geo-pub-dots">
            {Object.entries(pubsByMunicipality).map(([muni, pubs]) => {
              if (pubs.length === 0) return null;
              const pos = MUNICIPALITY_SVG_POSITIONS[muni];
              if (!pos) return null;
              return (
                <g key={muni} className="geo-pub-group"
                  onMouseEnter={() => {}}
                  onMouseLeave={() => {}}
                >
                  <circle className="pub-halo" cx={pos.x} cy={pos.y} r={14 + pubs.length * 2} fill="none" stroke="#1d8fa3" strokeWidth="1" strokeOpacity="0.3"/>
                  <circle className="pub-counter-bg" cx={pos.x} cy={pos.y} r={10} fill="#1d8fa3" fillOpacity="0.9"/>
                  <text className="pub-counter-text" x={pos.x} y={pos.y + 1} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="8" fontWeight="800">
                    {pubs.length}
                  </text>
                </g>
              );
            })}
          </g>

          <text x="400" y="530" className="geo-map-title">BAJO CAUCA ANTIOQUEÑO</text>
        </svg>

        {hoveredMunicipality && (
          <div className="geo-hover-card" style={{ left: hoverPos.x, top: hoverPos.y }}>
            <div className="geo-hover-img" style={{backgroundImage: `url(${hoveredMunicipality.image})`}}></div>
            <div className="geo-hover-body">
              <span className="geo-hover-badge">Municipio</span>
              <h4>{hoveredMunicipality.name}</h4>
              <p className="geo-hover-title">{hoveredMunicipality.title}</p>
              <p className="geo-hover-desc">{hoveredMunicipality.description}</p>
              <div className="geo-hover-tags">
                {hoveredMunicipality.tags.map((tag, i) => (
                  <span key={i} className="geo-hover-tag">{tag}</span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="geo-cards">
        {Object.entries(MUNICIPALITIES_DATA).map(([key, muni], index) => (
          <button
            key={key}
            className="geo-card"
            style={{ animationDelay: `${index * 0.1}s` }}
            onClick={() => setSelectedMunicipality(muni)}
          >
            <div className="geo-card-accent" style={{
              background: `linear-gradient(135deg, ${
                index === 0 ? '#d4a843' :
                index === 1 ? '#1d8fa3' :
                index === 2 ? '#75b79b' :
                index === 3 ? '#1d8fa3' :
                index === 4 ? '#d4a843' :
                '#8a4f7d'
              }, transparent)`
            }}></div>
            <div className="geo-card-content">
              <h4>{muni.name}</h4>
              <p>{muni.title}</p>
            </div>
            <svg className="geo-card-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        ))}
      </div>

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
    </section>
  );
}
