/**
 * PASSPORTUTILS.JS — Utilidades del Pasaporte del Territorio
 *
 * Sistema de sellos digitales que los usuarios coleccionan
 * al interactuar con contenido de cada municipio del Bajo Cauca.
 */

import { MUNICIPALITIES, MUNICIPALITY_LOCATION_MAP, normalizeText } from './constants.js';

const STORAGE_KEY = 'tejido_passport';

export { MUNICIPALITIES };

export function loadPassport() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

function savePassport(passport) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(passport));
  } catch {}
}

export function stampMunicipality(municipalityId) {
  const passport = loadPassport();
  const isNew = !passport[municipalityId];
  passport[municipalityId] = true;
  savePassport(passport);
  return isNew;
}

export function getMunicipalityFromLocation(location = '') {
  const normalized = normalizeText(location);
  for (const [muni, keywords] of Object.entries(MUNICIPALITY_LOCATION_MAP)) {
    if (keywords.some((kw) => normalized.includes(normalizeText(kw)))) {
      return muni;
    }
  }
  return 'caucasia';
}

export function getPassportProgress() {
  const passport = loadPassport();
  const total = MUNICIPALITIES.length;
  const collected = MUNICIPALITIES.filter((m) => passport[m.id]).length;
  const percentage = Math.round((collected / total) * 100);
  const isComplete = collected === total;
  return { collected, total, percentage, isComplete };
}

export function resetPassport() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}
