import { useState } from 'react';
import Logo from './Logo.jsx';

export default function SiteHeader({ user, onLogin, onLogout }) {
  const [showUserMenu, setShowUserMenu] = useState(false);

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
        <a href="#colaborador">Colaborar</a>
      </nav>
      {user ? (
        <div className="user-menu-wrapper">
          <button className="user-menu-btn" onClick={() => setShowUserMenu(!showUserMenu)}>
            {user.name?.charAt(0) || '?'}
          </button>
          {showUserMenu && (
            <div className="user-dropdown">
              <span className="user-dropdown-name">{user.name}</span>
              <a href="#colaborador">Mi Dashboard</a>
              <button onClick={onLogout}>Cerrar Sesión</button>
            </div>
          )}
        </div>
      ) : (
        <button className="login-button" type="button" onClick={onLogin}>Ingresar</button>
      )}
    </header>
  );
}
