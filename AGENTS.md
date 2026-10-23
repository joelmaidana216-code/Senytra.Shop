# AGENTS.md

## Qué es
Sitio estático de una sola página (SPA sin framework) para el servidor de Minecraft Senytra Network: inicio, tienda, carrito, checkout, soporte y páginas legales en es/en/pt. Se publica desde `HTML/` (ver `netlify.toml`). No hay `package.json` ni paso de build: no lo añadas salvo que sea imprescindible.

## Arquitectura
- `HTML/index.html` contiene el marcado de todas las "páginas" (`<section class="page" data-page="…">`) y modales (`.overlay`). Los textos estáticos usan `data-i18n`, `data-i18n-placeholder` y `data-i18n-aria`.
- Los scripts se cargan en este orden y se comunican mediante globales `window.SENYTRA_*`: `config.js` → `i18n.js` → `legal.js` → `catalog.js` → `app.js`.
- `app.js` es un IIFE. Enrutado por hash: `#/`, `#/tienda[/<categoría>]`, `#/checkout`, `#/privacidad`, `#/terminos`. Categorías: `featured`, `cosmetics` o el `id` de una entrada de `CATALOG.modes` (`global`, `survival`, `skyblock`, `pokebox`, `oneblock`). `global` (marcada con `network: true`) agrupa los rangos de toda la network y no aparece en la portada; cada entrada declara sus pestañas en `tabs`. Las rutas antiguas `global-30`/`global-perma` redirigen a `global`.
- Los productos no se guardan como objetos: se identifican con una cadena (`rank.<rango>.<30|perma>.<global|modalidad>`, `coins.<cantidad>.<modalidad>`, `key.<tipo>.<modalidad>`, `keyall.<n>.<modalidad>`) y `getProduct(id)` deriva nombre traducido, precio e icono desde `catalog.js`. Así el carrito se traduce al cambiar de idioma y los IDs obsoletos en localStorage se descartan solos. El carrito guarda líneas `{ id, qty }`; los rangos son siempre x1 y el resto admite hasta `CATALOG.maxQuantity`.
- Cada producto se asocia a un paquete de Tebex en `CATALOG.tebex[<modalidad>][rank30|rankPerma|coins|keys|keysAll][<clave>]` (ident o ID numérico).
- Persistencia solo en el navegador (localStorage): idioma, carrito y usuario de Minecraft. No hay cuentas reales: "Identificarse" solo guarda el nick (sin contraseña).
- El checkout envía el pedido a Netlify Forms (formulario `pedidos`, definido en `HTML/__forms.html`; si añades campos, añádelos también ahí). Si `config.checkoutUrl` está vacío, muestra la referencia y deriva a soporte; si tiene valor, redirige con `?ref=`.

## Convenciones
- Todo texto visible debe pasar por `t()` / `data-i18n` y existir en `es`, `en` y `pt`. Interpolación con `{variable}`.
- Escapa siempre con `esc()` cualquier valor que se inserte con `innerHTML`.
- Formato de precios con `money()` (Intl, moneda en `config.js`). Nombres de países con `Intl.DisplayNames`.
- CSS propio con variables en `:root` (sin Tailwind). Colores por producto mediante la variable `--c`.
- Nunca recopiles datos de tarjeta en el sitio: los cobros deben hacerse en la pasarela del proveedor.

## Pendiente
- Rellenar los paquetes de `CATALOG.tebex` y configurar la entrega automática (comandos) en el panel de Tebex.
- Sección de cosméticos (actualmente "Próximamente").
