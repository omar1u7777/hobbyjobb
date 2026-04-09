const { Payment } = require('../models');
const { Op } = require('sequelize');
const { HOBBY_ANNUAL_LIMIT, HOBBY_WARNING_THRESHOLD } = require('../../config/constants');
async function calculateHobbyIncome(userId) {
  const yearStart = new Date(new Date().getFullYear(), 0, 1);
  const payments = await Payment.findAll({ where: { payee_id: userId, status: 'released', confirmed_at: { [Op.gte]: yearStart } }, attributes: ['amount_payee'] });
  const totalEarned = payments.reduce((sum, p) => sum + parseFloat(p.amount_payee), 0);
  const remaining = Math.max(0, HOBBY_ANNUAL_LIMIT - totalEarned);
  return { totalEarned: Math.round(totalEarned*100)/100, limit: HOBBY_ANNUAL_LIMIT, remaining: Math.round(remaining*100)/100, percentage: Math.min(Math.round((totalEarned/HOBBY_ANNUAL_LIMIT)*100), 100), isWarned: totalEarned >= HOBBY_WARNING_THRESHOLD, isBlocked: totalEarned >= HOBBY_ANNUAL_LIMIT };
}
module.exports = { calculateHobbyIncome };
