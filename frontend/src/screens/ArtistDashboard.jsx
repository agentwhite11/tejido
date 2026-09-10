import { useState, useEffect } from 'react';
import { fetchArtistDashboard } from '../services/artistApi.js';

const menuItems = [
  { id: 'overview', label: 'Vista General', icon: '◉' },
  { id: 'music', label: 'Mi Musica', icon: '♫' },
  { id: 'content', label: 'Mi Contenido', icon: '□' },
  { id: 'events', label: 'Mis Eventos', icon: '◈' },
  { id: 'brand', label: 'Mi Marca', icon: '◆' },
  { id: 'stats', label: 'Mis Estadisticas', icon: '▤' },
  { id: 'goals', label: 'Mis Objetivos', icon: '◎' },
];

function MetricCard({ label, value, suffix, trend }) {
  return (
    <div className="ms-metric">
      <span className="ms-metric-label">{label}</span>
      <span className="ms-metric-value">
        {typeof value === 'number' ? value.toLocaleString() : value}
        {suffix && <span className="ms-metric-suffix">{suffix}</span>}
      </span>
      {trend && (
        <span className={`ms-metric-trend ${trend > 0 ? 'ms-metric-trend--up' : 'ms-metric-trend--down'}`}>
          {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </span>
      )}
    </div>
  );
}

function ProgressBar({ label, current, target, color }) {
  const pct = target > 0 ? Math.min(100, (current / target) * 100) : 0;
  return (
    <div className="ms-progress">
      <div className="ms-progress-header">
        <span className="ms-progress-label">{label}</span>
        <span className="ms-progress-value">{current} / {target}</span>
      </div>
      <div className="ms-progress-bar">
        <div className="ms-progress-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

export default function ArtistDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchArtistDashboard(1)
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="ms-loading">
        <div className="ms-loading-spinner" />
        <p>Cargando dashboard...</p>
      </div>
    );
  }

  const latest = data?.latest || {};

  return (
    <div className="ms-dashboard">
      <aside className="ms-sidebar">
        <div className="ms-sidebar-header">
          <span className="ms-logo">M</span>
          <div>
            <h2 className="ms-sidebar-title">Money Stack</h2>
            <p className="ms-sidebar-sub">Dashboard de carrera</p>
          </div>
        </div>

        <nav className="ms-sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`ms-nav-item ${activeTab === item.id ? 'ms-nav-item--active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <span className="ms-nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="ms-sidebar-footer">
          <a href="#artista/og-mauro" className="ms-back-link">← Ver perfil publico</a>
        </div>
      </aside>

      <main className="ms-main">
        <header className="ms-header">
          <h1 className="ms-header-title">
            {menuItems.find((m) => m.id === activeTab)?.label || 'Vista General'}
          </h1>
          <div className="ms-header-status">
            <span className="ms-status-dot" />
            <span>Activo</span>
          </div>
        </header>

        {activeTab === 'overview' && (
          <div className="ms-content">
            <div className="ms-metrics-grid">
              <MetricCard label="Oyentes mensuales" value={latest.monthly_listeners?.valor || 0} trend={12} />
              <MetricCard label="Reproducciones totales" value={latest.total_streams?.valor || 0} trend={8} />
              <MetricCard label="Seguidores Spotify" value={latest.followers_spotify?.valor || 0} trend={5} />
              <MetricCard label="Seguidores Instagram" value={latest.followers_instagram?.valor || 0} trend={15} />
              <MetricCard label="Eventos realizados" value={latest.events_performed?.valor || 0} />
              <MetricCard label="Lanzamientos" value={latest.releases_count?.valor || 0} />
            </div>

            <div className="ms-section">
              <h3 className="ms-section-title">Objetivos del mes</h3>
              <div className="ms-goals-list">
                <ProgressBar label="Reproducciones Spotify" current={85000} target={100000} color="#1DB954" />
                <ProgressBar label="Seguidores Instagram" current={5800} target={8000} color="#E1306C" />
                <ProgressBar label="Eventos este trimestre" current={2} target={4} color="#d4a843" />
              </div>
            </div>

            <div className="ms-section">
              <h3 className="ms-section-title">Actividad reciente</h3>
              <div className="ms-activity-list">
                <div className="ms-activity-item">
                  <span className="ms-activity-dot ms-activity-dot--green" />
                  <span className="ms-activity-text">Nuevo lanzamiento: Territorio</span>
                  <span className="ms-activity-date">Abr 2026</span>
                </div>
                <div className="ms-activity-item">
                  <span className="ms-activity-dot ms-activity-dot--blue" />
                  <span className="ms-activity-text">Presentacion en Festival Rio y Sabana</span>
                  <span className="ms-activity-date">Jul 2026</span>
                </div>
                <div className="ms-activity-item">
                  <span className="ms-activity-dot ms-activity-dot--gold" />
                  <span className="ms-activity-text">10,000 reproducciones en Sustancias</span>
                  <span className="ms-activity-date">Mar 2024</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'music' && (
          <div className="ms-content">
            <div className="ms-section">
              <h3 className="ms-section-title">Mis lanzamientos</h3>
              <p className="ms-section-desc">Gestiona tu discografia y monitorea el rendimiento de cada lanzamiento.</p>
              <div className="ms-table">
                <div className="ms-table-header">
                  <span>Titulo</span>
                  <span>Tipo</span>
                  <span>Fecha</span>
                  <span>Estado</span>
                </div>
                <div className="ms-table-row">
                  <span>Sustancias</span>
                  <span>Single</span>
                  <span>Mar 2024</span>
                  <span className="ms-badge ms-badge--green">Publicado</span>
                </div>
                <div className="ms-table-row">
                  <span>Bajo Cauca</span>
                  <span>Single</span>
                  <span>Ago 2024</span>
                  <span className="ms-badge ms-badge--green">Publicado</span>
                </div>
                <div className="ms-table-row">
                  <span>Rio Cauca</span>
                  <span>Single</span>
                  <span>Feb 2025</span>
                  <span className="ms-badge ms-badge--green">Publicado</span>
                </div>
                <div className="ms-table-row">
                  <span>Calle y Cultura</span>
                  <span>EP</span>
                  <span>Sep 2025</span>
                  <span className="ms-badge ms-badge--green">Publicado</span>
                </div>
                <div className="ms-table-row">
                  <span>Territorio</span>
                  <span>Single</span>
                  <span>Abr 2026</span>
                  <span className="ms-badge ms-badge--green">Publicado</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="ms-content">
            <div className="ms-section">
              <h3 className="ms-section-title">Estadisticas detalladas</h3>
              <div className="ms-stats-grid">
                <div className="ms-stat-card">
                  <span className="ms-stat-label">Reproducciones este mes</span>
                  <span className="ms-stat-value">12,500</span>
                  <span className="ms-stat-change ms-stat-change--up">+12% vs mes anterior</span>
                </div>
                <div className="ms-stat-card">
                  <span className="ms-stat-label">Tasa de retencion</span>
                  <span className="ms-stat-value">68%</span>
                  <span className="ms-stat-change ms-stat-change--up">+3% vs mes anterior</span>
                </div>
                <div className="ms-stat-card">
                  <span className="ms-stat-label">Guardados en playlists</span>
                  <span className="ms-stat-value">245</span>
                  <span className="ms-stat-change ms-stat-change--up">+18% vs mes anterior</span>
                </div>
                <div className="ms-stat-card">
                  <span className="ms-stat-label">Alcance en redes</span>
                  <span className="ms-stat-value">34,200</span>
                  <span className="ms-stat-change ms-stat-change--down">-2% vs mes anterior</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {!['overview', 'music', 'stats'].includes(activeTab) && (
          <div className="ms-content">
            <div className="ms-placeholder">
              <span className="ms-placeholder-icon">🚧</span>
              <h3>Modulo en construccion</h3>
              <p>Este modulo estara disponible proximamente.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
