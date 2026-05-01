const requireAuth = require('./requireAuth');
const { User } = require('../models');

module.exports = [
  requireAuth,
  async (req, res, next) => {
    try {
      if (!User) return res.status(503).json({ success: false, message: 'Database not configured' });
      const user = await User.findByPk(req.user.id, { attributes: ['is_admin'] });
      if (!user || !user.is_admin) {
        return res.status(403).json({ success: false, message: 'Admin access required' });
      }
      next();
    } catch (err) {
      next(err);
    }
  },
];
