const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'test-jwt-secret-for-testing-only';
process.env.JWT_SECRET = JWT_SECRET;

// ── requireAuth ────────────────────────────────────────────────────────────
describe('requireAuth middleware', () => {
  const requireAuth = require('../src/middleware/requireAuth');

  function createApp() {
    const app = express();
    app.get('/protected', requireAuth, (req, res) => {
      res.json({ success: true, userId: req.user.id });
    });
    return app;
  }

  it('should reject request with no Authorization header', async () => {
    const res = await request(createApp()).get('/protected');
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('No token provided');
  });

  it('should reject malformed Authorization header', async () => {
    const res = await request(createApp())
      .get('/protected')
      .set('Authorization', 'NotBearer sometoken');
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('No token provided');
  });

  it('should reject invalid token', async () => {
    const res = await request(createApp())
      .get('/protected')
      .set('Authorization', 'Bearer invalid.token.here');
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid token');
  });

  it('should reject expired token with specific message', async () => {
    const token = jwt.sign({ id: 1 }, JWT_SECRET, { expiresIn: '-1s' });
    const res = await request(createApp())
      .get('/protected')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Token expired');
  });

  it('should accept valid token and set req.user', async () => {
    const token = jwt.sign({ id: 42, email: 'test@test.com' }, JWT_SECRET);
    const res = await request(createApp())
      .get('/protected')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.userId).toBe(42);
  });
});

// ── requireAdmin ───────────────────────────────────────────────────────────
describe('requireAdmin middleware', () => {
  beforeEach(() => jest.resetModules());

  it('should allow access for admin user from DB', async () => {
    jest.mock('../src/models', () => ({
      User: { findByPk: jest.fn().mockResolvedValue({ is_admin: true }) },
    }));
    jest.mock('../src/middleware/requireAuth', () => (req, res, next) => {
      req.user = { id: 1 };
      next();
    });

    const requireAdmin = require('../src/middleware/requireAdmin');
    const app = express();
    app.get('/admin', requireAdmin, (req, res) => res.json({ ok: true }));

    const res = await request(app).get('/admin');
    expect(res.status).toBe(200);
  });

  it('should reject non-admin user from DB', async () => {
    jest.mock('../src/models', () => ({
      User: { findByPk: jest.fn().mockResolvedValue({ is_admin: false }) },
    }));
    jest.mock('../src/middleware/requireAuth', () => (req, res, next) => {
      req.user = { id: 2 };
      next();
    });

    const requireAdmin = require('../src/middleware/requireAdmin');
    const app = express();
    app.get('/admin', requireAdmin, (req, res) => res.json({ ok: true }));

    const res = await request(app).get('/admin');
    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Admin access required');
  });

  it('should reject if user not found in DB (deleted after JWT issued)', async () => {
    jest.mock('../src/models', () => ({
      User: { findByPk: jest.fn().mockResolvedValue(null) },
    }));
    jest.mock('../src/middleware/requireAuth', () => (req, res, next) => {
      req.user = { id: 999 };
      next();
    });

    const requireAdmin = require('../src/middleware/requireAdmin');
    const app = express();
    app.get('/admin', requireAdmin, (req, res) => res.json({ ok: true }));

    const res = await request(app).get('/admin');
    expect(res.status).toBe(403);
  });

  it('should return 503 if User model is null (DB not configured)', async () => {
    jest.mock('../src/models', () => ({ User: null }));
    jest.mock('../src/middleware/requireAuth', () => (req, res, next) => {
      req.user = { id: 1 };
      next();
    });

    const requireAdmin = require('../src/middleware/requireAdmin');
    const app = express();
    app.get('/admin', requireAdmin, (req, res) => res.json({ ok: true }));

    const res = await request(app).get('/admin');
    expect(res.status).toBe(503);
    expect(res.body.message).toBe('Database not configured');
  });
});

// ── errorHandler ───────────────────────────────────────────────────────────
describe('errorHandler middleware', () => {
  const errorHandler = require('../src/middleware/errorHandler');

  function createApp(env) {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = env;
    const app = express();
    app.get('/err', (req, res, next) => {
      const err = new Error('SQL injection attempt: SELECT * FROM users');
      err.status = 500;
      next(err);
    });
    app.get('/err-400', (req, res, next) => {
      const err = new Error('Bad request detail');
      err.status = 400;
      next(err);
    });
    app.use(errorHandler);
    // reset after response
    app.use((req, res) => { process.env.NODE_ENV = originalEnv; });
    return app;
  }

  it('should sanitize 500 errors in production', async () => {
    const res = await request(createApp('production')).get('/err');
    expect(res.status).toBe(500);
    expect(res.body.message).toBe('Internal server error');
    expect(res.body.message).not.toContain('SQL');
  });

  it('should show actual error message in development', async () => {
    const res = await request(createApp('development')).get('/err');
    expect(res.status).toBe(500);
    expect(res.body.message).toContain('SQL injection');
  });

  it('should pass through non-500 errors even in production', async () => {
    const res = await request(createApp('production')).get('/err-400');
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Bad request detail');
  });
});
