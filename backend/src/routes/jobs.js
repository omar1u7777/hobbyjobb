const express = require('express');
const requireAuth = require('../middleware/requireAuth');
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
// Hobby income limit applies to the PAYEE (utforare) on payment release,
// not to the POSTER (betalare) on job creation. See payments.js `/release`.
router.get('/my', requireAuth, getMyJobs);
router.get('/', getJobs);
router.get('/:id', getJob);
router.post('/', requireAuth, createJob);
router.put('/:id', requireAuth, updateJob);
router.delete('/:id', requireAuth, deleteJob);

module.exports = router;
