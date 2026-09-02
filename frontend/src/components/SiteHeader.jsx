export default function SiteHeader({ onLogin }) {
  return (
    <header className="site-header">
      <a className="brand" href="#inicio" aria-label="TEJIDO inicio">
        <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>
        <span>TEJIDO<small>CAUCASIA</small></span>
      </a>
      <nav aria-label="Principal">
        <a href="#inicio">Inicio</a>
        <a href="#explorar">Explorar</a>
        <a href="#mapa">Mapa vivo</a>
        <a href="#agenda">Agenda</a>
        <a href="#oportunidades">Oportunidades</a>
        <a href="#talento">Talento</a>
      </nav>
      <button className="login-button" type="button" onClick={onLogin}>Ingresar</button>
    </header>
  );
}
