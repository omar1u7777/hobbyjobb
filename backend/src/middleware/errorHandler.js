module.exports = (err, req, res, next) => {
  const status = err.status || 500;
  console.error('Error:', err.message);

  const isProd = process.env.NODE_ENV === 'production';
  const message = isProd && status === 500
    ? 'Internal server error'
    : err.message || 'Internal server error';

  res.status(status).json({ success: false, message });
};
