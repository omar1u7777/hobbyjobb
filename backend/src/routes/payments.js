// git commit: "feat(s1): add Stripe payment routes - checkout and webhook"

const express = require('express');
const { Op } = require('sequelize');
const stripeConfig = require('../../config/stripe.js');
const requireAuth = require('../middleware/requireAuth.js');
const models = require('../models');

const { stripe, calculatePlatformFee, toOre } = stripeConfig;
const Job = models.Job;
const User = models.User;
const Payment = models.Payment;

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

    if (!jobId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'jobId and amount are required',
      });
    }

    if (!stripe) {
      return res.status(503).json({
        success: false,
        message: 'Payment service not configured',
      });
    }

    if (!Job || !Payment || !User) {
      return res.status(503).json({
        success: false,
        message: 'Database not configured',
      });
    }

    // Verify job exists and is available
    const job = await Job.findByPk(jobId, {
      include: [{ model: User, as: 'poster', attributes: ['id', 'name'] }],
    });

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    if (job.status !== 'open') {
      return res.status(400).json({
        success: false,
        message: 'Job is not available for payment',
      });
    }

    if (job.poster_id === userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot pay for your own job',
      });
    }

    // Prevent duplicates: reuse existing pending payment for this job+user
    const existing = await Payment.findOne({
      where: { job_id: jobId, payer_id: userId, status: 'pending' },
    });

    if (existing && existing.stripe_payment_id) {
      try {
        const existingIntent = await stripe.paymentIntents.retrieve(existing.stripe_payment_id);
        if (['requires_payment_method', 'requires_confirmation', 'requires_action'].includes(existingIntent.status)) {
          return res.json({
            success: true,
            data: {
              clientSecret: existingIntent.client_secret,
              paymentIntentId: existingIntent.id,
              amount: Number(existing.amount_total),
              platformFee: Number(existing.amount_platform),
              recipientAmount: Number(existing.amount_payee),
              reused: true,
            },
          });
        }
      } catch (err) {
        console.warn('Could not retrieve existing PaymentIntent, creating new one:', err.message);
      }
    }

    // Convert SEK to öre for Stripe
    const amountInOre = stripeConfig.toOre(Number(amount));
    const platformFeeOre = stripeConfig.calculatePlatformFee(amountInOre);
    const payeeOre = amountInOre - platformFeeOre;

    // Create PaymentIntent (platform holds funds until release)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInOre,
      currency: 'sek',
      metadata: {
        jobId: String(jobId),
        payerId: String(userId),
        payeeId: String(job.poster_id),
        platformFeePercent: String(stripeConfig.PLATFORM_FEE_PERCENT),
      },
      automatic_payment_methods: { enabled: true },
    });

    // Create payment record
    await Payment.create({
      job_id: jobId,
      payer_id: userId,
      payee_id: job.poster_id,
      amount_total: Number(amount),
      amount_platform: platformFeeOre / 100,
      amount_payee: payeeOre / 100,
      stripe_payment_id: paymentIntent.id,
      status: 'pending',
    });

    res.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: Number(amount),
        platformFee: platformFeeOre / 100,
        recipientAmount: payeeOre / 100,
      },
    });
  } catch (error) {
    console.error('Checkout error:', error);
    next(error);
  }
});

/**
 * POST /api/payments/webhook
 * Handle Stripe webhooks (raw body registered in server.js)
 */
router.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    if (endpointSecret && sig && stripe) {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } else {
      // Dev mode: parse raw body
      event = typeof req.body === 'string' || Buffer.isBuffer(req.body)
        ? JSON.parse(req.body.toString())
        : req.body;
    }
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentFailure(event.data.object);
        break;
      case 'charge.refunded':
        await handleRefund(event.data.object);
        break;
      default:
        console.log(`Unhandled Stripe event: ${event.type}`);
    }
    res.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

async function handlePaymentSuccess(paymentIntent) {
  if (!Payment) return;
  const payment = await Payment.findOne({
    where: { stripe_payment_id: paymentIntent.id },
  });
  if (!payment) {
    console.error('Payment not found for intent:', paymentIntent.id);
    return;
  }
  await payment.update({ status: 'held', confirmed_at: new Date() });
  if (Job) {
    await Job.update({ status: 'in_progress' }, { where: { id: payment.job_id } });
  }
  console.log('Payment held:', paymentIntent.id);
}

async function handlePaymentFailure(paymentIntent) {
  if (!Payment) return;
  const payment = await Payment.findOne({
    where: { stripe_payment_id: paymentIntent.id },
  });
  if (payment) {
    await payment.update({ status: 'failed' });
  }
  console.log('Payment failed:', paymentIntent.id);
}

async function handleRefund(charge) {
  if (!Payment) return;
  const payment = await Payment.findOne({
    where: { stripe_payment_id: charge.payment_intent },
  });
  if (payment) {
    await payment.update({ status: 'failed' });
  }
  console.log('Payment refunded:', charge.payment_intent);
}

/**
 * POST /api/payments/confirm
 * Client-side confirmation fallback (in case webhook is unreachable in dev)
 * Body: { paymentIntentId }
 * Verifies with Stripe and updates payment+job status
 */
router.post('/confirm', requireAuth, async (req, res, next) => {
  try {
    const { paymentIntentId } = req.body;
    if (!paymentIntentId) {
      return res.status(400).json({ success: false, message: 'paymentIntentId required' });
    }
    if (!stripe || !Payment || !Job) {
      return res.status(503).json({ success: false, message: 'Service not configured' });
    }

    // Verify with Stripe (source of truth)
    const intent = await stripe.paymentIntents.retrieve(paymentIntentId);

    const payment = await Payment.findOne({
      where: { stripe_payment_id: paymentIntentId },
    });
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    // Only the payer can confirm
    if (payment.payer_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    if (intent.status === 'succeeded') {
      if (payment.status === 'pending') {
        await payment.update({ status: 'held', confirmed_at: new Date() });
        await Job.update({ status: 'in_progress' }, { where: { id: payment.job_id } });
      }
      return res.json({
        success: true,
        data: { status: payment.status, paymentId: payment.id, jobId: payment.job_id },
      });
    }

    if (['canceled', 'payment_failed'].includes(intent.status)) {
      await payment.update({ status: 'failed' });
      return res.status(400).json({ success: false, message: 'Payment failed', status: intent.status });
    }

    res.json({
      success: true,
      data: { status: payment.status, stripeStatus: intent.status },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/payments/release/:jobId
 * Release escrow to payee (called by payer when job is complete)
 * In production: triggers Stripe transfer to connected account
 * Updates payee's hobby_total_year
 */
router.post('/release/:jobId', requireAuth, async (req, res, next) => {
  try {
    const jobId = Number(req.params.jobId);
    const userId = req.user.id;

    if (!Payment || !Job || !User) {
      return res.status(503).json({ success: false, message: 'Database not configured' });
    }

    const payment = await Payment.findOne({
      where: { job_id: jobId, status: 'held' },
    });

    if (!payment) {
      return res.status(404).json({ success: false, message: 'No held payment for this job' });
    }

    // Only the payer can release
    if (payment.payer_id !== userId) {
      return res.status(403).json({ success: false, message: 'Only the payer can release funds' });
    }

    // Mark released
    await payment.update({ status: 'released' });

    // Update job status
    await Job.update({ status: 'completed' }, { where: { id: jobId } });

    // Update payee hobby_total_year (income tracking)
    const payee = await User.findByPk(payment.payee_id);
    if (payee) {
      const newTotal = Number(payee.hobby_total_year || 0) + Number(payment.amount_payee);
      const newJobCount = Number(payee.hobby_job_count || 0) + 1;
      const HOBBY_LIMIT = Number(process.env.HOBBY_ANNUAL_LIMIT || 30000);
      await payee.update({
        hobby_total_year: newTotal,
        hobby_job_count: newJobCount,
        hobby_limit_reached: newTotal >= HOBBY_LIMIT,
      });
    }

    // TODO: In production with Stripe Connect, create Transfer here:
    // await stripe.transfers.create({
    //   amount: stripeConfig.toOre(payment.amount_payee),
    //   currency: 'sek',
    //   destination: payee.stripe_account_id,
    //   transfer_group: `job_${jobId}`,
    // });

    res.json({
      success: true,
      data: {
        paymentId: payment.id,
        amountReleased: Number(payment.amount_payee),
        status: 'released',
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/payments/history
 * Get payment history for logged-in user
 */
router.get('/history', requireAuth, async (req, res, next) => {
  try {
    if (!Payment) {
      return res.status(503).json({
        success: false,
        message: 'Database not configured',
      });
    }

    const userId = req.user.id;

    const payments = await Payment.findAll({
      where: {
        [Op.or]: [{ payer_id: userId }, { payee_id: userId }],
      },
      include: [
        { model: Job, as: 'job', attributes: ['id', 'title'] },
        { model: User, as: 'payer', attributes: ['id', 'name'] },
        { model: User, as: 'payee', attributes: ['id', 'name'] },
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
