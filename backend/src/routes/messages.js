const express = require('express');
const requireAuth = require('../middleware/requireAuth');
const { getMessages, sendMessage, getUnreadCount } = require('../controllers/messageController');

const router = express.Router();

router.get('/unread-count', requireAuth, getUnreadCount);
router.get('/:jobId', requireAuth, getMessages);
router.post('/', requireAuth, sendMessage);

module.exports = router;
