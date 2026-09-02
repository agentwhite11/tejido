import ScreenIntro from '../components/ScreenIntro.jsx';

export default function MapScreen() {
  return (
    <section className="section screen-section map-screen">
      <ScreenIntro eyebrow="Memoria, río y comunidad" title="Mapa vivo" description="Un punto de encuentro visual para descubrir dónde nacen las historias de Caucasia." />
      <div className="map-placeholder" role="img" aria-label="Mapa ilustrado de Caucasia"><span>CAUCASIA</span><i className="map-pin pin-one" /><i className="map-pin pin-two" /><i className="map-pin pin-three" /></div>
    </section>
  );
}
