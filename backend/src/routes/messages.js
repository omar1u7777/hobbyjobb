const express = require('express');
const requireAuth = require('../middleware/requireAuth');
const {
  getMessagesByJob,
  sendMessage,
} = require('../controllers/messageController');

const router = express.Router();

router.get('/:jobId', requireAuth, getMessagesByJob);
router.post('/', requireAuth, sendMessage);

module.exports = router;
