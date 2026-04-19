// git commit: "feat(s1): add Stripe payment routes - checkout and webhook"

const express = require('express');
const { stripe, calculatePlatformFee, toOre } = require('../../config/stripe.js');
const { requireAuth } = require('../middleware/requireAuth.js');
const { Job, User, Payment } = require('../models');

const router = express.Router();

/**
 * POST /api/payments/checkout
 * Create a PaymentIntent for a job payment
 * Body: { jobId, amount }
 * Returns: { clientSecret, paymentIntentId }
 */
router.post('/checkout', requireAuth, async (req, res, next) => {
  try {
    const { jobId, amount } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!jobId || !amount) {
      return res.status(400).json({ 
        success: false, 
        message: 'jobId and amount are required' 
      });
    }

    if (!stripe) {
      return res.status(503).json({ 
        success: false, 
        message: 'Payment service not configured' 
      });
    }

    // Verify job exists and is available
    const job = await Job.findByPk(jobId, {
      include: [{ model: User, as: 'poster', attributes: ['id', 'name', 'stripe_account_id'] }],
    });

    if (!job) {
      return res.status(404).json({ 
        success: false, 
        message: 'Job not found' 
      });
    }

    if (job.status !== 'open') {
      return res.status(400).json({ 
        success: false, 
        message: 'Job is not available for payment' 
      });
    }

    // Prevent paying for own job
    if (job.poster_id === userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot pay for your own job' 
      });
    }

    // Convert SEK to öre for Stripe
    const amountInOre = toOre(Number(amount));
    const platformFee = calculatePlatformFee(amountInOre);

    // Create PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInOre,
      currency: 'sek',
      application_fee_amount: platformFee,
      metadata: {
        jobId: jobId.toString(),
        buyerId: userId.toString(),
        sellerId: job.poster_id.toString(),
        platformFeePercent: process.env.STRIPE_PLATFORM_FEE_PERCENT || '8',
      },
      automatic_payment_methods: { enabled: true },
    });

    // Create payment record in database
    await Payment.create({
      job_id: jobId,
      buyer_id: userId,
      seller_id: job.poster_id,
      amount: amount,
      platform_fee: platformFee / 100, // Store in SEK
      stripe_payment_intent_id: paymentIntent.id,
      status: 'pending',
      created_at: new Date(),
      updated_at: new Date(),
    });

    res.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: amount,
        platformFee: platformFee / 100,
        recipientAmount: (amountInOre - platformFee) / 100,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/payments/webhook
 * Handle Stripe webhooks
 * Stripe sends events here when payment status changes
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    if (endpointSecret && sig) {
      // Verify webhook signature in production
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } else {
      // In development, parse the raw body
      event = JSON.parse(req.body);
    }
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        await handlePaymentSuccess(paymentIntent);
        break;
      }
      
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        await handlePaymentFailure(paymentIntent);
        break;
      }
      
      case 'charge.refunded': {
        const charge = event.data.object;
        await handleRefund(charge);
        break;
      }
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

/**
 * Handle successful payment
 */
async function handlePaymentSuccess(paymentIntent) {
  const paymentIntentId = paymentIntent.id;
  
  // Find and update payment record
  const payment = await Payment.findOne({
    where: { stripe_payment_intent_id: paymentIntentId },
  });

  if (!payment) {
    console.error('Payment not found for intent:', paymentIntentId);
    return;
  }

  await payment.update({
    status: 'completed',
    completed_at: new Date(),
    updated_at: new Date(),
  });

  // Update job status
  await Job.update(
    { status: 'in_progress' },
    { where: { id: payment.job_id } }
  );

  console.log('Payment completed:', paymentIntentId);
}

/**
 * Handle failed payment
 */
async function handlePaymentFailure(paymentIntent) {
  const paymentIntentId = paymentIntent.id;
  
  const payment = await Payment.findOne({
    where: { stripe_payment_intent_id: paymentIntentId },
  });

  if (payment) {
    await payment.update({
      status: 'failed',
      failure_message: paymentIntent.last_payment_error?.message || 'Payment failed',
      updated_at: new Date(),
    });
  }

  console.log('Payment failed:', paymentIntentId);
}

/**
 * Handle refund
 */
async function handleRefund(charge) {
  const paymentIntentId = charge.payment_intent;
  
  const payment = await Payment.findOne({
    where: { stripe_payment_intent_id: paymentIntentId },
  });

  if (payment) {
    await payment.update({
      status: 'refunded',
      refunded_at: new Date(),
      updated_at: new Date(),
    });
  }

  console.log('Payment refunded:', paymentIntentId);
}

/**
 * GET /api/payments/history
 * Get payment history for logged-in user
 */
router.get('/history', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.id;

    const payments = await Payment.findAll({
      where: {
        [require('sequelize').Op.or]: [
          { buyer_id: userId },
          { seller_id: userId },
        ],
      },
      include: [
        { model: Job, as: 'job', attributes: ['id', 'title'] },
        { model: User, as: 'buyer', attributes: ['id', 'name'] },
        { model: User, as: 'seller', attributes: ['id', 'name'] },
      ],
      order: [['created_at', 'DESC']],
    });

    res.json({
      success: true,
      data: { payments },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
