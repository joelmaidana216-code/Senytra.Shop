/* Catálogo de la tienda. Edita aquí rangos, precios y productos. */
window.SENYTRA_CATALOG = {
  ranks: [
    { id: 'noble',    name: 'Noble',    icon: 'shield',  color: '#94a3b8', price30: 2.99,  pricePerma: 7.99 },
    { id: 'vip',      name: 'VIP',      icon: 'star',    color: '#22c55e', price30: 4.99,  pricePerma: 12.99 },
    { id: 'vipplus',  name: 'VIP+',     icon: 'sparkle', color: '#10b981', price30: 7.99,  pricePerma: 19.99 },
    { id: 'supervip', name: 'SuperVip', icon: 'gem',     color: '#3b82f6', price30: 11.99, pricePerma: 29.99 },
    { id: 'megavip',  name: 'MegaVip',  icon: 'flame',   color: '#a855f7', price30: 16.99, pricePerma: 44.99 },
    { id: 'legend',   name: 'Legend',   icon: 'crown',   color: '#f59e0b', price30: 24.99, pricePerma: 69.99 },
    { id: 'sintra',   name: 'SinTra',   icon: 'bolt',    color: '#ef4444', price30: 39.99, pricePerma: 99.99 }
  ],

  modes: [
    { id: 'survival', name: 'Survival', icon: 'tree',   color: '#22c55e', hasKeys: true },
    { id: 'prison',   name: 'Prison',   icon: 'pick',   color: '#f59e0b', hasKeys: true },
    { id: 'oneblock', name: 'OneBlock', icon: 'cube',   color: '#14b8a6', hasKeys: true },
    { id: 'skyblock', name: 'SkyBlock', icon: 'cloud',  color: '#38bdf8', hasKeys: true },
    { id: 'bedwars',  name: 'BedWars',  icon: 'bed',    color: '#ef4444', hasKeys: false }
  ],

  coins: [
    { amount: 1000,  price: 1.99 },
    { amount: 5000,  price: 7.99, badge: 'popular' },
    { amount: 10000, price: 14.99 }
  ],

  keys: [
    { id: 'common',    price: 1.99, color: '#94a3b8' },
    { id: 'rare',      price: 3.99, color: '#3b82f6' },
    { id: 'legendary', price: 6.99, color: '#f59e0b' }
  ],

  keysAll: [
    { count: 4,  price: 9.99, badge: 'best_value' },
    { count: 10, price: 19.99 }
  ],

  // Rangos que aparecen en "Destacados" (siempre globales y permanentes)
  featured: ['sintra', 'legend', 'megavip'],

  // Países del formulario de pago (códigos ISO; el nombre se traduce automáticamente)
  countries: ['AR', 'BO', 'BR', 'CL', 'CO', 'CR', 'CU', 'DO', 'EC', 'SV', 'ES', 'US', 'GT', 'HN', 'MX', 'NI', 'PA', 'PY', 'PE', 'PT', 'PR', 'UY', 'VE']
};
