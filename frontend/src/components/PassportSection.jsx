/**
 * PASSPORTSECTION.JSX — Pasaporte del Territorio
 *
 * Componente visual que muestra los sellos de los 6 municipios
 * del Bajo Cauca que el usuario ha coleccionado.
 *
 * Cada sello:
 * - Se ilumina cuando el usuario ha interactuado con contenido de ese municipio
 * - Muestra un emoji y nombre
 * - Tiene una animación de "stamping" cuando se desbloquea
 *
 * Cuando se completan los 6 sellos:
 * - Se muestra un badge "Ciudadano del Bajo Cauca"
 * - Se activa una animación de celebración
 *
 * Los sellos se persisten en localStorage.
 *
 * Parte de la FASE 5 del plan de magia.
 */

import { useState, useEffect } from 'react';
import {
  MUNICIPALITIES,
  loadPassport,
  getPassportProgress,
} from '../utils/passportUtils.js';

export default function PassportSection() {
  /** Pasaporte actual (municipios visitados) */
  const [passport, setPassport] = useState({});
  /** Progreso del pasaporte */
  const [progress, setProgress] = useState({ collected: 0, total: 6, percentage: 0, isComplete: false });

  // Cargar pasaporte al montar
  useEffect(() => {
    setPassport(loadPassport());
    setProgress(getPassportProgress());
  }, []);

  return (
    <section className="passport-section">
      {/* Encabezado del pasaporte */}
      <div className="passport-header">
        <span className="section-badge">Pasaporte</span>
        <h2 className="section-title">Tu recorrido por el Bajo Cauca</h2>
        <p className="passport-subtitle">
          Colecciona sellos de cada municipio explorando contenido de TEJIDO.
        </p>
      </div>

      {/* Barra de progreso */}
      <div className="passport-progress">
        <div className="passport-progress-bar">
          <div
            className="passport-progress-fill"
            style={{ width: `${progress.percentage}%` }}
          />
        </div>
        <span className="passport-progress-text">
          {progress.collected} de {progress.total} municipios
        </span>
      </div>

      {/* Grid de sellos */}
      <div className="passport-grid">
        {MUNICIPALITIES.map((muni) => {
          const isCollected = !!passport[muni.id];
          return (
            <div
              key={muni.id}
              className={`passport-stamp ${isCollected ? 'collected' : 'locked'}`}
              style={{
                '--stamp-color': muni.color,
                animationDelay: `${MUNICIPALITIES.indexOf(muni) * 0.1}s`,
              }}
            >
              {/* Emoji del municipio */}
              <span className="stamp-emoji">{muni.emoji}</span>
              {/* Nombre */}
              <span className="stamp-name">{muni.name}</span>
              {/* Tema */}
              <span className="stamp-theme">{muni.theme}</span>
              {/* Indicador de estado */}
              <span className="stamp-status">
                {isCollected ? '\u2713' : '\u25CB'}
              </span>
            </div>
          );
        })}
      </div>

      {/* Badge de completado */}
      {progress.isComplete && (
        <div className="passport-badge">
          <span className="badge-icon">{'\uD83C\uDFC6'}</span>
          <h3>Ciudadano del Bajo Cauca</h3>
          <p>Has explorado los 6 municipios. Tu conocimiento del territorio es completo.</p>
        </div>
      )}

      {/* Mensaje motivacional cuando está incompleto */}
      {!progress.isComplete && progress.collected > 0 && (
        <p className="passport-motivation">
          {progress.collected === 1
            ? 'Buen comienzo. Sigue explorando para completar tu pasaporte.'
            : `Llevas ${progress.collected} sellos. ${6 - progress.collected} municipios por descubrir.`}
        </p>
      )}
    </section>
  );
}
