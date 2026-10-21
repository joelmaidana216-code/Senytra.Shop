# Senytra Network — Sitio web

Sitio oficial del servidor de Minecraft **Senytra Network** (1.8 – 1.21): página de inicio, tienda de rangos, monedas y llaves, carrito, checkout, centro de soporte y páginas legales. Está disponible en **español, inglés y portugués**.

## Tecnologías

- HTML, CSS y JavaScript sin frameworks ni paso de compilación.
- [Tebex Headless API](https://docs.tebex.io/developers/headless-api) para los cobros, mediante una función de Netlify.
- [Netlify](https://www.netlify.com) para el alojamiento y las funciones, **Netlify Forms** para registrar los pedidos y **Netlify Image CDN** para servir la imagen de portada optimizada.
- Fuentes: Chakra Petch (títulos) e Inter (texto), desde Google Fonts.

## Estructura

```
public/
  index.html          Estructura de todas las pantallas
  success.html        Retorno tras un pago completado en Tebex
  cancel.html         Retorno tras cancelar el pago
  __forms.html        Formulario oculto para que Netlify detecte "pedidos"
  favicon.svg
  img/hero.png        Imagen de portada
  assets/
    config.js         IP, Discord, correo, moneda y URL de pago
    i18n.js           Textos de la interfaz (es / en / pt)
    legal.js          Política de privacidad y términos (es / en / pt)
    catalog.js        Rangos, modalidades, precios, productos y paquetes de Tebex
    app.js            Navegación, idioma, tienda, carrito y checkout
    return.js         Lógica de success.html y cancel.html
    styles.css        Estilos
netlify/functions/
  tebex-checkout.js   Crea la cesta en Tebex y devuelve la URL de pago
netlify.toml          Carpeta publicada, funciones, /api/* y cabeceras
```

## Ejecutar en local

```bash
netlify dev
```

O con cualquier servidor estático apuntando a `public/` (por ejemplo `npx serve public`). La imagen de portada usa Netlify Image CDN, así que se ve mejor con `netlify dev`.

## Tareas habituales

- **Cambiar precios o productos:** edita `public/assets/catalog.js`.
- **Cambiar textos:** edita `public/assets/i18n.js`. Cada clave debe existir en los tres idiomas.
- **Cambiar IP, Discord o correo:** edita `public/assets/config.js`.
- **Ver pedidos:** panel de Netlify → *Forms* → `pedidos`. Puedes activar avisos por correo o Discord desde ahí.

## Cobros con Tebex

1. En [creator.tebex.io](https://creator.tebex.io) crea un paquete por cada producto (rangos de 30 días y permanentes por modalidad, monedas, llaves y Key All) con los mismos precios que en `catalog.js` y sus comandos de entrega.
2. Copia el ident (o ID numérico) de cada paquete en `tebex` dentro de `public/assets/catalog.js`.
3. En Netlify → *Site configuration* → *Environment variables*, añade `TEBEX_PUBLIC_TOKEN` y `TEBEX_SECRET_KEY` (Tebex → *Developers* → *API Keys*). La clave privada solo la usa `netlify/functions/tebex-checkout.js`.
4. Vuelve a desplegar. Al pulsar "Confirmar y pagar" se crea la cesta con el usuario de Minecraft, se añaden los paquetes y el jugador pasa al checkout oficial de Tebex, que vuelve a `/success.html` o `/cancel.html`.

Mientras falte algún paquete del carrito o las variables de entorno, el checkout registra el pedido en Netlify Forms y deriva al jugador a soporte (o a `checkoutUrl` si está configurada).
