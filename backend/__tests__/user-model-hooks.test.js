/**
 * Unit tests för User-modellens beforeValidate-hook som normaliserar email.
 *
 * Testar hook-funktionen direkt utan att kräva en faktisk DB-anslutning.
 * Hooken extraheras från model-factoryns options-argument via en stub:ad
 * sequelize.define-mock.
 *
 * Bakgrund: Tidigare i prod fanns rader med mixed-case email
 * (`Omaralhaek978@gmail.com`) vilket bröt login eftersom controllern
 * lowercase:ar input men Postgres `=` är case-sensitive. Hooken garanterar
 * att email alltid lagras lowercase oavsett källa (controller, seed, script).
 */

const userFactory = require('../src/models/User');

const extractBeforeValidateHook = () => {
  const define = jest.fn().mockReturnValue({});
  const fakeSequelize = { define };
  userFactory(fakeSequelize);
  expect(define).toHaveBeenCalledTimes(1);
  const [, , options] = define.mock.calls[0];
  expect(options).toBeDefined();
  expect(options.hooks).toBeDefined();
  expect(typeof options.hooks.beforeValidate).toBe('function');
  return options.hooks.beforeValidate;
};

describe('User model — beforeValidate email normalization hook', () => {
  let hook;

  beforeAll(() => {
    hook = extractBeforeValidateHook();
  });

  it('should lowercase a mixed-case email', () => {
    const user = { email: 'Foo@Example.COM' };
    hook(user);
    expect(user.email).toBe('foo@example.com');
  });

  it('should trim leading and trailing whitespace', () => {
    const user = { email: '  user@example.com  ' };
    hook(user);
    expect(user.email).toBe('user@example.com');
  });

  it('should both lowercase and trim in one pass', () => {
    const user = { email: '  OMAR@HOBBYJOBB.SE\t' };
    hook(user);
    expect(user.email).toBe('omar@hobbyjobb.se');
  });

  it('should leave already-normalized email untouched', () => {
    const user = { email: 'already@lower.com' };
    hook(user);
    expect(user.email).toBe('already@lower.com');
  });

  it('should not throw if email is undefined', () => {
    const user = { name: 'no email yet' };
    expect(() => hook(user)).not.toThrow();
    expect(user.email).toBeUndefined();
  });

  it('should not throw if email is null', () => {
    const user = { email: null };
    expect(() => hook(user)).not.toThrow();
    expect(user.email).toBeNull();
  });

  it('should ignore non-string email values without throwing', () => {
    const user = { email: 12345 };
    expect(() => hook(user)).not.toThrow();
    expect(user.email).toBe(12345);
  });

  it('should not modify other fields on the user', () => {
    const user = {
      email: 'Foo@Bar.COM',
      name: 'Omar',
      hobby_total_year: 1012,
      is_admin: false,
    };
    hook(user);
    expect(user.name).toBe('Omar');
    expect(user.hobby_total_year).toBe(1012);
    expect(user.is_admin).toBe(false);
  });
});
