/**
 * TIMELINESECTION.JSX — Timeline del Territorio
 *
 * Muestra las publicaciones de TEJIDO en una línea de tiempo horizontal
 * que representa la cronología del Bajo Cauca.
 *
 * Características:
 * - Scroll horizontal con publicaciones ordenadas por fecha
 * - Línea visual que conecta los eventos
 * - Colores por tipo de publicación
 * - Hover para ver detalles
 * - Animación de entrada al hacer scroll
 *
 * Parte de la FASE 7 del plan de magia.
 */

import { useRef, useEffect, useState } from 'react';
import { formatDateShort } from '../utils/dateUtils.js';
import { KIND_COLORS, KIND_ICONS } from '../utils/constants.js';

/**
 * Agrupa y ordena publicaciones por fecha.
 * Solo incluye publicaciones con start_date.
 */
function sortByDate(publications) {
  return [...publications]
    .filter((pub) => pub.start_date)
    .sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
}

export default function TimelineSection({ publications = [] }) {
  /** Ref del contenedor de scroll horizontal */
  const scrollRef = useRef(null);
  /** Si la sección es visible (para animación de entrada) */
  const [isVisible, setIsVisible] = useState(false);

  // Ordenar publicaciones por fecha
  const sorted = sortByDate(publications);

  // Observer para detectar cuando la sección entra en viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (scrollRef.current) {
      observer.observe(scrollRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // No mostrar si no hay publicaciones con fecha
  if (sorted.length === 0) return null;

  return (
    <section className={`timeline-section ${isVisible ? 'visible' : ''}`}>
      {/* Encabezado */}
      <div className="timeline-header">
        <span className="section-badge">Cronología</span>
        <h2 className="section-title">El hilo del tiempo</h2>
        <p className="timeline-subtitle">
          Las historias, eventos y oportunidades del Bajo Cauca en orden cronológico.
        </p>
      </div>

      {/* Línea de tiempo con scroll horizontal */}
      <div className="timeline-scroll" ref={scrollRef}>
        {/* Línea central */}
        <div className="timeline-line" />

        {/* Publicaciones en la línea */}
        <div className="timeline-items">
          {sorted.map((pub, index) => (
            <div
              key={pub.id}
              className={`timeline-item ${index % 2 === 0 ? 'above' : 'below'}`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Conector visual */}
              <div
                className="timeline-connector"
                style={{ background: KIND_COLORS[pub.kind] || '#1d8fa3' }}
              />

              {/* Punto en la línea */}
              <div
                className="timeline-dot"
                style={{ background: KIND_COLORS[pub.kind] || '#1d8fa3' }}
              />

              {/* Tarjeta de contenido */}
              <div className="timeline-card">
                <span className="timeline-icon">
                  {KIND_ICONS[pub.kind] || '\u2022'}
                </span>
                <span className="timeline-date">
                  {formatDateShort(pub.start_date)}
                </span>
                <h3 className="timeline-title">{pub.title}</h3>
                <p className="timeline-summary">{pub.summary}</p>
                <small className="timeline-location">
                  {pub.location || 'Caucasia'}
                </small>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
