const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'test-jwt-secret-for-testing-only';
process.env.JWT_SECRET = JWT_SECRET;
process.env.JWT_EXPIRES_IN = '1h';
process.env.STRIPE_SECRET_KEY = 'sk_test_fake';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_fake';

// ── Mock models ───────────────────────────────────────────────────────────
jest.mock('../src/models', () => ({
  User: {
    findByPk: jest.fn(),
    findOne: jest.fn(),
  },
  Job: {
    findByPk: jest.fn().mockResolvedValue(null),
    update: jest.fn(),
  },
  Payment: {
    findOne: jest.fn(),
    create: jest.fn(),
    findAll: jest.fn(),
  },
  Application: {
    findOne: jest.fn(),
  },
  sequelize: {
    transaction: jest.fn(),
  },
  Sequelize: { Op: { or: Symbol.for('or'), in: Symbol.for('in') } },
}));

// ── Mock stripe config ────────────────────────────────────────────────────
jest.mock('../config/stripe.js', () => ({
  stripe: {
    paymentIntents: {
      create: jest.fn(),
      retrieve: jest.fn(),
    },
    webhooks: {
      constructEvent: jest.fn(),
    },
  },
  PLATFORM_FEE_PERCENT: 8,
  calculatePlatformFee: jest.fn((amount) => Math.round(amount * 0.08)),
  toOre: jest.fn((sek) => Math.round(sek * 100)),
  toSEK: jest.fn((ore) => ore / 100),
}));

// ── Mock constants ────────────────────────────────────────────────────────
jest.mock('../config/constants.js', () => ({
  HOBBY_ANNUAL_LIMIT: 30000,
  HOBBY_WARNING_THRESHOLD: 25000,
  HOBBY_MONTHLY_JOB_LIMIT: 20,
}));

const { User, Job, Payment, Application, sequelize } = require('../src/models');
const stripeConfig = require('../config/stripe.js');
const { stripe } = stripeConfig;

// Load router AFTER mocks are set up
const paymentsRouter = require('../src/routes/payments');

function makeToken(userId = 1, isAdmin = false) {
  return jwt.sign({ id: userId, email: 'test@test.com', is_admin: isAdmin }, JWT_SECRET);
}

function buildApp() {
  const app = express();
  app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));
  app.use(express.json());
  app.use('/api/payments', paymentsRouter);
  const errorHandler = require('../src/middleware/errorHandler');
  app.use(errorHandler);
  return app;
}

// ── Tests ─────────────────────────────────────────────────────────────────

describe('Payment Routes', () => {
  // ── CREATE CHECKOUT ─────────────────────────────────────────────────────
  describe('POST /api/payments/checkout', () => {
    it('should use job.price from DB, not request body amount', async () => {
      Job.findByPk.mockResolvedValue({
        id: 10, poster_id: 1, status: 'open', price: 500,
      });
      Application.findOne.mockResolvedValue({ applicant_id: 2, status: 'accepted' });
      Payment.findOne.mockResolvedValue(null);
      stripe.paymentIntents.create.mockResolvedValue({
        id: 'pi_new', client_secret: 'cs_test', amount: 50000,
      });
      Payment.create.mockResolvedValue({ id: 1 });

      const res = await request(buildApp())
        .post('/api/payments/checkout')
        .set('Authorization', `Bearer ${makeToken(1)}`)
        .send({ jobId: 10, amount: 1 });

      expect(res.status).toBe(200);
      expect(stripe.paymentIntents.create).toHaveBeenCalledWith(
        expect.objectContaining({ amount: 50000 })
      );
    });

    it('should reject without jobId', async () => {
      const res = await request(buildApp())
        .post('/api/payments/checkout')
        .set('Authorization', `Bearer ${makeToken(1)}`)
        .send({});

      expect(res.status).toBe(400);
    });

    it('should reject if job not found', async () => {
      Job.findByPk.mockResolvedValue(null);

      const res = await request(buildApp())
        .post('/api/payments/checkout')
        .set('Authorization', `Bearer ${makeToken(1)}`)
        .send({ jobId: 999 });

      expect(res.status).toBe(404);
    });

    it('should reject if job is not open', async () => {
      Job.findByPk.mockResolvedValue({ id: 10, poster_id: 1, status: 'completed' });

      const res = await request(buildApp())
        .post('/api/payments/checkout')
        .set('Authorization', `Bearer ${makeToken(1)}`)
        .send({ jobId: 10 });

      expect(res.status).toBe(400);
    });

    it('should reject if user is not the job poster', async () => {
      Job.findByPk.mockResolvedValue({ id: 10, poster_id: 99, status: 'open' });

      const res = await request(buildApp())
        .post('/api/payments/checkout')
        .set('Authorization', `Bearer ${makeToken(1)}`)
        .send({ jobId: 10 });

      expect(res.status).toBe(403);
    });

    it('should reject if no accepted applicant', async () => {
      Job.findByPk.mockResolvedValue({ id: 10, poster_id: 1, status: 'open' });
      Application.findOne.mockResolvedValue(null);

      const res = await request(buildApp())
        .post('/api/payments/checkout')
        .set('Authorization', `Bearer ${makeToken(1)}`)
        .send({ jobId: 10 });

      expect(res.status).toBe(400);
    });

    it('should prevent double payment by reusing existing intent', async () => {
      Job.findByPk.mockResolvedValue({ id: 10, poster_id: 1, status: 'open' });
      Application.findOne.mockResolvedValue({ applicant_id: 2 });
      Payment.findOne.mockResolvedValue({
        id: 1, stripe_payment_id: 'pi_existing', amount_total: 500,
        amount_platform: 40, amount_payee: 460,
      });
      stripe.paymentIntents.retrieve.mockResolvedValue({
        id: 'pi_existing', client_secret: 'cs_existing',
        status: 'requires_payment_method',
      });

      const res = await request(buildApp())
        .post('/api/payments/checkout')
        .set('Authorization', `Bearer ${makeToken(1)}`)
        .send({ jobId: 10 });

      expect(res.status).toBe(200);
      expect(res.body.data.reused).toBe(true);
    });
  });

  // ── CONFIRM PAYMENT ─────────────────────────────────────────────────────
  describe('POST /api/payments/confirm', () => {
    it('should transition pending -> held (NOT released)', async () => {
      const mockP = {
        id: 1, payer_id: 1, status: 'pending', job_id: 10,
        update: jest.fn(),
      };
      stripe.paymentIntents.retrieve.mockResolvedValue({ id: 'pi_123', status: 'succeeded' });
      Payment.findOne.mockResolvedValue(mockP);

      const res = await request(buildApp())
        .post('/api/payments/confirm')
        .set('Authorization', `Bearer ${makeToken(1)}`)
        .send({ paymentIntentId: 'pi_123' });

      expect(res.status).toBe(200);
      expect(mockP.update).toHaveBeenCalledWith({ status: 'held' });
    });

    it('should be idempotent — no update if already held', async () => {
      const mockP = {
        id: 1, payer_id: 1, status: 'held', job_id: 10,
        update: jest.fn(),
      };
      stripe.paymentIntents.retrieve.mockResolvedValue({ id: 'pi_123', status: 'succeeded' });
      Payment.findOne.mockResolvedValue(mockP);

      const res = await request(buildApp())
        .post('/api/payments/confirm')
        .set('Authorization', `Bearer ${makeToken(1)}`)
        .send({ paymentIntentId: 'pi_123' });

      expect(res.status).toBe(200);
      expect(mockP.update).not.toHaveBeenCalled();
    });

    it('should reject if payer_id does not match', async () => {
      Payment.findOne.mockResolvedValue({ id: 1, payer_id: 99 });
      stripe.paymentIntents.retrieve.mockResolvedValue({ id: 'pi_123', status: 'succeeded' });

      const res = await request(buildApp())
        .post('/api/payments/confirm')
        .set('Authorization', `Bearer ${makeToken(1)}`)
        .send({ paymentIntentId: 'pi_123' });

      expect(res.status).toBe(403);
    });
  });

  // ── RELEASE ESCROW ──────────────────────────────────────────────────────
  describe('POST /api/payments/release/:jobId', () => {
    it('should set confirmed_at on release', async () => {
      const mockP = {
        id: 1, payer_id: 1, payee_id: 2, amount_payee: 460, status: 'held',
        update: jest.fn(),
      };
      Payment.findOne.mockResolvedValue(mockP);
      User.findByPk.mockResolvedValue({
        hobby_total_year: 0, hobby_job_count: 0, hobby_warned: false,
        update: jest.fn(),
      });
      const tx = { commit: jest.fn(), rollback: jest.fn() };
      sequelize.transaction.mockResolvedValue(tx);

      const res = await request(buildApp())
        .post('/api/payments/release/10')
        .set('Authorization', `Bearer ${makeToken(1)}`)
        .send();

      expect(res.status).toBe(200);
      expect(mockP.update).toHaveBeenCalledWith(
        { status: 'released', confirmed_at: expect.any(Date) },
        { transaction: tx }
      );
    });

    it('should reject if no held payment exists', async () => {
      Payment.findOne.mockResolvedValue(null);

      const res = await request(buildApp())
        .post('/api/payments/release/10')
        .set('Authorization', `Bearer ${makeToken(1)}`)
        .send();

      expect(res.status).toBe(404);
    });

    it('should reject if user is not the payer', async () => {
      Payment.findOne.mockResolvedValue({ id: 1, payer_id: 99, payee_id: 2, status: 'held' });

      const res = await request(buildApp())
        .post('/api/payments/release/10')
        .set('Authorization', `Bearer ${makeToken(1)}`)
        .send();

      expect(res.status).toBe(403);
    });

    it('should update payee hobby totals', async () => {
      const mockP = {
        id: 1, payer_id: 1, payee_id: 2, amount_payee: 460, status: 'held',
        update: jest.fn(),
      };
      Payment.findOne.mockResolvedValue(mockP);
      const mockPayee = {
        hobby_total_year: 0, hobby_job_count: 0, hobby_warned: false,
        update: jest.fn(),
      };
      User.findByPk.mockResolvedValue(mockPayee);
      const tx = { commit: jest.fn(), rollback: jest.fn() };
      sequelize.transaction.mockResolvedValue(tx);

      await request(buildApp())
        .post('/api/payments/release/10')
        .set('Authorization', `Bearer ${makeToken(1)}`)
        .send();

      expect(mockPayee.update).toHaveBeenCalledWith(
        expect.objectContaining({
          hobby_total_year: 460,
          hobby_job_count: 1,
        }),
        { transaction: tx }
      );
    });

    it('should set hobby_limit_reached when total >= 30000', async () => {
      const mockP = {
        id: 1, payer_id: 1, payee_id: 2, amount_payee: 5000, status: 'held',
        update: jest.fn(),
      };
      Payment.findOne.mockResolvedValue(mockP);
      const mockPayee = {
        hobby_total_year: 28000, hobby_job_count: 5, hobby_warned: true,
        update: jest.fn(),
      };
      User.findByPk.mockResolvedValue(mockPayee);
      const tx = { commit: jest.fn(), rollback: jest.fn() };
      sequelize.transaction.mockResolvedValue(tx);

      await request(buildApp())
        .post('/api/payments/release/10')
        .set('Authorization', `Bearer ${makeToken(1)}`)
        .send();

      expect(mockPayee.update).toHaveBeenCalledWith(
        expect.objectContaining({ hobby_limit_reached: true }),
        { transaction: tx }
      );
    });
  });

  // ── WEBHOOK ─────────────────────────────────────────────────────────────
  describe('POST /api/payments/webhook', () => {
    it('should reject unsigned webhooks in production', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const app = express();
      app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));
      app.use(express.json());
      const router = require('../src/routes/payments');
      app.use('/api/payments', router);
      const errorHandler = require('../src/middleware/errorHandler');
      app.use(errorHandler);

      const res = await request(app)
        .post('/api/payments/webhook')
        .set('stripe-signature', '')
        .send(JSON.stringify({ type: 'payment_intent.succeeded', data: { object: {} } }));

      expect(res.status).toBe(400);
      process.env.NODE_ENV = originalEnv;
    });
  });

  // ── GET HISTORY ─────────────────────────────────────────────────────────
  describe('GET /api/payments/history', () => {
    it('should return payment history for authenticated user', async () => {
      Payment.findAll.mockResolvedValue([
        { id: 1, amount_total: 500, status: 'held' },
      ]);

      const res = await request(buildApp())
        .get('/api/payments/history')
        .set('Authorization', `Bearer ${makeToken(1)}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should reject unauthenticated request', async () => {
      const res = await request(buildApp())
        .get('/api/payments/history');

      expect(res.status).toBe(401);
    });
  });
});
