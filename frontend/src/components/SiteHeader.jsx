import Logo from './Logo.jsx';

export default function SiteHeader({ onLogin }) {
  return (
    <header className="site-header">
      <Logo />
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
