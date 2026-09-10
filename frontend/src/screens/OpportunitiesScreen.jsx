/**
 * OPPORTUNITIESSCREEN.JSX — Pantalla de Oportunidades
 *
 * Muestra convocatorias, proyectos y espacios para participar
 * en el territorio del Bajo Cauca.
 *
 * Incluye:
 * - Contador de días restantes ("Cierra en X días")
 * - Indicador visual de urgencia
 * - Nombre de la organización
 * - Ubicación
 *
 * Parte de la FASE 3 del plan de magia.
 */

import ScreenIntro from '../components/ScreenIntro.jsx';
import { getDeadlineText, getDateUrgency, formatDateShort } from '../utils/dateUtils.js';

export default function OpportunitiesScreen({ opportunities = [] }) {
  return (
    <section className="section screen-section">
      <ScreenIntro
        eyebrow="Abre una puerta"
        title="Oportunidades"
        description="Convocatorias, proyectos y espacios para participar en el territorio."
      />

      <div className="screen-list opportunity-list">
        {opportunities.length ? (
          opportunities.map((opportunity) => {
            /** Texto del plazo restante */
            const deadlineText = getDeadlineText(opportunity.end_date);
            /** Urgencia visual */
            const urgency = getDateUrgency(opportunity.end_date);

            return (
              <article className="screen-list-item" key={opportunity.id}>
                {/* Etiqueta del tipo */}
                <span className="publication-kind">OPORTUNIDAD</span>

                {/* Título */}
                <h2>{opportunity.title}</h2>

                {/* Resumen */}
                <p>{opportunity.summary}</p>

                {/* Plazo con countdown */}
                <div className={`opportunity-deadline ${urgency}`}>
                  <span className="deadline-icon">
                    {urgency === 'urgent' ? '\u26A0' : '\u23F0'}
                  </span>
                  <span className="deadline-text">{deadlineText}</span>
                </div>

                {/* Fecha de cierre formateada */}
                {opportunity.end_date && (
                  <small className="opportunity-date">
                    Fecha límite: {formatDateShort(opportunity.end_date)}
                  </small>
                )}
              </article>
            );
          })
        ) : (
          <p className="status">Pronto encontrarás nuevas oportunidades.</p>
        )}
      </div>
    </section>
  );
}
