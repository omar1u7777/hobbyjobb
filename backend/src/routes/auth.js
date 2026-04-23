const express = require('express');
const router = express.Router();
const { register, login, logout, getMe, changePassword } = require('../controllers/authController');
const requireAuth = require('../middleware/requireAuth');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes (require valid JWT)
router.post('/logout', requireAuth, logout);
router.get('/me', requireAuth, getMe);
router.put('/password', requireAuth, changePassword);

module.exports = router;
