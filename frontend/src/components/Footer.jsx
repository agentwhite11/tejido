export default function Footer() {
  return (
    <footer>
      <div className="footer-brand">
        <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>
        <b>TEJIDO</b>
        <p>Descubre lo que mueve a Caucasia.</p>
      </div>
      <div>
        <b>Explora</b>
        <a href="#explorar">Historias</a>
        <a href="#agenda">Eventos</a>
        <a href="#oportunidades">Oportunidades</a>
        <a href="#talento">Talento</a>
      </div>
      <div>
        <b>Proyecto</b>
        <a href="#inicio">Acerca de TEJIDO</a>
        <a href="#mapa">Mapa vivo</a>
        <a href="#guardadas">Guardadas</a>
      </div>
      <div className="footer-note">
        <span>Hecho con orgullo<br />en Caucasia, Antioquia.</span>
        <span>© 2026 TEJIDO</span>
      </div>
    </footer>
  );
}
