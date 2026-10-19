# Senytra Network — Sitio web

Sitio oficial del servidor de Minecraft **Senytra Network** (1.8 – 1.21): página de inicio, tienda de rangos, monedas y llaves, carrito, checkout, centro de soporte y páginas legales. Está disponible en **español, inglés y portugués**.

## Tecnologías

- HTML, CSS y JavaScript sin frameworks ni paso de compilación.
- [Netlify](https://www.netlify.com) para el alojamiento, **Netlify Forms** para registrar los pedidos y **Netlify Image CDN** para servir la imagen de portada optimizada.
- Fuentes: Chakra Petch (títulos) e Inter (texto), desde Google Fonts.

## Estructura

```
public/
  index.html          Estructura de todas las pantallas
  __forms.html        Formulario oculto para que Netlify detecte "pedidos"
  favicon.svg
  img/hero.png        Imagen de portada
  assets/
    config.js         IP, Discord, correo, moneda y URL de pago
    i18n.js           Textos de la interfaz (es / en / pt)
    legal.js          Política de privacidad y términos (es / en / pt)
    catalog.js        Rangos, modalidades, precios y productos
    app.js            Navegación, idioma, tienda, carrito y checkout
    styles.css        Estilos
netlify.toml          Carpeta publicada y cabeceras de seguridad
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

## Próximo paso: cobros en línea

El checkout valida los datos y registra el pedido, pero todavía no cobra. Para activar los pagos, conecta una pasarela (por ejemplo [Tebex](https://tebex.io), muy usada por servidores de Minecraft, o PayPal) y pon su URL en `checkoutUrl` dentro de `config.js`. Una vez configurada, el jugador se redirige ahí con la referencia del pedido.
