const { Op } = require('sequelize');
const { Job } = require('../models');
const { HOBBY_ANNUAL_LIMIT, HOBBY_WARNING_THRESHOLD, JOB_STATUS } = require('../../config/constants');

module.exports = async (req, res, next) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const startOfYear = new Date(new Date().getFullYear(), 0, 1);
    const totalRaw = await Job.sum('price', {
      where: {
        poster_id: req.user.id,
        status: JOB_STATUS.COMPLETED,
        created_at: { [Op.gte]: startOfYear },
      },
    });

    const total = Number(totalRaw || 0);

    if (total >= HOBBY_ANNUAL_LIMIT) {
      return res.status(403).json({
        success: false,
        message: `Hobbygränsen på ${HOBBY_ANNUAL_LIMIT} kr/år är nådd.`,
      });
    }

    if (total >= HOBBY_WARNING_THRESHOLD) {
      req.hobbyWarning = {
        message: `Varning: du närmar dig hobbygränsen (${total.toFixed(2)} / ${HOBBY_ANNUAL_LIMIT} kr).`,
        total,
        limit: HOBBY_ANNUAL_LIMIT,
      };
    }

    return next();
  } catch (error) {
    return next(error);
  }
};
