import ScreenIntro from '../components/ScreenIntro.jsx';

export default function AgendaScreen({ events }) {
  return (
    <section className="section screen-section">
      <ScreenIntro eyebrow="La ronda continúa" title="Agenda de Caucasia" description="Planes para encontrarnos, aprender y celebrar lo nuestro." />
      <div className="screen-list">
        {events.length ? events.map((event) => <article className="screen-list-item" key={event.id}><span className="publication-kind">EVENTO</span><h2>{event.title}</h2><p>{event.summary}</p><small>{event.location || 'Caucasia'}</small></article>) : <p className="status">Pronto encontrarás nuevos eventos.</p>}
      </div>
    </section>
  );
}
