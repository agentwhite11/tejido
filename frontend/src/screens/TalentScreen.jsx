import ScreenIntro from '../components/ScreenIntro.jsx';

export default function TalentScreen({ talents }) {
  return (
    <section className="section screen-section talent-screen">
      <ScreenIntro eyebrow="Talento de aquí" title="Voces que llevan el río dentro." description="Conoce a artistas, portadores de tradición, líderes y creadores de Caucasia." />
      <div className="screen-list">
        {talents.length ? talents.map((talent) => <article className="screen-list-item" key={talent.id}><span className="publication-kind">TALENTO</span><h2>{talent.title}</h2><p>{talent.summary}</p><small>{talent.location || 'Caucasia'}</small></article>) : <p className="status">Pronto conocerás nuevos talentos.</p>}
      </div>
    </section>
  );
}
