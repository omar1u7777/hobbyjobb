const { Op } = require('sequelize');
const { User, Payment } = require('../models');
const { HOBBY_ANNUAL_LIMIT, HOBBY_WARNING_THRESHOLD } = require('../../config/constants');

/**
 * Calculate a user's hobby income for the current calendar year.
 *
 * The income is earned when a payment is RELEASED (escrow -> payee). The user
 * table stores a running total in `hobby_total_year`, and the source of truth
 * is the sum of released Payments where the user was the payee this year.
 *
 * We prefer the recalculated value from Payment table (accurate, handles resets)
 * but fall back to User.hobby_total_year if Payment table is empty.
 */
async function calculateYearlyIncome(userId) {
  const startOfYear = new Date(new Date().getFullYear(), 0, 1);

  let total = 0;

  if (Payment) {
    const totalRaw = await Payment.sum('amount_payee', {
      where: {
        payee_id: userId,
        status: 'released',
        updated_at: { [Op.gte]: startOfYear },
      },
    });
    total = Number(totalRaw || 0);
  }

  // Fallback: if no Payment rows (e.g. early dev), read User's tracked field
  if (total === 0 && User) {
    const user = await User.findByPk(userId, { attributes: ['hobby_total_year'] });
    if (user) {
      total = Number(user.hobby_total_year || 0);
    }
  }

  const remaining = Math.max(HOBBY_ANNUAL_LIMIT - total, 0);
  const percentage = HOBBY_ANNUAL_LIMIT > 0 ? (total / HOBBY_ANNUAL_LIMIT) * 100 : 0;

  return {
    total: Number(total.toFixed(2)),
    remaining: Number(remaining.toFixed(2)),
    percentage: Number(Math.min(percentage, 100).toFixed(2)),
    isNearLimit: total >= HOBBY_WARNING_THRESHOLD && total < HOBBY_ANNUAL_LIMIT,
    isAtLimit: total >= HOBBY_ANNUAL_LIMIT,
  };
}

module.exports = {
  calculateYearlyIncome,
};
