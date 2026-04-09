const router = require('express').Router();
const c = require('../controllers/authController');
const requireAuth = require('../middleware/requireAuth');
router.post('/register', c.register);
router.post('/login', c.login);
router.post('/logout', c.logout);
router.get('/me', requireAuth, c.getMe);
module.exports = router;
