const express = require('express');
const requireAuth = require('../middleware/requireAuth');
const {
	getMessages,
	sendMessage,
	getUnreadCount,
	getConversations,
	markConversationAsRead,
} = require('../controllers/messageController');

const router = express.Router();

router.get('/conversations', requireAuth, getConversations);
router.get('/unread-count', requireAuth, getUnreadCount);
router.patch('/:jobId/read', requireAuth, markConversationAsRead);
router.get('/:jobId', requireAuth, getMessages);
router.post('/', requireAuth, sendMessage);

module.exports = router;
