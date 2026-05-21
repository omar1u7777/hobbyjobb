const rateLimit = require('express-rate-limit');

const isDev = process.env.NODE_ENV !== 'production';

module.exports = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minuter
  max: isDev ? 1000 : 300, // 1000 i dev, 300 i produktion (~1 req/3s per användare)
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
