import ScreenIntro from '../components/ScreenIntro.jsx';

export default function OpportunitiesScreen({ opportunities }) {
  return (
    <section className="section screen-section">
      <ScreenIntro eyebrow="Abre una puerta" title="Oportunidades" description="Convocatorias, proyectos y espacios para participar en el territorio." />
      <div className="screen-list opportunity-list">
        {opportunities.length ? opportunities.map((opportunity) => <article className="screen-list-item" key={opportunity.id}><span className="publication-kind">OPORTUNIDAD</span><h2>{opportunity.title}</h2><p>{opportunity.summary}</p><small>{opportunity.end_date ? `Cierra: ${opportunity.end_date}` : 'Convocatoria abierta'}</small></article>) : <p className="status">Pronto encontrarás nuevas oportunidades.</p>}
      </div>
    </section>
  );
}
