import { useState } from 'react';

const options = [
  ['gente', '👥', 'Conocer gente', 'Talentos locales', 'talento', 'hilo-saluda.png'],
  ['plan', '📅', 'Encontrar un plan', 'Eventos para hoy', 'agenda', 'hilo-descubre.png'],
  ['feedback', '📖', 'Sugerencias', 'Dar feedback', 'sugerencia', 'hilo-explica.png'],
  ['mapa', '📍', 'Recorrer Caucasia', 'Explorar el mapa', 'mapa', 'hilo-senala.png'],
  ['oportunidades', '📢', 'Convocatorias', 'Ver oportunidades', 'oportunidades', 'hilo-celebra.png'],
  ['buscar', '🔍', 'Buscar algo', 'Descubrir', 'buscar', 'hilo-descubre.png'],
  ['ajustes', '⚙️', 'Ajustes', 'Configurar', 'ajustes', 'hilo-piensa.png'],
  ['guardado', '📦', 'Mis cosas', 'Ver guardado', 'guardadas', 'hilo-lee.png'],
  ['red', '🌐', 'Red social', 'Conectar', 'red', 'hilo-teje.png'],
];

const answers = {
  sugerencia: 'Este es el buzón de atención de TEJIDO. Escribe una sugerencia, felicitación o dificultad.',
  buscar: 'Escribe lo que buscas en el campo de abajo y lo encontraré entre los hilos de Caucasia.',
  ajustes: 'Los ajustes de usuario estarán disponibles en tu perfil.',
  red: 'La red social de TEJIDO está en construcción. Pronto podrás conectar con la comunidad.',
};

export default function HiloAssistant({ publications }) {
  const [open, setOpen] = useState(false);
  const [pose, setPose] = useState('hilo-saluda.png');
  const [message, setMessage] = useState('¡Hola! Soy Hilo. ¿Te ayudo a descubrir Caucasia?');
  const [input, setInput] = useState('');
  const [conversation, setConversation] = useState([]);

  function close() {
    setOpen(false);
    setPose('hilo-saluda.png');
    setMessage('Aquí estaré cuando me necesites.');
  }

  function runAction(action, label, nextPose) {
    setPose(nextPose);
    setConversation([{ type: 'user', text: label }]);
    if (action === 'mapa' || action === 'agenda' || action === 'oportunidades' || action === 'talento' || action === 'guardadas') {
      setMessage('Te traje hasta aquí. Sigue explorando.');
      window.location.hash = action;
      setOpen(false);
      return;
    }
    setMessage(answers[action] || 'Cuéntame qué quieres hacer en TEJIDO.');
  }

  function sendMessage(event) {
    event.preventDefault();
    const text = input.trim();
    if (!text) return;
    const normalized = text.toLowerCase();
    const found = publications.find((item) => [item.title, item.summary, item.location, item.kind].filter(Boolean).join(' ').toLowerCase().includes(normalized));
    setConversation((current) => [...current, { type: 'user', text }]);
    setMessage(found ? `Encontré algo relacionado: ${found.title}` : 'Cuéntame qué quieres hacer: encontrar un evento, descubrir talento o revisar una oportunidad.');
    setPose(found ? 'hilo-descubre.png' : 'hilo-piensa.png');
    setInput('');
  }

  return (
    <section className={open ? 'virtual-assistant assistant-open' : 'virtual-assistant'} aria-label="Asistente virtual de TEJIDO">
      {!open && <div className="assistant-bubble">{message}</div>}
      {!open && <button className="assistant-toggle" type="button" onClick={() => { setOpen(true); setMessage(''); }} aria-label="Hablar con Hilo">
        <img className="assistant-character-img" src={`/images/hilo/${pose}`} alt="Hilo, asistente virtual de TEJIDO" />
        <span className="assistant-name">Habla con Hilo</span>
      </button>}
      {open && <aside className="assistant-panel" role="dialog" aria-label="Conversación con Hilo">
        <div className="hilo-toolbar"><span>HILO ESTÁ CONTIGO | Una conversación para descubrir Caucasia</span><button type="button" onClick={close} aria-label="Cerrar asistente">×</button></div>
        <div className="hilo-scene-new"><div className="hilo-avatar-wrapper"><img className="hilo-avatar" src={`/images/hilo/${pose}`} alt="Hilo, guía de TEJIDO" /></div><p className="hilo-greeting">¡Hola! Soy Hilo, tu guía de TEJIDO. Cuéntame qué quieres hacer hoy en Caucasia.</p></div>
        <div className="hilo-content">
          {conversation.map((item, index) => <p className={`hilo-message ${item.type === 'user' ? 'user-message' : 'bot-message'}`} key={`${item.text}-${index}`}>{item.text}</p>)}
          <div className="hilo-grid">{options.map(([key, icon, label, sub, action, nextPose]) => <button className={`hilo-card hilo-card-${key}`} type="button" key={key} onMouseEnter={() => setPose(nextPose)} onClick={() => runAction(action, label, nextPose)}><span className="hilo-card-art"><img src={`/images/hilo/${nextPose}`} alt="" aria-hidden="true" /></span><span className="hilo-card-icon">{icon}</span><span className="hilo-card-label">{label}</span><span className="hilo-card-sub">{sub}</span></button>)}</div>
        </div>
        <form className="assistant-form" onSubmit={sendMessage}><label className="sr-only" htmlFor="hilo-input">Cuéntaselo a Hilo</label><input id="hilo-input" value={input} onChange={(event) => setInput(event.target.value)} placeholder="Cuéntaselo a Hilo..." /><button type="submit" aria-label="Enviar">➜</button></form>
      </aside>}
    </section>
  );
}
