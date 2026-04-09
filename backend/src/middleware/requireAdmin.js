module.exports = (req, res, next) => {
  if (!req.user || !req.user.is_admin) return res.status(403).json({ success: false, message: 'Admin access required' });
  next();
};
