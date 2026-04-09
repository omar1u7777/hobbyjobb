const { Job, Category, User, Application } = require('../models');
const { Op } = require('sequelize');
const { success, error, paginated } = require('../utils/responseHelper');
const { getDistanceKm } = require('../utils/geocoder');
const { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } = require('../../config/constants');
module.exports = {
  async getJobs(req, res, next) {
    try {
      const { category, minPrice, maxPrice, sort='newest', page=1, limit=DEFAULT_PAGE_SIZE, search, lat, lng, radius=20 } = req.query;
      const where = { status: 'open' };
      if (category) where.category_id = category;
      if (minPrice) where.price = { ...where.price, [Op.gte]: parseFloat(minPrice) };
      if (maxPrice) where.price = { ...where.price, [Op.lte]: parseFloat(maxPrice) };
      if (search) where[Op.or] = [{ title: { [Op.iLike]: '%'+search+'%' } }, { description: { [Op.iLike]: '%'+search+'%' } }];
      let order;
      switch(sort) { case 'price_asc': order=[['price','ASC']]; break; case 'price_desc': order=[['price','DESC']]; break; default: order=[['is_boosted','DESC'],['created_at','DESC']]; }
      const pageNum = Math.max(1, parseInt(page));
      const pageSize = Math.min(parseInt(limit)||DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
      const { rows, count } = await Job.findAndCountAll({ where, order, limit: pageSize, offset: (pageNum-1)*pageSize, include: [{ model: Category, as: 'category', attributes: ['id','name','icon'] }, { model: User, as: 'poster', attributes: ['id','name','location','avatar'] }] });
      let filtered = rows;
      if (lat && lng) { const uLat=parseFloat(lat), uLng=parseFloat(lng), r=parseFloat(radius); filtered = rows.filter(j => { if(!j.lat||!j.lng) return true; const d=getDistanceKm(uLat,uLng,parseFloat(j.lat),parseFloat(j.lng)); j.dataValues.distance=Math.round(d*10)/10; return d<=r; }); }
      return paginated(res, { rows: filtered, count: lat&&lng ? filtered.length : count, page: pageNum, limit: pageSize });
    } catch (err) { next(err); }
  },
  async getJob(req, res, next) {
    try {
      const job = await Job.findByPk(req.params.id, { include: [{ model: Category, as: 'category' }, { model: User, as: 'poster', attributes: { exclude: ['password'] } }, { model: Application, as: 'applications', include: [{ model: User, as: 'applicant', attributes: ['id','name','avatar'] }] }] });
      if (!job) return error(res, 'Job not found', 404);
      return success(res, { job });
    } catch (err) { next(err); }
  },
  async createJob(req, res, next) {
    try {
      const { title, description, price, location, lat, lng, category_id, hobby_type } = req.body;
      if (!title || !description || !price || !category_id) return error(res, 'Title, description, price, and category are required');
      const cat = await Category.findByPk(category_id);
      if (!cat) return error(res, 'Category not found', 404);
      const job = await Job.create({ title, description, price, location, lat, lng, category_id, hobby_type, poster_id: req.user.id, is_hobby_valid: true });
      await req.user.increment('hobby_job_count');
      const full = await Job.findByPk(job.id, { include: [{ model: Category, as: 'category' }, { model: User, as: 'poster', attributes: ['id','name'] }] });
      return success(res, { message: 'Job created', job: full }, 201);
    } catch (err) { next(err); }
  },
  async updateJob(req, res, next) {
    try {
      const job = await Job.findByPk(req.params.id);
      if (!job) return error(res, 'Job not found', 404);
      if (job.poster_id !== req.user.id) return error(res, 'Not authorized', 403);
      const { title, description, price, location, lat, lng, category_id, status } = req.body;
      await job.update({ ...(title&&{title}), ...(description&&{description}), ...(price&&{price}), ...(location!==undefined&&{location}), ...(lat!==undefined&&{lat}), ...(lng!==undefined&&{lng}), ...(category_id&&{category_id}), ...(status&&{status}) });
      return success(res, { message: 'Job updated', job });
    } catch (err) { next(err); }
  },
  async deleteJob(req, res, next) {
    try {
      const job = await Job.findByPk(req.params.id);
      if (!job) return error(res, 'Job not found', 404);
      if (job.poster_id !== req.user.id && !req.user.is_admin) return error(res, 'Not authorized', 403);
      await job.destroy();
      return success(res, { message: 'Job deleted' });
    } catch (err) { next(err); }
  },
  async getMyJobs(req, res, next) {
    try {
      const jobs = await Job.findAll({ where: { poster_id: req.user.id }, include: [{ model: Category, as: 'category', attributes: ['id','name','icon'] }], order: [['created_at','DESC']] });
      return success(res, { jobs });
    } catch (err) { next(err); }
  },
};
