export const validators = {
  required: (v) => (v?.toString().trim() ? null : 'Obligatoriskt'),
  email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v ?? '') ? null : 'Ange giltig e-post'),
  password: (v) => (/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(v ?? '') ? null : 'Minst 8 tecken med bokstav och siffra'),
  passwordMatch: (pw) => (v) => v === pw ? null : 'Matchar inte',
  price: (v) => { const n = Number(v); if (isNaN(n) || n <= 0) return 'Ange giltigt pris'; if (n > 30000) return 'Max 30 000 kr'; return null; },
  minLength: (min) => (v) => ((v ?? '').length >= min ? null : 'Minst ' + min + ' tecken'),
  run: (value, ...fns) => { for (const fn of fns) { const e = fn(value); if (e) return e; } return null; },
};
