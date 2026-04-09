const { User, Review, Job } = require('../models');
const { success, error } = require('../utils/responseHelper');
const { calculateHobbyIncome } = require('../utils/hobbyCalculator');
module.exports = {
  async getProfile(req, res, next) {
    try { const user = await User.findByPk(req.params.id, { attributes: { exclude: ['password'] } }); if (!user) return error(res, 'User not found', 404); return success(res, { user }); } catch (err) { next(err); }
  },
  async updateProfile(req, res, next) {
    try {
      if (parseInt(req.params.id) !== req.user.id) return error(res, 'Not authorized', 403);
      const { name, bio, location, lat, lng, avatar } = req.body;
      const user = await User.findByPk(req.user.id);
      await user.update({ ...(name&&{name}), ...(bio!==undefined&&{bio}), ...(location!==undefined&&{location}), ...(lat!==undefined&&{lat}), ...(lng!==undefined&&{lng}), ...(avatar!==undefined&&{avatar}) });
      return success(res, { message: 'Profile updated', user: { ...user.toJSON(), password: undefined } });
    } catch (err) { next(err); }
  },
  async getReviews(req, res, next) {
    try { const reviews = await Review.findAll({ where: { reviewee_id: req.params.id }, include: [{ model: User, as: 'reviewer', attributes: ['id','name','avatar'] }, { model: Job, as: 'job', attributes: ['id','title'] }], order: [['created_at','DESC']] }); return success(res, { reviews }); } catch (err) { next(err); }
  },
  async getIncome(req, res, next) {
    try { const income = await calculateHobbyIncome(req.user.id); return success(res, { income }); } catch (err) { next(err); }
  },
};
