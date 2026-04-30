const requireAuth = require('./requireAuth');

module.exports = [
  requireAuth,
  (req, res, next) => {
    const isAdmin = req.user && (req.user.is_admin === true || req.user.is_admin === 1 || req.user.is_admin === '1' || req.user.is_admin === 'true');
    if (!isAdmin) {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    next();
  },
];
