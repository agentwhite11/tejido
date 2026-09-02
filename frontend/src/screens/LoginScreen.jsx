import { useState } from 'react';

const demoAccounts = {
  admin: { email: 'admin@tejido.co', password: 'Admin123!' },
  gestor: { email: 'gestor@tejido.co', password: 'Gestor123!' },
  ciudadano: { email: 'ciudadano@tejido.co', password: 'Ciudadano123!' },
};

export default function LoginScreen({ onSuccess }) {
  const [email, setEmail] = useState(demoAccounts.gestor.email);
  const [password, setPassword] = useState(demoAccounts.gestor.password);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'No fue posible iniciar sesión');
      localStorage.setItem('tejido_token', result.token);
      onSuccess(result.user);
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="login-screen">
      <div className="login-art" aria-hidden="true"><span>Vuelve a<br /><em>conectar.</em></span><i /><i /><i /></div>
      <div className="login-panel">
        <p className="eyebrow">Bienvenido a TEJIDO</p>
        <h1>Tu territorio<br />te espera.</h1>
        <p className="login-lead">Ingresa para guardar, publicar y participar.</p>
        <form className="login-form" onSubmit={handleSubmit}>
          <label>Correo<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
          <label>Contraseña<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
          {error && <p className="login-error" role="alert">{error}</p>}
          <button className="btn btn-primary login-submit" type="submit" disabled={loading}>{loading ? 'Ingresando...' : 'Ingresar'}</button>
        </form>
        <div className="demo-accounts">
          <b>Cuentas de demostración</b>
          <small>Selecciona una cuenta para probar cada rol.</small>
          {Object.entries(demoAccounts).map(([role, account]) => (
            <button key={role} type="button" onClick={() => { setEmail(account.email); setPassword(account.password); }}>
              <strong>{role === 'admin' ? 'Administrador' : role === 'gestor' ? 'Gestor' : 'Ciudadano'}</strong>
              <span>{account.email}</span>
            </button>
          ))}
        </div>
        <a className="back-link" href="#inicio">Volver al inicio</a>
      </div>
    </section>
  );
}
