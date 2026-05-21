const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { register, login, logout, getMe, changePassword } = require('../controllers/authController');
const requireAuth = require('../middleware/requireAuth');

// Stricter rate limiter for auth endpoints to prevent brute-force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 10 : 100,
  message: { success: false, message: 'Too many attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public routes
router.post('/register', authLimiter, register);
router.post('/login',    authLimiter, login);

// Protected routes (require valid JWT)
router.post('/logout', requireAuth, logout);
router.get('/me', requireAuth, getMe);
router.put('/password', requireAuth, changePassword);

module.exports = router;
