const { Application, Job, User } = require('../models');
const { Op } = require('sequelize');
const { success, error } = require('../utils/responseHelper');
module.exports = {
  async apply(req, res, next) {
    try {
      const { job_id, message, proposed_price } = req.body;
      if (!job_id) return error(res, 'job_id is required');
      const job = await Job.findByPk(job_id);
      if (!job) return error(res, 'Job not found', 404);
      if (job.status !== 'open') return error(res, 'Job is not open');
      if (job.poster_id === req.user.id) return error(res, 'Cannot apply to your own job');
      const existing = await Application.findOne({ where: { job_id, applicant_id: req.user.id } });
      if (existing) return error(res, 'Already applied', 409);
      const app = await Application.create({ job_id, applicant_id: req.user.id, message, proposed_price });
      return success(res, { message: 'Application submitted', application: app }, 201);
    } catch (err) { next(err); }
  },
  async getReceived(req, res, next) {
    try {
      const apps = await Application.findAll({ include: [{ model: Job, as: 'job', where: { poster_id: req.user.id }, attributes: ['id','title','price','status'] }, { model: User, as: 'applicant', attributes: ['id','name','email','avatar'] }], order: [['created_at','DESC']] });
      return success(res, { applications: apps });
    } catch (err) { next(err); }
  },
  async getSent(req, res, next) {
    try {
      const apps = await Application.findAll({ where: { applicant_id: req.user.id }, include: [{ model: Job, as: 'job', attributes: ['id','title','price','status','location'], include: [{ model: User, as: 'poster', attributes: ['id','name'] }] }], order: [['created_at','DESC']] });
      return success(res, { applications: apps });
    } catch (err) { next(err); }
  },
  async updateStatus(req, res, next) {
    try {
      const { status } = req.body;
      if (!['accepted','rejected'].includes(status)) return error(res, 'Status must be accepted or rejected');
      const app = await Application.findByPk(req.params.id, { include: [{ model: Job, as: 'job' }] });
      if (!app) return error(res, 'Application not found', 404);
      if (app.job.poster_id !== req.user.id) return error(res, 'Not authorized', 403);
      await app.update({ status });
      if (status === 'accepted') {
        await app.job.update({ status: 'in_progress' });
        await Application.update({ status: 'rejected' }, { where: { job_id: app.job_id, id: { [Op.ne]: app.id }, status: 'pending' } });
      }
      return success(res, { message: 'Application ' + status, application: app });
    } catch (err) { next(err); }
  },
};
