const { Op } = require('sequelize');
const { Job } = require('../models');
const { HOBBY_ANNUAL_LIMIT, HOBBY_WARNING_THRESHOLD, JOB_STATUS } = require('../../config/constants');

async function calculateYearlyIncome(userId) {
  const startOfYear = new Date(new Date().getFullYear(), 0, 1);

  const totalRaw = await Job.sum('price', {
    where: {
      poster_id: userId,
      status: JOB_STATUS.COMPLETED,
      created_at: { [Op.gte]: startOfYear },
    },
  });

  const total = Number(totalRaw || 0);
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
