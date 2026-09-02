import ScreenIntro from '../components/ScreenIntro.jsx';

export default function SavedScreen() {
  return (
    <section className="section screen-section">
      <ScreenIntro eyebrow="Tu selección personal" title="Contenidos guardados" description="Aquí reuniremos las historias, eventos y oportunidades que quieras volver a visitar." />
      <div className="empty-screen"><span aria-hidden="true">♡</span><h2>Aún no has guardado contenido</h2><p>Explora las publicaciones y guarda las que quieras consultar después.</p></div>
    </section>
  );
}
