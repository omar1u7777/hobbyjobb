const { User } = require('../models');
const { HOBBY_ANNUAL_LIMIT, HOBBY_WARNING_THRESHOLD } = require('../../config/constants');

/**
 * Middleware: blocks payee (utforare) from exceeding annual hobby income limit.
 * Checks the target user's tracked `hobby_total_year` (updated on payment release).
 *
 * Usage: req.payeeUserId must be set by the caller (e.g. payment/release handler)
 * OR falls back to req.user.id if not provided.
 */
module.exports = async (req, res, next) => {
  try {
    const targetUserId = req.payeeUserId || req.user?.id;

    if (!targetUserId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (!User) {
      return next();
    }

    const payee = await User.findByPk(targetUserId);
    if (!payee) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const total = Number(payee.hobby_total_year || 0);

    if (total >= HOBBY_ANNUAL_LIMIT) {
      return res.status(403).json({
        success: false,
        message: `Hobbygränsen på ${HOBBY_ANNUAL_LIMIT} kr/år är nådd för denna användare.`,
      });
    }

    if (total >= HOBBY_WARNING_THRESHOLD) {
      req.hobbyWarning = {
        message: `Varning: hobbygränsen nästan nådd (${total.toFixed(2)} / ${HOBBY_ANNUAL_LIMIT} kr).`,
        total,
        limit: HOBBY_ANNUAL_LIMIT,
      };
    }

    return next();
  } catch (error) {
    return next(error);
  }
};
