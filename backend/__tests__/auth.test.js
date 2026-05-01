const request = require('supertest');
const { createApp } = require('./helpers/createApp');

// ── Mocks ────────────────────────────────────────────────────────────────
jest.mock('../src/models', () => {
  const mockUser = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    password: '$2b$10$hashedpassword',
    location: 'Stockholm',
    bio: null,
    avatar: null,
    is_admin: false,
    is_verified: true,
    hobby_total_year: 0,
    hobby_job_count: 0,
    hobby_warned: false,
    hobby_limit_reached: false,
    created_at: new Date(),
    update: jest.fn(),
  };

  return {
    User: {
      findOne: jest.fn(),
      findByPk: jest.fn(),
      create: jest.fn(),
    },
    Job: null,
    Payment: null,
    Application: null,
    sequelize: { transaction: jest.fn() },
  };
});

jest.mock('bcrypt', () => ({
  genSalt: jest.fn().mockResolvedValue('$2b$10$salt'),
  hash: jest.fn().mockResolvedValue('$2b$10$hashedpassword'),
  compare: jest.fn(),
}));

const jwt = require('jsonwebtoken');
const { User } = require('../src/models');
const bcrypt = require('bcrypt');

const JWT_SECRET = 'test-jwt-secret-for-testing-only';
process.env.JWT_SECRET = JWT_SECRET;
process.env.JWT_EXPIRES_IN = '1h';

// Build app with real auth router (controllers use mocked models)
const authRouter = require('../src/routes/auth');
const app = createApp({ authRouter });

// ── Tests ─────────────────────────────────────────────────────────────────

describe('Auth Routes', () => {
  beforeEach(() => jest.clearAllMocks());

  // ── REGISTER ────────────────────────────────────────────────────────────
  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      User.findOne.mockResolvedValue(null); // no existing user
      User.create.mockResolvedValue({
        id: 1,
        name: 'Omar',
        email: 'omar@example.com',
        password: '$2b$10$hashed',
        location: 'Kristianstad',
        bio: null,
        avatar: null,
        is_admin: false,
        is_verified: true,
        hobby_total_year: 0,
        hobby_job_count: 0,
        hobby_warned: false,
        hobby_limit_reached: false,
        created_at: new Date(),
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Omar', email: 'omar@example.com', password: 'secret123' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe('omar@example.com');
    });

    it('should normalize email to lowercase', async () => {
      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue({
        id: 2, name: 'Test', email: 'upper@example.com', password: 'x',
        location: null, bio: null, avatar: null, is_admin: false,
        is_verified: true, hobby_total_year: 0, hobby_job_count: 0,
        hobby_warned: false, hobby_limit_reached: false, created_at: new Date(),
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test', email: 'UPPER@Example.COM', password: 'secret123' });

      expect(res.status).toBe(201);
      // The email passed to User.findOne should be lowercase
      expect(User.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ where: { email: 'upper@example.com' } })
      );
    });

    it('should reject missing fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Omar' }); // missing email + password

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject invalid email format', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Omar', email: 'not-an-email', password: 'secret123' });

      expect(res.status).toBe(400);
    });

    it('should reject short password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Omar', email: 'omar@example.com', password: '12345' });

      expect(res.status).toBe(400);
    });

    it('should reject duplicate email', async () => {
      User.findOne.mockResolvedValue({ id: 1, email: 'omar@example.com' });

      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Omar', email: 'omar@example.com', password: 'secret123' });

      expect(res.status).toBe(409);
    });

    it('should trim whitespace from email', async () => {
      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue({
        id: 3, name: 'Trim', email: 'trim@example.com', password: 'x',
        location: null, bio: null, avatar: null, is_admin: false,
        is_verified: true, hobby_total_year: 0, hobby_job_count: 0,
        hobby_warned: false, hobby_limit_reached: false, created_at: new Date(),
      });

      await request(app)
        .post('/api/auth/register')
        .send({ name: 'Trim', email: '  trim@example.com  ', password: 'secret123' });

      expect(User.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ where: { email: 'trim@example.com' } })
      );
    });
  });

  // ── LOGIN ───────────────────────────────────────────────────────────────
  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const mockUser = {
        id: 1, name: 'Omar', email: 'omar@example.com',
        password: '$2b$10$hashed', location: null, bio: null, avatar: null,
        is_admin: false, is_verified: true, hobby_total_year: 0,
        hobby_job_count: 0, hobby_warned: false, hobby_limit_reached: false,
        created_at: new Date(),
      };
      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'omar@example.com', password: 'secret123' });

      expect(res.status).toBe(200);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe('omar@example.com');
    });

    it('should normalize email to lowercase on login', async () => {
      User.findOne.mockResolvedValue(null); // user not found

      await request(app)
        .post('/api/auth/login')
        .send({ email: 'OMAR@EXAMPLE.COM', password: 'secret123' });

      expect(User.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ where: { email: 'omar@example.com' } })
      );
    });

    it('should reject wrong password', async () => {
      User.findOne.mockResolvedValue({
        id: 1, email: 'omar@example.com', password: '$2b$10$hashed',
      });
      bcrypt.compare.mockResolvedValue(false);

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'omar@example.com', password: 'wrongpassword' });

      expect(res.status).toBe(401);
    });

    it('should reject non-existent user', async () => {
      User.findOne.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nobody@example.com', password: 'secret123' });

      expect(res.status).toBe(401);
    });

    it('should reject missing fields', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'omar@example.com' }); // no password

      expect(res.status).toBe(400);
    });
  });

  // ── GET /ME ─────────────────────────────────────────────────────────────
  describe('GET /api/auth/me', () => {
    it('should return user with valid token', async () => {
      const token = jwt.sign({ id: 1, email: 'omar@example.com', is_admin: false }, JWT_SECRET);
      User.findByPk.mockResolvedValue({
        id: 1, name: 'Omar', email: 'omar@example.com', location: null,
        bio: null, avatar: null, is_admin: false, is_verified: true,
        hobby_total_year: 0, hobby_job_count: 0, hobby_warned: false,
        hobby_limit_reached: false, created_at: new Date(),
      });

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.user.email).toBe('omar@example.com');
    });

    it('should reject request without token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });

    it('should reject expired token with specific message', async () => {
      const token = jwt.sign({ id: 1 }, JWT_SECRET, { expiresIn: '-1s' });
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Token expired');
    });

    it('should reject invalid token with specific message', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer totally.invalid.token');

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Invalid token');
    });
  });

  // ── CHANGE PASSWORD ─────────────────────────────────────────────────────
  describe('PUT /api/auth/password', () => {
    it('should change password with valid current password', async () => {
      const token = jwt.sign({ id: 1, email: 'omar@example.com', is_admin: false }, JWT_SECRET);
      const mockUser = { id: 1, password: '$2b$10$old', update: jest.fn() };
      User.findByPk.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);

      const res = await request(app)
        .put('/api/auth/password')
        .set('Authorization', `Bearer ${token}`)
        .send({ currentPassword: 'oldpass', newPassword: 'newpass123' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(mockUser.update).toHaveBeenCalled();
    });

    it('should reject wrong current password', async () => {
      const token = jwt.sign({ id: 1, email: 'omar@example.com', is_admin: false }, JWT_SECRET);
      User.findByPk.mockResolvedValue({ id: 1, password: '$2b$10$old' });
      bcrypt.compare.mockResolvedValue(false);

      const res = await request(app)
        .put('/api/auth/password')
        .set('Authorization', `Bearer ${token}`)
        .send({ currentPassword: 'wrong', newPassword: 'newpass123' });

      expect(res.status).toBe(401);
    });

    it('should reject short new password', async () => {
      const token = jwt.sign({ id: 1, email: 'omar@example.com', is_admin: false }, JWT_SECRET);
      User.findByPk.mockResolvedValue({ id: 1, password: '$2b$10$old' });
      bcrypt.compare.mockResolvedValue(true);

      const res = await request(app)
        .put('/api/auth/password')
        .set('Authorization', `Bearer ${token}`)
        .send({ currentPassword: 'oldpass', newPassword: '12345' });

      expect(res.status).toBe(400);
    });
  });
});
