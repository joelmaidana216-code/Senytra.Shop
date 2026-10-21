/*
 * Senytra Network — crea una cesta en Tebex (Headless API) y devuelve la URL oficial de pago.
 *
 * Variables de entorno (Netlify → Site configuration → Environment variables):
 *   TEBEX_PUBLIC_TOKEN  Public token de la tienda (creator.tebex.io → Developers → API Keys)
 *   TEBEX_SECRET_KEY    Private key de la tienda. Nunca debe llegar al navegador.
 *
 * Petición:  POST /api/tebex-checkout
 *   { "username": "Steve", "reference": "SN-…", "items": [{ "package": "pkg_12_456", "quantity": 2 }] }
 * Respuesta: { "checkoutUrl": "https://checkout.tebex.io/checkout/…", "basket": "…" }
 *
 * Los precios los fija Tebex: el navegador solo indica qué paquetes y cuántos.
 */
'use strict';

const API = 'https://headless.tebex.io/api';
const USERNAME_RE = /^[A-Za-z0-9_]{3,16}$/;
const PACKAGE_RE = /^[A-Za-z0-9_-]{1,64}$/;
const REFERENCE_RE = /^SN-[A-Z0-9-]{4,40}$/;
const MAX_ITEMS = 20;
const MAX_QUANTITY = 64;

function json(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
    body: JSON.stringify(body)
  };
}

function header(headers, name) {
  return (headers && (headers[name] || headers[name.toLowerCase()])) || '';
}

// Comprueba y agrupa los artículos del carrito. Devuelve null si algo no es válido.
function parseItems(items) {
  if (!Array.isArray(items) || items.length === 0 || items.length > MAX_ITEMS) return null;
  const merged = new Map();
  for (const item of items) {
    const pkg = item && item.package;
    const quantity = item && item.quantity;
    if ((typeof pkg !== 'string' && typeof pkg !== 'number') || !PACKAGE_RE.test(String(pkg))) return null;
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) return null;
    const key = String(pkg);
    const total = (merged.has(key) ? merged.get(key).quantity : 0) + quantity;
    if (total > MAX_QUANTITY) return null;
    merged.set(key, { package: pkg, quantity: total });
  }
  return Array.from(merged.values());
}

async function tebex(path, auth, body) {
  const res = await fetch(API + path, {
    method: 'POST',
    headers: { Authorization: auth, 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'method_not_allowed' });

  const token = process.env.TEBEX_PUBLIC_TOKEN;
  const secret = process.env.TEBEX_SECRET_KEY;
  if (!token || !secret) return json(503, { error: 'not_configured' });

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch (e) {
    return json(400, { error: 'invalid_json' });
  }

  const username = typeof payload.username === 'string' ? payload.username.trim() : '';
  if (!USERNAME_RE.test(username)) return json(400, { error: 'invalid_username' });

  const items = parseItems(payload.items);
  if (!items) return json(400, { error: 'invalid_items' });

  const reference = typeof payload.reference === 'string' && REFERENCE_RE.test(payload.reference) ? payload.reference : '';
  const site = (process.env.URL || 'https://' + header(event.headers, 'host')).replace(/\/$/, '');
  const ip = header(event.headers, 'x-nf-client-connection-ip') ||
    header(event.headers, 'x-forwarded-for').split(',')[0].trim();
  const auth = 'Basic ' + Buffer.from(token + ':' + secret).toString('base64');

  try {
    const basketBody = {
      username,
      complete_url: site + '/success.html',
      cancel_url: site + '/cancel.html',
      complete_auto_redirect: true,
      custom: { reference, source: 'senytra-web' }
    };
    if (ip) basketBody.ip_address = ip;

    const created = await tebex('/accounts/' + encodeURIComponent(token) + '/baskets', auth, basketBody);
    const basket = created.data && created.data.data;
    if (!created.ok || !basket || !basket.ident) {
      console.error('[tebex-checkout] No se pudo crear la cesta', created.status, created.data && (created.data.detail || created.data.title));
      return json(502, { error: 'basket_failed' });
    }

    // Se añaden en orden para que Tebex no reciba modificaciones simultáneas de la misma cesta.
    let current = basket;
    for (const item of items) {
      const added = await tebex('/baskets/' + encodeURIComponent(basket.ident) + '/packages', auth, {
        package_id: item.package,
        quantity: item.quantity
      });
      if (!added.ok) {
        console.error('[tebex-checkout] Paquete rechazado', item.package, added.status, added.data && (added.data.detail || added.data.title));
        if (added.status === 400 || added.status === 404 || added.status === 422) {
          return json(422, { error: 'invalid_package', package: item.package });
        }
        return json(502, { error: 'package_failed' });
      }
      if (added.data && added.data.data) current = added.data.data;
    }

    const checkoutUrl = current.links && current.links.checkout;
    if (!checkoutUrl) {
      console.error('[tebex-checkout] La cesta no devolvió links.checkout', basket.ident);
      return json(502, { error: 'no_checkout_url' });
    }
    return json(200, { checkoutUrl, basket: basket.ident });
  } catch (err) {
    console.error('[tebex-checkout] Error de red con Tebex:', err && err.message);
    return json(502, { error: 'tebex_unreachable' });
  }
};
