const express = require('express');
const requireAuth = require('../middleware/requireAuth');
const { createReview, getJobReviews } = require('../controllers/reviewController');

const router = express.Router();

router.post('/', requireAuth, createReview);
router.get('/job/:jobId', getJobReviews);

module.exports = router;
