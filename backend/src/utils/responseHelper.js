module.exports = {
  success(res, data, statusCode = 200) { return res.status(statusCode).json({ success: true, ...data }); },
  error(res, message, statusCode = 400) { return res.status(statusCode).json({ success: false, message }); },
  paginated(res, { rows, count, page, limit }) { return res.status(200).json({ success: true, data: rows, pagination: { total: count, page, limit, totalPages: Math.ceil(count / limit) } }); },
};
