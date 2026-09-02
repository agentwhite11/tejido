import HeroSection from '../components/HeroSection.jsx';

export default function HomeScreen({ onExplore }) {
  return (
    <>
      <HeroSection />
      <section className="section home-invitation">
        <div>
          <p className="eyebrow">Un territorio que participa</p>
          <h2>Las historias también construyen futuro.</h2>
        </div>
        <button className="primary-button" type="button" onClick={onExplore}>Ver publicaciones</button>
      </section>
    </>
  );
}
