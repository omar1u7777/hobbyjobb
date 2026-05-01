const { Op } = require('sequelize');
const stripeConfig = require('../../config/stripe.js');
const { HOBBY_ANNUAL_LIMIT, HOBBY_WARNING_THRESHOLD } = require('../../config/constants');
const { Job, User, Payment, Application, sequelize } = require('../models');

const { stripe } = stripeConfig;

const BOOST_PACKAGES = {
  standard: { price: 29, durationHours: 48, label: 'Standard Boost (48h)' },
  super:    { price: 59, durationHours: 24 * 7, label: 'Super Boost (7 dagar)' },
};

function ensureStripeReady(res) {
  if (!stripe) {
    res.status(503).json({ success: false, message: 'Payment service not configured' });
    return false;
  }
  return true;
}

function ensureDbReady(res) {
  if (!Job || !Payment || !User) {
    res.status(503).json({ success: false, message: 'Database not configured' });
    return false;
  }
  return true;
}

const createCheckout = async (req, res, next) => {
  try {
    const { jobId } = req.body;
    const userId = req.user.id;

    if (!jobId) {
      return res.status(400).json({ success: false, message: 'jobId is required' });
    }
    if (!ensureStripeReady(res) || !ensureDbReady(res)) return;

    const job = await Job.findByPk(jobId, {
      include: [{ model: User, as: 'poster', attributes: ['id', 'name'] }],
    });
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    if (job.status !== 'open') {
      return res.status(400).json({ success: false, message: 'Job is not available for payment' });
    }
    if (job.poster_id !== userId) {
      return res.status(403).json({ success: false, message: 'Only the job poster can pay for this job' });
    }

    const acceptedApplication = await Application.findOne({
      where: { job_id: jobId, status: 'accepted' },
    });
    if (!acceptedApplication) {
      return res.status(400).json({
        success: false,
        message: 'Job has no accepted applicant yet — accept an application before paying',
      });
    }

    const payeeId = acceptedApplication.applicant_id;

    const existing = await Payment.findOne({
      where: { job_id: jobId, payer_id: userId, status: { [Op.in]: ['pending', 'held'] } },
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

    const amount = Number(job.price);
    const amountInOre = stripeConfig.toOre(amount);
    const platformFeeOre = stripeConfig.calculatePlatformFee(amountInOre);
    const payeeOre = amountInOre - platformFeeOre;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInOre,
      currency: 'sek',
      metadata: {
        jobId: String(jobId),
        payerId: String(userId),
        payeeId: String(payeeId),
        platformFeePercent: String(stripeConfig.PLATFORM_FEE_PERCENT),
      },
      automatic_payment_methods: { enabled: true },
    });

    await Payment.create({
      job_id: jobId,
      payer_id: userId,
      payee_id: payeeId,
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
};

async function handlePaymentSuccess(paymentIntent) {
  if (paymentIntent.metadata?.type === 'boost') {
    if (!Job) return;
    const jobId = Number(paymentIntent.metadata.jobId);
    const durationHours = Number(paymentIntent.metadata.durationHours);
    const payerId = Number(paymentIntent.metadata.payerId);
    const job = await Job.findByPk(jobId);
    if (!job) {
      console.error('Job not found for boost:', jobId);
      return;
    }
    const now = new Date();
    const baseTime = job.boost_expires_at && new Date(job.boost_expires_at) > now
      ? new Date(job.boost_expires_at)
      : now;
    const newExpiry = new Date(baseTime.getTime() + durationHours * 60 * 60 * 1000);
    await job.update({ is_boosted: true, boost_expires_at: newExpiry });

    if (Payment && payerId) {
      const amountSek = paymentIntent.amount / 100;
      const existingBoostPayment = await Payment.findOne({
        where: { stripe_payment_id: paymentIntent.id },
      });
      if (!existingBoostPayment) {
        await Payment.create({
          job_id: jobId,
          payer_id: payerId,
          payee_id: payerId,
          amount_total: amountSek,
          amount_platform: amountSek,
          amount_payee: 0,
          stripe_payment_id: paymentIntent.id,
          status: 'released',
          confirmed_at: new Date(),
        });
      }
    }

    console.log('Boost activated for job:', jobId);
    return;
  }

  if (!Payment) return;
  const payment = await Payment.findOne({
    where: { stripe_payment_id: paymentIntent.id },
  });
  if (!payment) {
    console.error('Payment not found for intent:', paymentIntent.id);
    return;
  }
  await payment.update({ status: 'held' });
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

const webhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    if (endpointSecret && sig && stripe) {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } else if (process.env.NODE_ENV === 'production') {
      // Production: signature verification is mandatory. Without it, unverified
      // POSTs could trigger escrow release or boost activation without payment.
      console.error('Webhook rejected: missing STRIPE_WEBHOOK_SECRET or signature in production');
      return res.status(400).json({ error: 'Webhook signature required in production' });
    } else {
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
};

const confirmPayment = async (req, res, next) => {
  try {
    const { paymentIntentId } = req.body;
    if (!paymentIntentId) {
      return res.status(400).json({ success: false, message: 'paymentIntentId required' });
    }
    if (!stripe || !Payment || !Job) {
      return res.status(503).json({ success: false, message: 'Service not configured' });
    }

    const intent = await stripe.paymentIntents.retrieve(paymentIntentId);

    const payment = await Payment.findOne({
      where: { stripe_payment_id: paymentIntentId },
    });
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    if (payment.payer_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    if (intent.status === 'succeeded') {
      // Idempotent guard: only transition pending -> held once.
      // Prevents double-processing if webhook and this endpoint race.
      if (payment.status === 'pending') {
        await payment.update({ status: 'held' });
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
};

const releaseEscrow = async (req, res, next) => {
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

    if (payment.payer_id !== userId) {
      return res.status(403).json({ success: false, message: 'Only the payer can release funds' });
    }

    const transaction = await sequelize.transaction();
    try {
      await payment.update({ status: 'released', confirmed_at: new Date() }, { transaction });
      await Job.update({ status: 'completed' }, { where: { id: jobId }, transaction });

      const payee = await User.findByPk(payment.payee_id, { transaction });
      if (payee) {
        const newTotal = Number(payee.hobby_total_year || 0) + Number(payment.amount_payee);
        const newJobCount = Number(payee.hobby_job_count || 0) + 1;
        await payee.update({
          hobby_total_year: newTotal,
          hobby_job_count: newJobCount,
          hobby_warned: payee.hobby_warned || newTotal >= HOBBY_WARNING_THRESHOLD,
          hobby_limit_reached: newTotal >= HOBBY_ANNUAL_LIMIT,
        }, { transaction });
      }

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }

    // Stripe Connect Transfer would go here in production:
    //   stripe.transfers.create({ amount, currency, destination, transfer_group })

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
};

const createBoost = async (req, res, next) => {
  try {
    const { jobId, package: pkgName } = req.body;
    const userId = req.user.id;

    if (!jobId || !pkgName) {
      return res.status(400).json({ success: false, message: 'jobId and package are required' });
    }

    const pkg = BOOST_PACKAGES[pkgName];
    if (!pkg) {
      return res.status(400).json({
        success: false,
        message: `Invalid package. Use one of: ${Object.keys(BOOST_PACKAGES).join(', ')}`,
      });
    }

    if (!stripe || !Job) {
      return res.status(503).json({ success: false, message: 'Service not configured' });
    }

    const job = await Job.findByPk(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    if (job.poster_id !== userId) {
      return res.status(403).json({ success: false, message: 'Only the job owner can boost this job' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: stripeConfig.toOre(pkg.price),
      currency: 'sek',
      metadata: {
        type: 'boost',
        jobId: String(jobId),
        userId: String(userId),
        payerId: String(userId),
        boostPackage: pkgName,
        durationHours: String(pkg.durationHours),
      },
      automatic_payment_methods: { enabled: true },
    });

    res.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: pkg.price,
        package: pkgName,
        label: pkg.label,
        durationHours: pkg.durationHours,
      },
    });
  } catch (error) {
    console.error('Boost checkout error:', error);
    next(error);
  }
};

const confirmBoost = async (req, res, next) => {
  try {
    const { paymentIntentId } = req.body;
    if (!paymentIntentId) {
      return res.status(400).json({ success: false, message: 'paymentIntentId required' });
    }
    if (!stripe || !Job) {
      return res.status(503).json({ success: false, message: 'Service not configured' });
    }

    const intent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (intent.metadata?.type !== 'boost') {
      return res.status(400).json({ success: false, message: 'Not a boost PaymentIntent' });
    }

    if (Number(intent.metadata.userId) !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    if (intent.status !== 'succeeded') {
      return res.status(400).json({
        success: false,
        message: 'Payment not completed',
        stripeStatus: intent.status,
      });
    }

    const jobId = Number(intent.metadata.jobId);
    const durationHours = Number(intent.metadata.durationHours);

    const job = await Job.findByPk(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    const now = new Date();
    const baseTime = job.boost_expires_at && new Date(job.boost_expires_at) > now
      ? new Date(job.boost_expires_at)
      : now;
    const newExpiry = new Date(baseTime.getTime() + durationHours * 60 * 60 * 1000);

    await job.update({
      is_boosted: true,
      boost_expires_at: newExpiry,
    });

    if (Payment) {
      const existingBoostPayment = await Payment.findOne({
        where: { stripe_payment_id: paymentIntentId },
      });
      if (!existingBoostPayment) {
        const amountSek = intent.amount / 100;
        await Payment.create({
          job_id: jobId,
          payer_id: req.user.id,
          payee_id: req.user.id,
          amount_total: amountSek,
          amount_platform: amountSek,
          amount_payee: 0,
          stripe_payment_id: paymentIntentId,
          status: 'released',
          confirmed_at: new Date(),
        });
      }
    }

    res.json({
      success: true,
      data: {
        jobId: job.id,
        is_boosted: true,
        boost_expires_at: newExpiry,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getHistory = async (req, res, next) => {
  try {
    if (!Payment) {
      return res.status(503).json({ success: false, message: 'Database not configured' });
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
};

module.exports = {
  createCheckout,
  webhook,
  confirmPayment,
  releaseEscrow,
  createBoost,
  confirmBoost,
  getHistory,
  BOOST_PACKAGES,
};
