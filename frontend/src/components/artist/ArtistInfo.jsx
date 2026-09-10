function ArtistTimeline({ timeline }) {
  if (!timeline || timeline.length === 0) return null;

  return (
    <section className="ax-timeline">
      <h2 className="ax-section-title">Historia</h2>

      <div className="ax-timeline-track">
        <div className="ax-timeline-line" aria-hidden="true" />

        {timeline.map((item, index) => (
          <div
            key={item.id}
            className={`ax-timeline-item ${index % 2 === 0 ? 'ax-timeline-item--left' : 'ax-timeline-item--right'}`}
          >
            <div className="ax-timeline-dot" aria-hidden="true">
              <div className="ax-timeline-dot-inner" />
            </div>

            <div className="ax-timeline-card">
              {item.fecha && (
                <span className="ax-timeline-year">
                  {item.fecha.split('-')[0]}
                </span>
              )}
              <h3 className="ax-timeline-title">{item.titulo}</h3>
              {item.descripcion && (
                <p className="ax-timeline-desc">{item.descripcion}</p>
              )}
              {item.imagen_url && (
                <div className="ax-timeline-image">
                  <img src={item.imagen_url} alt={item.titulo} loading="lazy" />
                </div>
              )}
              {item.video_url && (
                <a href={item.video_url} target="_blank" rel="noopener noreferrer" className="ax-timeline-video-link">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                  Ver video
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

const entityLabels = {
  event: 'Evento',
  artist: 'Artista',
  collective: 'Colectivo',
  story: 'Historia',
  place: 'Lugar',
};

const entityColors = {
  event: '#F59E0B',
  artist: '#EC4899',
  collective: '#8B5CF6',
  story: '#3B82F6',
  place: '#10B981',
};

function ArtistTerritory({ connections }) {
  if (!connections || connections.length === 0) return null;

  return (
    <section className="ax-territory">
      <h2 className="ax-section-title">Desde el territorio</h2>
      <p className="ax-territory-intro">
        Las conexiones de {connections[0]?.titulo ? 'este artista' : 'OG MAURO'} con el ecosistema cultural del Bajo Cauca.
      </p>

      <div className="ax-connections">
        {connections.map((conn) => (
          <div key={conn.id} className="ax-connection-card">
            <div className="ax-connection-header">
              <span
                className="ax-connection-type"
                style={{ color: entityColors[conn.entity_type] || '#999' }}
              >
                {entityLabels[conn.entity_type] || conn.entity_type}
              </span>
              {conn.imagen_url && (
                <div className="ax-connection-image">
                  <img src={conn.imagen_url} alt={conn.titulo} loading="lazy" />
                </div>
              )}
            </div>
            <h3 className="ax-connection-title">{conn.titulo}</h3>
            {conn.descripcion && (
              <p className="ax-connection-desc">{conn.descripcion}</p>
            )}
            {conn.url && (
              <a href={conn.url} target="_blank" rel="noopener noreferrer" className="ax-connection-link">
                Conocer mas
              </a>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function ArtistEvents({ events }) {
  if (!events || events.length === 0) return null;

  function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-CO', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function isPast(dateStr) {
    if (!dateStr) return false;
    return new Date(dateStr) < new Date();
  }

  return (
    <section className="ax-events">
      <h2 className="ax-section-title">Eventos</h2>

      <div className="ax-events-list">
        {events.map((event) => {
          const past = isPast(event.start_date);
          return (
            <div key={event.id} className={`ax-event-card ${past ? 'ax-event-card--past' : ''}`}>
              <div className="ax-event-date">
                {event.start_date && (
                  <>
                    <span className="ax-event-month">
                      {new Date(event.start_date).toLocaleDateString('es-CO', { month: 'short' })}
                    </span>
                    <span className="ax-event-day">
                      {new Date(event.start_date).getDate()}
                    </span>
                  </>
                )}
              </div>
              <div className="ax-event-info">
                <h3>{event.title}</h3>
                <p>{event.venue || event.location}</p>
                {event.summary && <span className="ax-event-summary">{event.summary}</span>}
              </div>
              <div className="ax-event-status">
                {past ? (
                  <span className="ax-event-badge ax-event-badge--past">Pasado</span>
                ) : (
                  <span className="ax-event-badge ax-event-badge--upcoming">Proximo</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default function ArtistInfo({ timeline, connections, events }) {
  const hasTimeline = timeline && timeline.length > 0;
  const hasConnections = connections && connections.length > 0;
  const hasEvents = events && events.length > 0;

  return (
    <>
      {hasTimeline && (
        <div id="ax-timeline">
          <ArtistTimeline timeline={timeline} />
        </div>
      )}

      {hasConnections && (
        <div id="ax-territory">
          <ArtistTerritory connections={connections} />
        </div>
      )}

      {hasEvents && (
        <div id="ax-events">
          <ArtistEvents events={events} />
        </div>
      )}
    </>
  );
}
