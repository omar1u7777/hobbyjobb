const rateLimit = require('express-rate-limit');

const isDev = process.env.NODE_ENV !== 'production';

module.exports = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minuter
  max: isDev ? 1000 : 100, // 1000 i dev, 100 i produktion
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
