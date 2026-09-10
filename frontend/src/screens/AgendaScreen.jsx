/**
 * AGENDASCREEN.JSX — Pantalla de Agenda / Eventos
 *
 * Muestra la lista de eventos del Bajo Cauca con:
 * - Countdown visual "Faltan X días" o "¡Es hoy!"
 * - Fechas formateadas en español legible
 * - Indicador de urgencia por colores
 * - Ubicación del evento
 *
 * Parte de la FASE 3 del plan de magia.
 */

import ScreenIntro from '../components/ScreenIntro.jsx';
import { formatDate, getCountdown, getDateUrgency } from '../utils/dateUtils.js';
import { KIND_LABELS } from '../utils/constants.js';

export default function AgendaScreen({ events = [] }) {
  return (
    <section className="section screen-section">
      <ScreenIntro
        eyebrow="La ronda continúa"
        title="Agenda de Caucasia"
        description="Planes para encontrarnos, aprender y celebrar lo nuestro."
      />

      <div className="screen-list">
        {events.length ? (
          events.map((event) => {
            /** Countdown del evento */
            const countdown = getCountdown(event.start_date);
            /** Nivel de urgencia para estilo visual */
            const urgency = getDateUrgency(event.start_date);

            return (
              <article className="screen-list-item" key={event.id}>
                {/* Etiqueta del tipo */}
                <span className="publication-kind">
                  {KIND_LABELS[event.kind] || event.kind}
                </span>

                {/* Título del evento */}
                <h2>{event.title}</h2>

                {/* Resumen */}
                <p>{event.summary}</p>

                {/* Fecha formateada */}
                {event.start_date && (
                  <small className="event-date">
                    {formatDate(event.start_date)}
                  </small>
                )}

                {/* Countdown visual */}
                {event.start_date && (
                  <div className={`event-countdown ${urgency}`}>
                    <span className="countdown-icon">
                      {countdown.isToday ? '!' : countdown.isPast ? '\u2713' : '\u23F0'}
                    </span>
                    <span className="countdown-text">{countdown.text}</span>
                  </div>
                )}

                {/* Ubicación */}
                <small className="event-location">
                  {event.location || 'Caucasia'}
                </small>
              </article>
            );
          })
        ) : (
          <p className="status">Pronto encontrarás nuevos eventos.</p>
        )}
      </div>
    </section>
  );
}
