import { useState, useEffect } from 'react';

const LEVELS = {
  INICIADO: { color: '#6b7280', next: 'ACTIVO', required: 500 },
  ACTIVO: { color: '#1d8fa3', next: 'EMBAJADOR', required: 2000 },
  EMBAJADOR: { color: '#d4a843', next: 'LIDER', required: 5000 },
  LIDER: { color: '#e85d3a', next: null, required: null },
};

const ACTIVITY_ICONS = {
  INTERNAL_SHARE: '↗',
  EXTERNAL_SHARE: '↗',
  EXTERNAL_MENTION: '♪',
  EVENT_ATTEND: '◉',
  COMMUNITY_MEET: '◎',
  TEACH_TEJIDO: '◉',
  CONTENT_CREATE: '✦',
  PHOTO_PLACE: '◉',
  REFER_USER: '★',
};

export default function CollaboratorScreen({ user }) {
  const [profile, setProfile] = useState(null);
  const [rewards, setRewards] = useState([]);
  const [activityTypes, setActivityTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportForm, setReportForm] = useState({ type: '', description: '', evidence_url: '' });
  const [reportStatus, setReportStatus] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  function authHeaders() {
    const token = localStorage.getItem('tejido_token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  async function loadData() {
    try {
      const headers = authHeaders();
      const [profileRes, rewardsRes, typesRes] = await Promise.all([
        fetch('/api/collaborators/profile', { headers }),
        fetch('/api/collaborators/rewards', { headers }),
        fetch('/api/collaborators/activity-types', { headers }),
      ]);
      const profileData = await profileRes.json();
      const rewardsData = await rewardsRes.json();
      const typesData = await typesRes.json();
      setProfile(profileData);
      setRewards(rewardsData);
      setActivityTypes(typesData);
    } catch (err) {
      console.error('Error loading collaborator data:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister() {
    try {
      const res = await fetch('/api/collaborators/register', {
        method: 'POST',
        headers: authHeaders(),
      });
      const data = await res.json();
      if (res.ok) {
        loadData();
      } else {
        alert(data.message || 'Error al registrar');
      }
    } catch (err) {
      alert('Error de conexión');
    }
  }

  async function handleReport(e) {
    e.preventDefault();
    setReportStatus(null);
    try {
      const res = await fetch('/api/collaborators/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(reportForm),
      });
      const data = await res.json();
      if (res.ok) {
        setReportStatus({ type: 'success', points: data.points_earned });
        setReportForm({ type: '', description: '', evidence_url: '' });
        loadData();
        setTimeout(() => {
          setShowReportForm(false);
          setReportStatus(null);
        }, 2000);
      } else {
        setReportStatus({ type: 'error', message: data.message });
      }
    } catch (err) {
      setReportStatus({ type: 'error', message: 'Error de conexión' });
    }
  }

  async function handleRedeem(rewardId) {
    try {
      const res = await fetch('/api/collaborators/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ reward_id: rewardId }),
      });
      const data = await res.json();
      if (res.ok) {
        loadData();
      } else {
        alert(data.message || 'Error al canjear');
      }
    } catch (err) {
      alert('Error de conexión');
    }
  }

  function copyCode() {
    if (profile?.collaborator?.code) {
      navigator.clipboard.writeText(profile.collaborator.code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  }

  if (!user) {
    return (
      <section className="collab-section">
        <div className="collab-auth-required">
          <h2>Colaboradores TEJIDO</h2>
          <p>Inicia sesión para unirte al programa de colaboradores.</p>
          <a href="#login" onClick={() => sessionStorage.setItem('tejido_return_to', 'colaborador')} className="btn-primary-cultural">Iniciar Sesión</a>
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="collab-section">
        <div className="collab-loading">Cargando...</div>
      </section>
    );
  }

  if (!profile?.collaborator) {
    return (
      <section className="collab-section">
        <div className="collab-register">
          <h2>Conviértete en Colaborador</h2>
          <p>Comparte el Bajo Cauca con el mundo y acumula puntos canjeables por beneficios exclusivos.</p>
          <div className="collab-register-benefits">
            <div className="collab-benefit">
              <span className="collab-benefit-icon">↗</span>
              <span>Comparte y gana puntos</span>
            </div>
            <div className="collab-benefit">
              <span className="collab-benefit-icon">★</span>
              <span>Alcanza niveles exclusivos</span>
            </div>
            <div className="collab-benefit">
              <span className="collab-benefit-icon">◉</span>
              <span>Canjea por recompensas</span>
            </div>
          </div>
          <button className="btn-primary-cultural" onClick={handleRegister}>
            Unirme como Colaborador
          </button>
        </div>
      </section>
    );
  }

  const collab = profile.collaborator;
  const levelInfo = LEVELS[collab.level] || LEVELS.INICIADO;
  const progress = levelInfo.required ? Math.min((collab.points / levelInfo.required) * 100, 100) : 100;

  return (
    <section className="collab-section">
      <div className="collab-header">
        <h1>Mi Dashboard de Colaborador</h1>
        <p>Comparte, participa y acumula puntos</p>
      </div>

      <div className="collab-grid">
        <div className="collab-main">
          <div className="collab-points-panel">
            <div className="collab-points-big">
              <span className="collab-points-number">{collab.points}</span>
              <span className="collab-points-label">puntos</span>
            </div>
            <div className="collab-level-info">
              <span className="collab-level-badge" style={{ background: levelInfo.color }}>
                {collab.level}
              </span>
              {levelInfo.next && (
                <span className="collab-next-level">
                  {collab.points}/{levelInfo.required} para {levelInfo.next}
                </span>
              )}
            </div>
            <div className="collab-progress-bar">
              <div className="collab-progress-fill" style={{ width: `${progress}%`, background: levelInfo.color }}></div>
            </div>
          </div>

          <div className="collab-code-panel">
            <span className="collab-code-label">Tu código de referido</span>
            <div className="collab-code-row">
              <span className="collab-code-value">{collab.code}</span>
              <button className="collab-copy-btn" onClick={copyCode}>
                {copiedCode ? 'Copiado' : 'Copiar'}
              </button>
            </div>
          </div>

          <div className="collab-actions-row">
            <button className="collab-report-btn" onClick={() => setShowReportForm(!showReportForm)}>
              Reportar Actividad
            </button>
          </div>

          {showReportForm && (
            <form className="collab-report-form" onSubmit={handleReport}>
              <div className="collab-form-group">
                <label>Tipo de actividad</label>
                <select
                  value={reportForm.type}
                  onChange={e => setReportForm({ ...reportForm, type: e.target.value })}
                  required
                >
                  <option value="">Selecciona...</option>
                  {activityTypes.map(at => (
                    <option key={at.type} value={at.type}>
                      {at.name} (+{at.default_points} pts)
                    </option>
                  ))}
                </select>
              </div>
              <div className="collab-form-group">
                <label>Descripción</label>
                <textarea
                  value={reportForm.description}
                  onChange={e => setReportForm({ ...reportForm, description: e.target.value })}
                  placeholder="Cuéntanos qué hiciste..."
                  required
                />
              </div>
              <div className="collab-form-group">
                <label>Evidencia (opcional)</label>
                <input
                  type="url"
                  value={reportForm.evidence_url}
                  onChange={e => setReportForm({ ...reportForm, evidence_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              {reportStatus && (
                <div className={`collab-report-status collab-status-${reportStatus.type}`}>
                  {reportStatus.type === 'success'
                    ? `+${reportStatus.points} puntos ganados`
                    : reportStatus.message}
                </div>
              )}
              <div className="collab-form-actions">
                <button type="submit" className="btn-primary-cultural">Enviar</button>
                <button type="button" className="btn-cancel" onClick={() => setShowReportForm(false)}>Cancelar</button>
              </div>
            </form>
          )}

          <div className="collab-activity">
            <h3>Actividad Reciente</h3>
            {profile.activities.length === 0 ? (
              <p className="collab-empty">Aún no has registrado actividad</p>
            ) : (
              <div className="collab-timeline">
                {profile.activities.map(act => (
                  <div className="collab-timeline-item" key={act.id}>
                    <span className="collab-timeline-icon">{ACTIVITY_ICONS[act.type] || '·'}</span>
                    <div className="collab-timeline-content">
                      <span className="collab-timeline-desc">{act.description}</span>
                      <span className="collab-timeline-date">
                        {new Date(act.created_at).toLocaleDateString('es-CO')}
                      </span>
                    </div>
                    <span className="collab-timeline-points">+{act.points}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="collab-sidebar">
          <div className="collab-ranking">
            <h3>Ranking del Mes</h3>
            {profile.ranking.length === 0 ? (
              <p className="collab-empty">Sin datos aún</p>
            ) : (
              <div className="collab-ranking-list">
                {profile.ranking.map((r, i) => (
                  <div className={`collab-ranking-item ${r.id === collab.id ? 'collab-ranking-me' : ''}`} key={r.id}>
                    <span className="collab-ranking-pos">{i + 1}</span>
                    <span className="collab-ranking-name">{r.name}</span>
                    <span className="collab-ranking-points">{r.points}</span>
                  </div>
                ))}
                {profile.user_position && profile.user_position > 10 && (
                  <div className="collab-ranking-me-extra">
                    Tu posición: #{profile.user_position}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="collab-rewards">
            <h3>Recompensas</h3>
            <div className="collab-rewards-grid">
              {rewards.map(reward => (
                <div className="collab-reward-card" key={reward.id}>
                  <span className="collab-reward-category">{reward.category}</span>
                  <h4>{reward.name}</h4>
                  <p>{reward.description}</p>
                  <div className="collab-reward-footer">
                    <span className="collab-reward-cost">{reward.points_cost} pts</span>
                    <button
                      className="collab-redeem-btn"
                      onClick={() => handleRedeem(reward.id)}
                      disabled={collab.points < reward.points_cost}
                    >
                      Canjear
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
