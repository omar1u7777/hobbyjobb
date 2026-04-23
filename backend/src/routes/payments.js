const express = require('express');
const requireAuth = require('../middleware/requireAuth.js');
const {
  createCheckout,
  webhook,
  confirmPayment,
  releaseEscrow,
  createBoost,
  confirmBoost,
  getHistory,
} = require('../controllers/paymentController.js');

const router = express.Router();

router.post('/checkout', requireAuth, createCheckout);
router.post('/webhook', webhook);
router.post('/confirm', requireAuth, confirmPayment);
router.post('/release/:jobId', requireAuth, releaseEscrow);
router.post('/boost', requireAuth, createBoost);
router.post('/boost/confirm', requireAuth, confirmBoost);
router.get('/history', requireAuth, getHistory);

module.exports = router;
