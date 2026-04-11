// git commit: "feat(utils): add formatters for currency, date, distance, and rating"

/** Format Swedish SEK: 1 200 kr */
export function formatPrice(amount) {
  if (amount == null) return '—';
  return new Intl.NumberFormat('sv-SE').format(amount) + ' kr';
}

/** Short relative date: "Idag", "Igår", "3 apr" */
export function formatDate(dateStr) {
  if (!dateStr) return '';
  const d    = new Date(dateStr);
  const now  = new Date();
  const diff = Math.floor((now - d) / 86_400_000);
  if (diff === 0) return 'Idag';
  if (diff === 1) return 'Igår';
  if (diff < 7)  return `${diff} dagar sedan`;
  return d.toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' });
}

/** "1.2 km" */
export function formatDistance(km) {
  if (km == null) return '';
  return km < 1 ? `${Math.round(km * 1000)} m` : `${Number(km).toFixed(1)} km`;
}

/** ★★★★½ */
export function formatStars(rating) {
  const full  = Math.floor(rating);
  const half  = rating % 1 >= 0.5;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(5 - full - (half ? 1 : 0));
}

/** Truncate long text */
export function truncate(str, max = 120) {
  if (!str) return '';
  return str.length <= max ? str : str.slice(0, max).trimEnd() + '…';
}
