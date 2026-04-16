const express = require('express');
const requireAuth = require('../middleware/requireAuth');
const {
  createApplication,
  getReceivedApplications,
  getSentApplications,
  updateApplicationStatus,
} = require('../controllers/applicationController');

const router = express.Router();

router.post('/', requireAuth, createApplication);
router.get('/received', requireAuth, getReceivedApplications);
router.get('/sent', requireAuth, getSentApplications);
router.put('/:id', requireAuth, updateApplicationStatus);

module.exports = router;
