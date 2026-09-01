/**
 * Helper Functions - Utilidades comunes
 */
const HELPERS = (() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const escapeHTML = (value = '') => {
    return String(value).replace(/[&<>"']/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[char]));
  };

  const toast = (message) => {
    const el = $('#toast');
    if (!el) return;
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(toast.timeout);
    toast.timeout = setTimeout(() => el.classList.remove('show'), 2800);
  };

  const normalizeText = (value = '') => {
    return String(value).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  };

  const parseLocalDate = (value) => {
    if (!value) return null;
    const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    return dateOnly
      ? new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]))
      : new Date(value);
  };

  const formatDate = (value) => {
    const date = parseLocalDate(value);
    if (!date || Number.isNaN(date.getTime())) return 'Para descubrir';
    return new Intl.DateTimeFormat('es-CO', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  const dateTimeInput = (value) => {
    if (!value) return '';
    return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value + 'T23:59' : value.slice(0, 16);
  };

  return {
    $, $$, escapeHTML, toast, normalizeText, parseLocalDate, formatDate, dateTimeInput
  };
})();

window.HELPERS = HELPERS;
