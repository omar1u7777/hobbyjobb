export function formatPrice(a) { if (a == null) return '—'; return new Intl.NumberFormat('sv-SE').format(a) + ' kr'; }
export function formatDate(d) { if (!d) return ''; const dt = new Date(d); const diff = Math.floor((new Date() - dt) / 86400000); if (diff === 0) return 'Idag'; if (diff === 1) return 'Igår'; if (diff < 7) return diff + ' dagar sedan'; return dt.toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' }); }
export function formatDistance(km) { if (km == null) return ''; return km < 1 ? Math.round(km*1000) + ' m' : km.toFixed(1) + ' km'; }
