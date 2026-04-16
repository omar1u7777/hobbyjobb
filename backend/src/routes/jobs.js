const express = require('express');
const requireAuth = require('../middleware/requireAuth');
const hobbyLimitCheck = require('../middleware/hobbyLimitCheck');
const {
  getJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
  getMyJobs,
} = require('../controllers/jobController');

const router = express.Router();

// NOTE: /my must be before /:id
router.get('/my', requireAuth, getMyJobs);
router.get('/', getJobs);
router.get('/:id', getJob);
router.post('/', requireAuth, hobbyLimitCheck, createJob);
router.put('/:id', requireAuth, updateJob);
router.delete('/:id', requireAuth, deleteJob);

module.exports = router;
