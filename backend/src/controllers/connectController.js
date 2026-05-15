const stripeConfig = require('../../config/stripe.js');
const { User } = require('../models');

const { stripe } = stripeConfig;

const onboard = async (req, res, next) => {
  try {
    if (!stripe) {
      return res.status(503).json({ success: false, message: 'Stripe not configured' });
    }

    const userId = req.user.id;

    // Fetch user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Guard: prevent duplicate accounts
    if (user.stripe_account_id) {
      return res.status(400).json({ success: false, message: 'Stripe account already exists' });
    }

    // Create Stripe Express account for Sweden
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'SE',
      capabilities: { transfers: { requested: true } },
      business_type: 'individual',
      metadata: { hobbyjobb_user_id: userId },
    });

    // Update user with Stripe account ID
    await user.update({
      stripe_account_id: account.id,
      stripe_account_status: 'pending',
    });

    // Generate AccountLink for onboarding
    const FRONTEND_URL = process.env.FRONTEND_URL || 'https://hobbyjobb.vercel.app';
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${FRONTEND_URL}/profil?connect=refresh`,
      return_url: `${FRONTEND_URL}/profil?connect=success`,
      type: 'account_onboarding',
    });

    res.json({ success: true, data: { url: accountLink.url } });
  } catch (error) {
    console.error('Connect onboarding error:', error);
    next(error);
  }
};

const getStatus = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId, {
      attributes: ['stripe_account_id', 'stripe_account_status'],
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // If user has a Stripe account, fetch actual status from Stripe
    let actualStatus = user.stripe_account_status;
    if (user.stripe_account_id && stripe) {
      try {
        const account = await stripe.accounts.retrieve(user.stripe_account_id);
        // Map Stripe status to our status values
        if (account.charges_enabled && account.payouts_enabled) {
          actualStatus = 'active';
        } else if (account.details_submitted) {
          actualStatus = 'pending';
        } else {
          actualStatus = 'none';
        }

        // Update database if status changed
        if (actualStatus !== user.stripe_account_status) {
          await user.update({ stripe_account_status: actualStatus });
        }
      } catch (stripeError) {
        console.error('Error fetching Stripe account status:', stripeError);
        // Fall back to database value if Stripe call fails
      }
    }

    res.json({
      success: true,
      data: {
        stripe_account_id: user.stripe_account_id,
        stripe_account_status: actualStatus,
      },
    });
  } catch (error) {
    next(error);
  }
};

const refresh = async (req, res, next) => {
  try {
    if (!stripe) {
      return res.status(503).json({ success: false, message: 'Stripe not configured' });
    }

    const userId = req.user.id;
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.stripe_account_id) {
      return res.status(400).json({ success: false, message: 'No Stripe account found' });
    }

    // Generate new AccountLink for resuming onboarding
    const FRONTEND_URL = process.env.FRONTEND_URL || 'https://hobbyjobb.vercel.app';
    const accountLink = await stripe.accountLinks.create({
      account: user.stripe_account_id,
      refresh_url: `${FRONTEND_URL}/profil?connect=refresh`,
      return_url: `${FRONTEND_URL}/profil?connect=success`,
      type: 'account_onboarding',
    });

    res.json({ success: true, data: { url: accountLink.url } });
  } catch (error) {
    console.error('Connect refresh error:', error);
    next(error);
  }
};

module.exports = {
  onboard,
  getStatus,
  refresh,
};
