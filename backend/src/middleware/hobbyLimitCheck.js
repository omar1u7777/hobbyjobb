const { HOBBY_ANNUAL_LIMIT, HOBBY_MONTHLY_JOB_LIMIT } = require('../../config/constants');
module.exports = (req, res, next) => {
  const user = req.user;
  if (parseFloat(user.hobby_total_year) >= HOBBY_ANNUAL_LIMIT) return res.status(403).json({ success: false, message: 'Hobby income limit reached (30000 kr/year)' });
  if (user.hobby_job_count >= HOBBY_MONTHLY_JOB_LIMIT) return res.status(403).json({ success: false, message: 'Monthly job limit reached' });
  next();
};
