import HeroInteractive from '../components/HeroInteractive.jsx';
import PassportSection from '../components/PassportSection.jsx';
import TimelineSection from '../components/TimelineSection.jsx';
import HomeFeaturedArtist from './HomeFeaturedArtist.jsx';
import HomeMapSection from './HomeMapSection.jsx';

export default function HomeScreen({ onExplore, publications = [] }) {
  return (
    <>
      <HeroInteractive onExplore={onExplore} publications={publications} />

      <HomeFeaturedArtist />

      <HomeMapSection publications={publications} />

      <section className="section">
        <PassportSection />
      </section>

      <section className="section">
        <TimelineSection publications={publications} />
      </section>

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
    </>
  );
}
