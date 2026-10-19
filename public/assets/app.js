/* Senytra Network — lógica del sitio (navegación, idioma, tienda, carrito y checkout). */
(function () {
  'use strict';

  var CONFIG = window.SENYTRA_CONFIG;
  var I18N = window.SENYTRA_I18N;
  var LEGAL = window.SENYTRA_LEGAL;
  var CATALOG = window.SENYTRA_CATALOG;

  var LANGS = ['es', 'en', 'pt'];
  var LOCALES = { es: 'es-419', en: 'en-US', pt: 'pt-BR' };
  var USERNAME_RE = /^[A-Za-z0-9_]{3,16}$/;
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  var STORAGE = { lang: 'senytra.lang', cart: 'senytra.cart', user: 'senytra.user' };

  var state = {
    lang: 'es',
    cart: [],
    user: '',
    page: 'home',
    category: 'featured',
    tab: 'ranks'
  };

  /* ---------- Utilidades ---------- */

  function $(id) { return document.getElementById(id); }

  function esc(value) {
    return String(value).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function t(key, vars) {
    var str = (I18N[state.lang] && I18N[state.lang][key]) || I18N.es[key] || key;
    if (vars) {
      str = str.replace(/\{(\w+)\}/g, function (m, name) { return name in vars ? vars[name] : m; });
    }
    return str;
  }

  function load(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch (e) { return fallback; }
  }

  function save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* almacenamiento no disponible */ }
  }

  function money(amount) {
    try {
      return new Intl.NumberFormat(LOCALES[state.lang], {
        style: 'currency', currency: CONFIG.currency, currencyDisplay: 'narrowSymbol'
      }).format(amount);
    } catch (e) {
      return '$' + amount.toFixed(2);
    }
  }

  function number(n) {
    return new Intl.NumberFormat(LOCALES[state.lang], { useGrouping: true }).format(n);
  }

  /* ---------- Iconos ---------- */

  var ICONS = {
    shield: '<path d="M12 3 4 6v6c0 4.4 3.4 8.3 8 9 4.6-.7 8-4.6 8-9V6l-8-3Z"/>',
    star: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z"/>',
    sparkle: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>',
    gem: '<path d="M6 3h12l3 6-9 12L3 9l3-6Z"/><path d="M3 9h18M12 21 8 9l4-6 4 6-4 12"/>',
    flame: '<path d="M12 22c4 0 7-2.8 7-7 0-4-3-6.5-4-10-2 2-3 4-3 6-1-1-2-2-2.5-4C7 9 5 11.5 5 15c0 4.2 3 7 7 7Z"/>',
    crown: '<path d="m3 7 4.5 4L12 4l4.5 7L21 7l-2 12H5L3 7Z"/>',
    bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z"/>',
    key: '<circle cx="8" cy="15" r="4"/><path d="m10.8 12.2 9.2-9.2M17 6l3 3M14 9l2 2"/>',
    coin: '<circle cx="12" cy="12" r="9"/><path d="M15 9.5c-.5-1-1.6-1.5-3-1.5-1.7 0-3 .9-3 2s1.3 1.7 3 2 3 .9 3 2-1.3 2-3 2c-1.4 0-2.5-.5-3-1.5M12 6v2M12 16v2"/>',
    chest: '<rect x="3" y="8" width="18" height="12" rx="1.5"/><path d="M3 12h18M5 8V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v2M12 11v3"/>',
    tree: '<path d="M12 22v-6M7 16h10l-3-4h2l-4-5-4 5h2l-3 4Z"/>',
    pick: '<path d="M14 6c3-2 6-1 7 0-3 0-5 1-7 3M14 6c-2-1-5-2-9 0 2 0 4 1 5 2M12 8 3 21"/>',
    cube: '<path d="M12 2 21 7v10l-9 5-9-5V7l9-5Z"/><path d="m3 7 9 5 9-5M12 12v10"/>',
    cloud: '<path d="M7 18a4 4 0 0 1-.5-8A6 6 0 0 1 18 9a4.5 4.5 0 0 1-.5 9H7Z"/>',
    bed: '<path d="M3 18V7M3 13h18v5M21 13a3 3 0 0 0-3-3h-7v3M7 11.5a1.5 1.5 0 1 0 0-.01"/>',
    grid: '<rect x="4" y="4" width="7" height="7" rx="1"/><rect x="13" y="4" width="7" height="7" rx="1"/><rect x="4" y="13" width="7" height="7" rx="1"/><rect x="13" y="13" width="7" height="7" rx="1"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
    trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
    check: '<path d="m5 12 5 5 9-10"/>'
  };

  function icon(name, cls) {
    return '<svg class="' + (cls || 'icon') + '" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + (ICONS[name] || '') + '</svg>';
  }

  /* ---------- Catálogo ---------- */

  function findRank(id) { return CATALOG.ranks.filter(function (r) { return r.id === id; })[0]; }
  function findMode(id) { return CATALOG.modes.filter(function (m) { return m.id === id; })[0]; }

  // Los identificadores de producto codifican el producto y su modalidad, p. ej. "rank.vip.30.global" o "coins.5000.prison".
  function getProduct(id) {
    var parts = String(id).split('.');
    var kind = parts[0];
    var modeId = parts[parts.length - 1];
    var mode = modeId === 'global' ? null : findMode(modeId);
    if (modeId !== 'global' && !mode) return null;
    var modeName = mode ? mode.name : t('product.scope_global');

    if (kind === 'rank') {
      var rank = findRank(parts[1]);
      var perma = parts[2] === 'perma';
      if (!rank || (parts[2] !== '30' && !perma)) return null;
      return {
        id: id,
        kind: 'rank',
        name: t('product.rank', { rank: rank.name, duration: t(perma ? 'store.permanent' : 'store.days30') }) + ' · ' + modeName,
        title: rank.name,
        tag: t(perma ? 'store.permanent' : 'store.days30'),
        desc: mode ? t('store.scope_mode', { mode: mode.name }) : t('store.scope_global'),
        price: perma ? rank.pricePerma : rank.price30,
        color: rank.color,
        icon: rank.icon
      };
    }
    if (!mode) return null;

    if (kind === 'coins') {
      var pack = CATALOG.coins.filter(function (c) { return String(c.amount) === parts[1]; })[0];
      if (!pack) return null;
      var coinsName = t('product.coins', { amount: number(pack.amount) });
      return { id: id, kind: 'coins', name: coinsName + ' · ' + mode.name, title: coinsName, desc: t('store.coins_desc', { mode: mode.name }), price: pack.price, color: '#eab308', icon: 'coin', badge: pack.badge };
    }
    if (kind === 'key' && mode.hasKeys) {
      var key = CATALOG.keys.filter(function (k) { return k.id === parts[1]; })[0];
      if (!key) return null;
      var keyName = t('product.key_' + key.id);
      return { id: id, kind: 'key', name: keyName + ' · ' + mode.name, title: keyName, desc: t('store.key_desc', { mode: mode.name }), price: key.price, color: key.color, icon: 'key' };
    }
    if (kind === 'keyall' && mode.hasKeys) {
      var bundle = CATALOG.keysAll.filter(function (k) { return String(k.count) === parts[1]; })[0];
      if (!bundle) return null;
      var bundleName = t('product.keyall', { count: bundle.count });
      return { id: id, kind: 'keyall', name: bundleName + ' · ' + mode.name, title: bundleName, desc: t('store.keysall_desc', { count: bundle.count, mode: mode.name }), price: bundle.price, color: '#10b981', icon: 'chest', badge: bundle.badge };
    }
    return null;
  }

  /* ---------- Idioma ---------- */

  function detectLang() {
    var stored = load(STORAGE.lang, null);
    if (LANGS.indexOf(stored) !== -1) return stored;
    var nav = (navigator.language || 'es').slice(0, 2).toLowerCase();
    return LANGS.indexOf(nav) !== -1 ? nav : 'es';
  }

  function applyStaticTexts() {
    document.documentElement.lang = state.lang;
    document.title = t('meta.title');
    var meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', t('meta.description'));

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      el.textContent = t(el.getAttribute('data-i18n'));
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
      el.setAttribute('placeholder', t(el.getAttribute('data-i18n-placeholder')));
    });
    document.querySelectorAll('[data-i18n-aria]').forEach(function (el) {
      el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria')));
    });
    $('lang-select').value = state.lang;
  }

  function setLang(lang) {
    if (LANGS.indexOf(lang) === -1) return;
    state.lang = lang;
    save(STORAGE.lang, lang);
    renderAll();
  }

  /* ---------- Avisos ---------- */

  function toast(message, type) {
    var region = $('toasts');
    var el = document.createElement('div');
    el.className = 'toast' + (type ? ' toast-' + type : '');
    el.setAttribute('role', type === 'error' ? 'alert' : 'status');
    el.innerHTML = icon(type === 'error' ? 'shield' : 'check') + '<span></span>';
    el.querySelector('span').textContent = message;
    region.appendChild(el);
    requestAnimationFrame(function () { el.classList.add('show'); });
    setTimeout(function () {
      el.classList.remove('show');
      setTimeout(function () { el.remove(); }, 300);
    }, 3200);
  }

  /* ---------- Ventanas modales ---------- */

  var lastFocus = null;

  function openModal(id) {
    lastFocus = document.activeElement;
    var overlay = $(id);
    overlay.hidden = false;
    document.body.classList.add('no-scroll');
    requestAnimationFrame(function () { overlay.classList.add('open'); });
    var focusable = overlay.querySelector('input, button:not([data-action="close"]), a[href]');
    if (focusable) focusable.focus();
  }

  function closeModal(overlay) {
    if (!overlay || overlay.hidden) return;
    overlay.classList.remove('open');
    overlay.hidden = true;
    if (!document.querySelector('.overlay:not([hidden])')) document.body.classList.remove('no-scroll');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function closeAllModals() {
    document.querySelectorAll('.overlay:not([hidden])').forEach(closeModal);
  }

  /* ---------- Navegación ---------- */

  var ROUTES = { '': 'home', tienda: 'store', checkout: 'checkout', privacidad: 'privacy', terminos: 'terms' };

  function parseRoute() {
    var parts = location.hash.replace(/^#\/?/, '').split('/');
    var page = ROUTES[parts[0]] || 'home';
    if (page === 'store') {
      var cat = parts[1] || 'featured';
      var valid = ['featured', 'global-30', 'global-perma', 'cosmetics'].indexOf(cat) !== -1 || findMode(cat);
      var nextCat = valid ? cat : 'featured';
      if (nextCat !== state.category) state.tab = 'ranks';
      state.category = nextCat;
    }
    if (page === 'checkout' && state.cart.length === 0) {
      toast(t('checkout.empty_redirect'), 'error');
      location.replace('#/tienda');
      return;
    }
    var changed = page !== state.page;
    state.page = page;
    closeAllModals();
    renderPage();
    if (changed) window.scrollTo(0, 0);
  }

  function renderPage() {
    document.querySelectorAll('.page').forEach(function (el) {
      el.hidden = el.getAttribute('data-page') !== state.page;
    });
    document.querySelectorAll('[data-nav]').forEach(function (el) {
      var active = el.getAttribute('data-nav') === state.page;
      el.classList.toggle('active', active);
      if (active) el.setAttribute('aria-current', 'page'); else el.removeAttribute('aria-current');
    });
    if (state.page === 'store') renderStore();
    if (state.page === 'checkout') renderCheckout();
    if (state.page === 'privacy') renderLegal('privacy');
    if (state.page === 'terms') renderLegal('terms');
  }

  /* ---------- Inicio ---------- */

  function renderModes() {
    $('modes-grid').innerHTML = CATALOG.modes.map(function (m) {
      return '<a class="mode-card" href="#/tienda/' + m.id + '" style="--c:' + m.color + '">' +
        '<span class="mode-icon">' + icon(m.icon) + '</span>' +
        '<h3>' + esc(m.name) + '</h3>' +
        '<p>' + esc(t('mode.' + m.id)) + '</p>' +
        '<span class="mode-link">' + esc(t('home.modes_view')) + ' →</span>' +
        '</a>';
    }).join('');
  }

  function copyIp() {
    var ip = CONFIG.serverIp;
    var done = function () { toast(t('home.ip_copied'), 'success'); };
    var fail = function () { toast(t('home.ip_copy_failed', { ip: ip })); };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(ip).then(done, fail);
    } else {
      fail();
    }
  }

  /* ---------- Tienda ---------- */

  function renderCatNav() {
    var c = state.category;
    function link(cat, label, ic, sub) {
      var active = c === cat;
      return '<a href="#/tienda/' + cat + '" class="cat-link' + (sub ? ' sub' : '') + (active ? ' active' : '') + '"' + (active ? ' aria-current="page"' : '') + '>' +
        (ic ? icon(ic) : '') + '<span>' + esc(label) + '</span></a>';
    }
    var html = link('featured', t('store.featured'), 'star');
    html += '<div class="cat-group"><span class="cat-label">' + icon('globe') + esc(t('store.global_ranks')) + '</span>' +
      link('global-30', t('store.global_30'), null, true) +
      link('global-perma', t('store.global_perma'), null, true) + '</div>';
    html += '<div class="cat-group"><span class="cat-label">' + icon('grid') + esc(t('store.modalities')) + '</span>' +
      CATALOG.modes.map(function (m) { return link(m.id, m.name, null, true); }).join('') + '</div>';
    html += link('cosmetics', t('store.cosmetics'), 'sparkle');
    $('cat-nav').innerHTML = html;
  }

  function productCard(p) {
    var inCart = state.cart.indexOf(p.id) !== -1;
    var badge = p.badge ? '<span class="ribbon">' + esc(t('store.' + p.badge)) + '</span>' : '';
    return '<article class="product-card' + (p.badge ? ' highlighted' : '') + '" style="--c:' + p.color + '">' +
      badge +
      '<div class="product-art">' + icon(p.icon, 'product-icon') + '</div>' +
      '<div class="product-body">' +
        '<div class="product-head"><h3>' + esc(p.title) + '</h3>' + (p.tag ? '<span class="chip">' + esc(p.tag) + '</span>' : '') + '</div>' +
        '<p class="product-desc">' + esc(p.desc) + '</p>' +
        '<div class="product-foot">' +
          '<span class="price">' + esc(money(p.price)) + '</span>' +
          '<button type="button" class="btn ' + (inCart ? 'btn-ghost' : 'btn-primary') + ' btn-sm" data-add="' + esc(p.id) + '"' + (inCart ? ' disabled' : '') + '>' +
            (inCart ? icon('check') + esc(t('store.in_cart')) : esc(t('store.add_to_cart'))) +
          '</button>' +
        '</div>' +
      '</div>' +
    '</article>';
  }

  function grid(ids, title) {
    var cards = ids.map(getProduct).filter(Boolean).map(productCard).join('');
    return '<section class="product-section">' + (title ? '<h3 class="product-section-title">' + esc(title) + '</h3>' : '') +
      '<div class="product-grid">' + cards + '</div></section>';
  }

  function rankIds(duration, scope) {
    return CATALOG.ranks.map(function (r) { return 'rank.' + r.id + '.' + duration + '.' + scope; });
  }

  function renderStore() {
    renderCatNav();
    var cat = state.category;
    var title = $('category-title');
    var desc = $('category-desc');
    var tabs = $('modality-tabs');
    var container = $('products-container');
    var mode = findMode(cat);
    tabs.hidden = !mode;

    if (cat === 'featured') {
      title.textContent = t('store.featured_title');
      desc.textContent = t('store.featured_desc');
      container.innerHTML = grid(CATALOG.featured.map(function (id) { return 'rank.' + id + '.perma.global'; }));
    } else if (cat === 'global-30' || cat === 'global-perma') {
      var d = cat === 'global-30' ? '30' : 'perma';
      title.textContent = t(cat === 'global-30' ? 'store.global_30_title' : 'store.global_perma_title');
      desc.textContent = t('store.global_desc');
      container.innerHTML = grid(rankIds(d, 'global'));
    } else if (cat === 'cosmetics') {
      title.textContent = t('store.cosmetics');
      desc.textContent = t('store.cosmetics_desc');
      container.innerHTML = '<div class="empty-state">' + icon('sparkle', 'empty-icon') +
        '<h3>' + esc(t('store.coming_soon')) + '</h3><p>' + esc(t('store.coming_soon_desc')) + '</p>' +
        '<a class="btn btn-discord" href="' + esc(CONFIG.discordUrl) + '" target="_blank" rel="noopener noreferrer">Discord</a></div>';
    } else if (mode) {
      title.textContent = mode.name;
      desc.textContent = t('store.mod_desc', { mode: mode.name });
      var available = ['ranks', 'currency'].concat(mode.hasKeys ? ['keys', 'keysall'] : []);
      if (available.indexOf(state.tab) === -1) state.tab = 'ranks';
      var tabLabels = { ranks: 'store.tab_ranks', currency: 'store.tab_currency', keys: 'store.tab_keys', keysall: 'store.tab_keysall' };
      tabs.innerHTML = available.map(function (key) {
        var selected = key === state.tab;
        return '<button type="button" role="tab" class="tab' + (selected ? ' active' : '') + '" aria-selected="' + selected + '" data-tab="' + key + '">' + esc(t(tabLabels[key])) + '</button>';
      }).join('');

      if (state.tab === 'ranks') {
        container.innerHTML = grid(rankIds('30', mode.id), t('store.ranks_30_title', { mode: mode.name })) +
          grid(rankIds('perma', mode.id), t('store.ranks_perma_title', { mode: mode.name }));
      } else if (state.tab === 'currency') {
        container.innerHTML = grid(CATALOG.coins.map(function (c) { return 'coins.' + c.amount + '.' + mode.id; }));
      } else if (state.tab === 'keys') {
        container.innerHTML = grid(CATALOG.keys.map(function (k) { return 'key.' + k.id + '.' + mode.id; }));
      } else {
        container.innerHTML = grid(CATALOG.keysAll.map(function (k) { return 'keyall.' + k.count + '.' + mode.id; }));
      }
    }
  }

  /* ---------- Carrito ---------- */

  function cartProducts() {
    return state.cart.map(getProduct).filter(Boolean);
  }

  function cartTotal() {
    return cartProducts().reduce(function (sum, p) { return sum + p.price; }, 0);
  }

  function addToCart(id) {
    var product = getProduct(id);
    if (!product) return;
    if (state.cart.indexOf(id) !== -1) { toast(t('cart.already')); return; }
    state.cart.push(id);
    save(STORAGE.cart, state.cart);
    renderCart();
    if (state.page === 'store') renderStore();
    toast(t('cart.added', { name: product.name }), 'success');
  }

  function removeFromCart(id) {
    state.cart = state.cart.filter(function (x) { return x !== id; });
    save(STORAGE.cart, state.cart);
    renderCart();
    if (state.page === 'store') renderStore();
    if (state.page === 'checkout') {
      if (state.cart.length === 0) location.hash = '#/tienda'; else renderCheckout();
    }
  }

  function renderCart() {
    var products = cartProducts();
    $('cart-count').textContent = products.length;
    $('cart-count').classList.toggle('has-items', products.length > 0);
    var body = $('cart-items');
    var checkoutBtn = document.querySelector('[data-action="checkout"]');
    checkoutBtn.disabled = products.length === 0;

    if (products.length === 0) {
      body.innerHTML = '<div class="empty-state small">' + icon('chest', 'empty-icon') +
        '<h3>' + esc(t('cart.empty')) + '</h3><p>' + esc(t('cart.empty_desc')) + '</p>' +
        '<a href="#/tienda" class="btn btn-ghost" data-action="close">' + esc(t('cart.browse')) + '</a></div>';
    } else {
      body.innerHTML = '<ul class="cart-list">' + products.map(function (p) {
        return '<li class="cart-item" style="--c:' + p.color + '">' +
          '<span class="cart-thumb">' + icon(p.icon) + '</span>' +
          '<span class="cart-info"><span class="cart-name">' + esc(p.name) + '</span><span class="cart-price">' + esc(money(p.price)) + '</span></span>' +
          '<button type="button" class="icon-btn danger" data-remove="' + esc(p.id) + '" aria-label="' + esc(t('cart.remove') + ': ' + p.name) + '" title="' + esc(t('cart.remove')) + '">' + icon('trash') + '</button>' +
          '</li>';
      }).join('') + '</ul>';
    }
    $('cart-total').textContent = money(cartTotal());
  }

  /* ---------- Identificación ---------- */

  function renderAccount() {
    $('account-label').textContent = state.user || t('account.identify');
    $('account-logout').hidden = !state.user;
    updateAvatar(state.user);
  }

  function updateAvatar(name) {
    var valid = USERNAME_RE.test(name || '');
    $('account-avatar').src = 'https://mc-heads.net/avatar/' + encodeURIComponent(valid ? name : 'MHF_Steve') + '/64';
  }

  function setUser(name) {
    state.user = name;
    save(STORAGE.user, name);
    renderAccount();
  }

  /* ---------- Checkout ---------- */

  function renderCountries() {
    var select = $('form-country');
    var current = select.value;
    var names;
    try { names = new Intl.DisplayNames([LOCALES[state.lang]], { type: 'region' }); } catch (e) { names = null; }
    var list = CATALOG.countries.map(function (code) { return { code: code, name: names ? names.of(code) : code }; });
    list.sort(function (a, b) { return a.name.localeCompare(b.name, LOCALES[state.lang]); });
    select.innerHTML = '<option value="">' + esc(t('checkout.country_placeholder')) + '</option>' +
      list.map(function (c) { return '<option value="' + c.code + '">' + esc(c.name) + '</option>'; }).join('') +
      '<option value="OTHER">' + esc(t('checkout.country_other')) + '</option>';
    select.value = current;
  }

  function renderCheckout() {
    var products = cartProducts();
    $('checkout-items').innerHTML = products.map(function (p) {
      return '<li><span>' + esc(p.name) + '</span><span class="summary-actions"><strong>' + esc(money(p.price)) + '</strong>' +
        '<button type="button" class="icon-btn danger sm" data-remove="' + esc(p.id) + '" aria-label="' + esc(t('cart.remove') + ': ' + p.name) + '">' + icon('trash') + '</button></span></li>';
    }).join('');
    $('checkout-total').textContent = money(cartTotal());
    var mc = $('form-mc');
    if (!mc.value && state.user) mc.value = state.user;
  }

  function showFormError(message, field) {
    var box = $('form-error');
    box.textContent = message;
    box.hidden = false;
    if (field) { field.focus(); field.setAttribute('aria-invalid', 'true'); }
  }

  function orderReference() {
    return 'SN-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
  }

  function submitCheckout(event) {
    event.preventDefault();
    var form = event.target;
    form.querySelectorAll('[aria-invalid]').forEach(function (el) { el.removeAttribute('aria-invalid'); });
    $('form-error').hidden = true;

    var mc = $('form-mc');
    var email = $('form-email');
    var country = $('form-country');
    var payment = form.querySelector('input[name="payment"]:checked');
    var terms = $('form-terms');

    if (!USERNAME_RE.test(mc.value.trim())) return showFormError(t('checkout.err_mc'), mc);
    if (!EMAIL_RE.test(email.value.trim())) return showFormError(t('checkout.err_email'), email);
    if (!country.value) return showFormError(t('checkout.err_country'), country);
    if (!payment) return showFormError(t('checkout.err_payment'), form.querySelector('input[name="payment"]'));
    if (!terms.checked) return showFormError(t('checkout.err_terms'), terms);

    var products = cartProducts();
    var reference = orderReference();
    var player = mc.value.trim();
    var methodLabel = payment.value === 'paypal' ? 'PayPal' : t('checkout.card');
    setUser(player);

    var submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;

    // Registra el pedido en Netlify Forms para que el staff lo vea en el panel de Netlify.
    var data = new URLSearchParams({
      'form-name': 'pedidos',
      reference: reference,
      minecraft: player,
      email: email.value.trim(),
      country: country.value,
      payment: payment.value,
      items: products.map(function (p) { return p.id + ' — ' + p.name + ' — ' + p.price.toFixed(2); }).join('\n'),
      total: cartTotal().toFixed(2) + ' ' + CONFIG.currency,
      language: state.lang
    });

    fetch('/__forms.html', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: data.toString()
    }).catch(function () { /* el pedido se muestra igualmente al jugador */ }).then(function () {
      submitBtn.disabled = false;
      if (CONFIG.checkoutUrl) {
        toast(t('order.redirecting'));
        var url = CONFIG.checkoutUrl + (CONFIG.checkoutUrl.indexOf('?') === -1 ? '?' : '&') + 'ref=' + encodeURIComponent(reference);
        window.location.href = url;
        return;
      }
      $('order-body').innerHTML =
        '<dl class="order-details">' +
          '<div><dt>' + esc(t('order.reference')) + '</dt><dd class="mono">' + esc(reference) + '</dd></div>' +
          '<div><dt>' + esc(t('order.player')) + '</dt><dd>' + esc(player) + '</dd></div>' +
          '<div><dt>' + esc(t('order.method')) + '</dt><dd>' + esc(methodLabel) + '</dd></div>' +
          '<div><dt>' + esc(t('cart.total')) + '</dt><dd class="accent">' + esc(money(cartTotal())) + '</dd></div>' +
        '</dl>' +
        '<p class="muted">' + esc(t('order.manual')) + '</p>';
      openModal('order-modal');
    });
  }

  /* ---------- Páginas legales ---------- */

  function renderLegal(kind) {
    var doc = LEGAL[state.lang] || LEGAL.es;
    var page = doc[kind];
    var links = {
      discord: '<a href="' + esc(CONFIG.discordUrl) + '" target="_blank" rel="noopener noreferrer">' + esc(CONFIG.discordUrl.replace(/^https?:\/\//, '')) + '</a>',
      email: '<a href="mailto:' + esc(CONFIG.supportEmail) + '">' + esc(CONFIG.supportEmail) + '</a>'
    };
    function rich(text) {
      return esc(text).replace(/\{(discord|email)\}/g, function (m, k) { return links[k]; });
    }
    var html = '<h1 class="page-title">' + esc(page.title) + '</h1><p class="muted">' + esc(doc.updated) + '</p>';
    page.sections.forEach(function (s) {
      html += '<section><h2>' + esc(s.h) + '</h2>';
      if (s.p) html += '<p>' + rich(s.p) + '</p>';
      if (s.list) html += '<ul>' + s.list.map(function (li) { return '<li>' + rich(li) + '</li>'; }).join('') + '</ul>';
      html += '</section>';
    });
    html += '<p class="legal-footer">' + esc(page.footer) + '</p>';
    $(kind + '-content').innerHTML = html;
  }

  /* ---------- Render general ---------- */

  function renderAll() {
    applyStaticTexts();
    renderModes();
    renderCart();
    renderAccount();
    renderCountries();
    renderPage();
  }

  /* ---------- Eventos ---------- */

  function bindEvents() {
    $('lang-select').addEventListener('change', function (e) { setLang(e.target.value); });

    document.addEventListener('click', function (e) {
      var target = e.target.closest('[data-action], [data-add], [data-remove], [data-tab]');
      if (!target) {
        if (e.target.classList && e.target.classList.contains('overlay')) closeModal(e.target);
        return;
      }
      if (target.hasAttribute('data-add')) return addToCart(target.getAttribute('data-add'));
      if (target.hasAttribute('data-remove')) return removeFromCart(target.getAttribute('data-remove'));
      if (target.hasAttribute('data-tab')) { state.tab = target.getAttribute('data-tab'); return renderStore(); }

      switch (target.getAttribute('data-action')) {
        case 'copy-ip': copyIp(); break;
        case 'open-cart': openModal('cart-modal'); break;
        case 'open-support': openModal('support-modal'); break;
        case 'open-account':
          $('account-user').value = state.user;
          $('account-error').hidden = true;
          updateAvatar(state.user);
          openModal('account-modal');
          break;
        case 'checkout':
          if (state.cart.length) { closeAllModals(); location.hash = '#/checkout'; }
          break;
        case 'close': closeModal(target.closest('.overlay')); break;
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        var open = document.querySelectorAll('.overlay:not([hidden])');
        if (open.length) closeModal(open[open.length - 1]);
      }
    });

    var avatarTimer;
    $('account-user').addEventListener('input', function (e) {
      clearTimeout(avatarTimer);
      var value = e.target.value.trim();
      avatarTimer = setTimeout(function () { updateAvatar(value); }, 350);
    });

    $('account-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var name = $('account-user').value.trim();
      if (!USERNAME_RE.test(name)) {
        $('account-error').textContent = t('account.invalid');
        $('account-error').hidden = false;
        $('account-user').focus();
        return;
      }
      setUser(name);
      closeModal($('account-modal'));
      toast(t('account.welcome', { name: name }), 'success');
    });

    $('account-logout').addEventListener('click', function () {
      setUser('');
      $('account-user').value = '';
      closeModal($('account-modal'));
      toast(t('account.logged_out'));
    });

    $('checkout-form').addEventListener('submit', submitCheckout);
    window.addEventListener('hashchange', parseRoute);
  }

  /* ---------- Inicio ---------- */

  function init() {
    state.lang = detectLang();
    state.cart = (load(STORAGE.cart, []) || []).filter(function (id) { return getProduct(id); });
    var user = load(STORAGE.user, '');
    state.user = USERNAME_RE.test(user || '') ? user : '';
    $('server-ip').textContent = CONFIG.serverIp;
    $('year').textContent = new Date().getFullYear();
    bindEvents();
    renderAll();
    parseRoute();
  }

  init();
})();
