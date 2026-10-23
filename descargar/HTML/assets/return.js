/* Senytra Network — páginas de retorno del pago (success.html y cancel.html). */
(function () {
  'use strict';

  var CONFIG = window.SENYTRA_CONFIG;
  var I18N = window.SENYTRA_I18N;
  var LANGS = ['es', 'en', 'pt'];
  var USERNAME_RE = /^[A-Za-z0-9_]{3,16}$/;
  var STORAGE = { lang: 'senytra.lang', cart: 'senytra.cart', user: 'senytra.user', order: 'senytra.order' };

  function load(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch (e) { return fallback; }
  }

  function save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* almacenamiento no disponible */ }
  }

  function remove(key) {
    try { localStorage.removeItem(key); } catch (e) { /* almacenamiento no disponible */ }
  }

  var stored = load(STORAGE.lang, null);
  var nav = (navigator.language || 'es').slice(0, 2).toLowerCase();
  var lang = LANGS.indexOf(stored) !== -1 ? stored : (LANGS.indexOf(nav) !== -1 ? nav : 'es');

  function t(key) { return (I18N[lang] && I18N[lang][key]) || I18N.es[key] || key; }

  var body = document.body;
  var success = body.getAttribute('data-return') === 'success';

  document.documentElement.lang = lang;
  document.title = t(body.getAttribute('data-title')) + ' — Senytra Network';
  document.querySelectorAll('[data-i18n]').forEach(function (el) { el.textContent = t(el.getAttribute('data-i18n')); });
  document.querySelectorAll('[data-discord]').forEach(function (el) { el.href = CONFIG.discordUrl; });
  document.getElementById('year').textContent = new Date().getFullYear();

  var order = load(STORAGE.order, null) || {};
  var user = load(STORAGE.user, '');
  var player = USERNAME_RE.test(order.player || '') ? order.player : (USERNAME_RE.test(user || '') ? user : '');
  var reference = /^SN-[A-Z0-9-]+$/.test(order.reference || '') ? order.reference : '';

  if (player) {
    document.getElementById('return-head').src = CONFIG.avatarUrl.replace('{name}', encodeURIComponent(player));
    document.getElementById('return-player').textContent = player;
    document.getElementById('return-player-row').hidden = false;
  }
  if (reference) {
    document.getElementById('return-reference').textContent = reference;
    document.getElementById('return-reference-row').hidden = false;
  }
  document.getElementById('return-details').hidden = !player && !reference;

  // Tras un pago completado se vacía el carrito; si se canceló, se conserva para reintentar.
  if (success) {
    save(STORAGE.cart, []);
    remove(STORAGE.order);
  }
})();
