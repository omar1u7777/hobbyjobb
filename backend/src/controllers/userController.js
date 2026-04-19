const { fn, col } = require('sequelize');
const { User, Review } = require('../models');
const { HOBBY_ANNUAL_LIMIT } = require('../../config/constants');
const { calculateYearlyIncome } = require('../utils/hobbyCalculator');

const getPublicUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: {
        exclude: ['password', 'email'],
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const reviewStatsRaw = await Review.findOne({
      attributes: [
        [fn('COUNT', col('id')), 'count'],
        [fn('AVG', col('rating')), 'averageRating'],
      ],
      where: { reviewee_id: user.id },
      raw: true,
    });

    const reviewCount = Number(reviewStatsRaw?.count || 0);
    const averageRating = Number(reviewStatsRaw?.averageRating || 0);

    return res.json({
      success: true,
      data: {
        user,
        reviews: {
          count: reviewCount,
          averageRating: Number(averageRating.toFixed(2)),
        },
      },
    });
  } catch (error) {
    return next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const targetUserId = Number(req.params.id);

    if (targetUserId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You can only update your own profile' });
    }

    const user = await User.findByPk(targetUserId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const allowedFields = ['name', 'location', 'bio', 'avatar'];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update. Allowed fields: name, location, bio, avatar',
      });
    }

    await user.update(updates);

    return res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          location: user.location,
          bio: user.bio,
          avatar: user.avatar,
          is_verified: user.is_verified,
          hobby_total_year: user.hobby_total_year,
          hobby_job_count: user.hobby_job_count,
        },
      },
    });
  } catch (error) {
    return next(error);
  }
};

const getMyIncome = async (req, res, next) => {
  try {
    const income = await calculateYearlyIncome(req.user.id);

    return res.json({
      success: true,
      data: {
        ...income,
        limit: HOBBY_ANNUAL_LIMIT,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const getUserReviews = async (req, res, next) => {
  try {
    const reviews = await Review.findAll({
      where: { reviewee_id: req.params.id },
      include: [
        { model: User, as: 'reviewer', attributes: ['id', 'name', 'avatar'] },
      ],
      order: [['created_at', 'DESC']],
    });

    return res.json({
      success: true,
      data: { reviews },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getPublicUser,
  updateUser,
  getMyIncome,
  getUserReviews,
};
