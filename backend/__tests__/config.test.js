// ── Stripe config ──────────────────────────────────────────────────────────
describe('Stripe config', () => {
  beforeEach(() => jest.resetModules());

  it('should return null stripe client when STRIPE_SECRET_KEY is not set', () => {
    delete process.env.STRIPE_SECRET_KEY;
    const config = require('../config/stripe.js');
    expect(config.stripe).toBeNull();
  });

  it('should create stripe client when STRIPE_SECRET_KEY is set', () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_123';
    const config = require('../config/stripe.js');
    expect(config.stripe).toBeDefined();
    expect(config.stripe).not.toBeNull();
  });

  it('should calculate platform fee correctly (8%)', () => {
    delete process.env.STRIPE_SECRET_KEY;
    const config = require('../config/stripe.js');
    // 500 SEK = 50000 öre → 8% = 4000 öre
    expect(config.calculatePlatformFee(50000)).toBe(4000);
  });

  it('should convert SEK to öre correctly', () => {
    delete process.env.STRIPE_SECRET_KEY;
    const config = require('../config/stripe.js');
    expect(config.toOre(500)).toBe(50000);
    expect(config.toOre(29)).toBe(2900);
  });

  it('should convert öre to SEK correctly', () => {
    delete process.env.STRIPE_SECRET_KEY;
    const config = require('../config/stripe.js');
    expect(config.toSEK(50000)).toBe(500);
  });

  it('should use custom fee percent from env', () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_123';
    process.env.STRIPE_PLATFORM_FEE_PERCENT = '10';
    const config = require('../config/stripe.js');
    expect(config.PLATFORM_FEE_PERCENT).toBe(10);
    expect(config.calculatePlatformFee(10000)).toBe(1000);
    delete process.env.STRIPE_PLATFORM_FEE_PERCENT;
  });
});

// ── Database config ───────────────────────────────────────────────────────
describe('Database config', () => {
  beforeEach(() => jest.resetModules());

  it('should enable SSL for remote DATABASE_URL (Render)', () => {
    process.env.DATABASE_URL = 'postgresql://user:pass@dpg-abc.render.com:5432/db';
    const config = require('../config/database.js');
    expect(config.development.dialectOptions.ssl).toBeDefined();
    expect(config.development.dialectOptions.ssl.require).toBe(true);
  });

  it('should enable SSL for Supabase DATABASE_URL', () => {
    process.env.DATABASE_URL = 'postgresql://user:pass@db.supabase.co:5432/postgres';
    const config = require('../config/database.js');
    expect(config.development.dialectOptions.ssl).toBeDefined();
    expect(config.development.dialectOptions.ssl.require).toBe(true);
  });

  it('should NOT enable SSL for localhost DATABASE_URL', () => {
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/hobbyjobb_dev';
    const config = require('../config/database.js');
    expect(config.development.dialectOptions).toEqual({});
  });

  it('should NOT enable SSL for 127.0.0.1 DATABASE_URL', () => {
    process.env.DATABASE_URL = 'postgresql://user:pass@127.0.0.1:5432/hobbyjobb_dev';
    const config = require('../config/database.js');
    expect(config.development.dialectOptions).toEqual({});
  });

  it('should always enable SSL in production config', () => {
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db';
    const config = require('../config/database.js');
    expect(config.production.dialectOptions.ssl.require).toBe(true);
  });

  it('should always enable SSL in test config', () => {
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db';
    const config = require('../config/database.js');
    expect(config.test.dialectOptions.ssl.require).toBe(true);
  });
});
