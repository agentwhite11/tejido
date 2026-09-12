import { useState, useEffect, useRef } from 'react';
import Logo from './Logo.jsx';

export default function SiteHeader({ user, onLogin, onLogout, isMoneystack = false }) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!showUserMenu) return;
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    }
    function handleHashChange() {
      setShowUserMenu(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('hashchange', handleHashChange);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [showUserMenu]);

  return (
    <header className={`site-header${isMoneystack ? ' site-header-moneystack' : ''}`}>
      <Logo />
      <nav aria-label="Principal">
        <a href="#inicio">Inicio</a>
        <a href="#explorar">Explorar</a>
        <a href="#mapa">Mapa vivo</a>
        <a href="#agenda">Agenda</a>
        <a href="#oportunidades">Oportunidades</a>
        <a href="#talento">Talento</a>
        <a href="#colaborador">Colaborar</a>
        <a href="#moneystack" className="nav-moneystack">Moneystack</a>
      </nav>
      {user ? (
        <div className="user-menu-wrapper" ref={menuRef}>
          <button className="user-menu-btn" onClick={() => setShowUserMenu(!showUserMenu)}>
            {user.name?.charAt(0) || '?'}
          </button>
          {showUserMenu && (
            <div className="user-dropdown">
              <span className="user-dropdown-name">{user.name}</span>
              <a href="#colaborador" onClick={() => setShowUserMenu(false)}>Mi Dashboard</a>
              <button onClick={() => { setShowUserMenu(false); onLogout(); }}>Cerrar Sesión</button>
            </div>
          )}
        </div>
      ) : (
        <>
          <button className="login-button" type="button" onClick={onLogin}>Ingresar</button>
          <img className="white-logo" src="/images/white-proyect-logo.jpeg" alt="White Proyect" aria-label="White Proyect" />
        </>
      )}
    </header>
  );
}
