const https = require('https');

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

/**
 * Geocode a location string (city name, postal code, address) to lat/lng.
 * Uses OpenStreetMap Nominatim (free, no API key).
 * Returns { lat, lng, city, postal_code, display_name } or null if not found.
 */
function fetchNominatim(params) {
  const qs = new URLSearchParams({ ...params, countrycodes: 'se', format: 'json', limit: '1', addressdetails: '1' });
  const url = `${NOMINATIM_URL}?${qs}`;

  return new Promise((resolve) => {
    const req = https.get(url, {
      headers: { 'User-Agent': 'HobbyJobb/1.0 (student project)' },
      timeout: 5000,
    }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const results = JSON.parse(data);
          if (!results.length) return resolve(null);

          const r = results[0];
          const addr = r.address || {};
          resolve({
            lat: parseFloat(r.lat),
            lng: parseFloat(r.lon),
            city: addr.city || addr.town || addr.village || addr.municipality || null,
            postal_code: addr.postcode || null,
            display_name: r.display_name || null,
          });
        } catch (_) {
          resolve(null);
        }
      });
    });

    req.on('error', () => resolve(null));
    req.on('timeout', () => { req.destroy(); resolve(null); });
  });
}

async function geocode(locationStr) {
  if (!locationStr || typeof locationStr !== 'string') return null;
  const trimmed = locationStr.trim();

  // Try direct search first
  let result = await fetchNominatim({ q: trimmed });
  if (result) return result;

  // If it looks like a Swedish postal code (5 digits, optional space), format and retry
  const postalMatch = trimmed.match(/^(\d{3})\s?(\d{2})$/);
  if (postalMatch) {
    const formatted = `${postalMatch[1]} ${postalMatch[2]}`;
    result = await fetchNominatim({ postalcode: formatted, country: 'Sweden' });
    if (result) return result;
    result = await fetchNominatim({ q: `${formatted} Sverige` });
    if (result) return result;
  }

  return null;
}

module.exports = { geocode };
