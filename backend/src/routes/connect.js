const express = require('express');
const requireAuth = require('../middleware/requireAuth');
const { onboard, getStatus, refresh } = require('../controllers/connectController');

const router = express.Router();

router.post('/onboard', requireAuth, onboard);
router.get('/status', requireAuth, getStatus);
router.post('/refresh', requireAuth, refresh);

module.exports = router;
