const { Category } = require('../models');
const { success } = require('../utils/responseHelper');
module.exports = {
  async getAll(req, res, next) {
    try { const categories = await Category.findAll({ order: [['name','ASC']] }); return success(res, { categories }); } catch (err) { next(err); }
  },
};
