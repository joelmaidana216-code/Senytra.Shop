/* Configuración general del sitio. Cambia aquí los datos del servidor. */
window.SENYTRA_CONFIG = {
  serverIp: 'play.senytra.net',
  discordUrl: 'https://discord.gg/rDwhHa25s6',
  supportEmail: 'staff.senytra@gmail.com',
  currency: 'USD',
  // Función de Netlify que crea la cesta en Tebex y devuelve la URL oficial de pago
  // (netlify/functions/tebex-checkout.js). Necesita TEBEX_PUBLIC_TOKEN y TEBEX_SECRET_KEY
  // en Netlify → Site configuration → Environment variables.
  tebexEndpoint: '/api/tebex-checkout',
  // Alternativa si Tebex no está disponible: URL a la que se redirige con ?ref=<referencia>.
  // Si también está vacía, el checkout registra el pedido y deriva al jugador a soporte.
  checkoutUrl: '',
  // Cabeza de la skin del jugador ({name} = usuario de Minecraft).
  avatarUrl: 'https://mc-heads.net/avatar/{name}/64'
};
