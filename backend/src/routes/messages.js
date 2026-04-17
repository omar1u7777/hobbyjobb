const express = require('express');
const requireAuth = require('../middleware/requireAuth');
const { getMessages, sendMessage } = require('../controllers/messageController');

const router = express.Router();

router.get('/:jobId', requireAuth, getMessages);
router.post('/', requireAuth, sendMessage);

module.exports = router;
