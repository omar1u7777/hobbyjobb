// git commit: "feat(utils): add form validators for auth, job, and profile forms"

export const validators = {
  required: (v) => (v?.toString().trim() ? null : 'Fältet är obligatoriskt'),

  email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v ?? '') ? null : 'Ange en giltig e-postadress'),

  minLength: (min) => (v) =>
    ((v ?? '').length >= min ? null : `Minst ${min} tecken krävs`),

  maxLength: (max) => (v) =>
    ((v ?? '').length <= max ? null : `Max ${max} tecken tillåtna`),

  password: (v) =>
    /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(v ?? '')
      ? null
      : 'Lösenordet måste vara minst 8 tecken med bokstäver och siffror',

  passwordMatch: (pw) => (v) =>
    v === pw ? null : 'Lösenorden matchar inte',

  price: (v) => {
    const n = Number(v);
    if (isNaN(n) || n <= 0) return 'Ange ett giltigt pris';
    if (n > 30_000)          return 'Priset kan inte överstiga 30 000 kr (hobbyinkomstgräns)';
    return null;
  },

  /** Run an array of validators and return the first error */
  run: (value, ...fns) => {
    for (const fn of fns) {
      const err = fn(value);
      if (err) return err;
    }
    return null;
  },
};
