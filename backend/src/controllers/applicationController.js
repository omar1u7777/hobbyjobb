const { Application, Job, User, Category, Message } = require('../models');
const { APPLICATION_STATUS, JOB_STATUS } = require('../../config/constants');

const createApplication = async (req, res, next) => {
  try {
    const { job_id, message, proposed_price } = req.body;

    if (!job_id) {
      return res.status(400).json({ success: false, message: 'job_id is required' });
    }

    const job = await Job.findByPk(job_id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    if (job.poster_id === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot apply to your own job' });
    }

    // Block only pending/accepted applications. Rejected or withdrawn
    // applications are permitted to be re-submitted (fresh pending row).
    const existing = await Application.findOne({
      where: {
        job_id,
        applicant_id: req.user.id,
        status: [APPLICATION_STATUS.PENDING, APPLICATION_STATUS.ACCEPTED],
      },
    });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: existing.status === APPLICATION_STATUS.ACCEPTED
          ? 'Your application has already been accepted for this job'
          : 'You already have a pending application for this job',
      });
    }

    const application = await Application.create({
      job_id,
      applicant_id: req.user.id,
      message: message || null,
      proposed_price: proposed_price ?? null,
      status: APPLICATION_STATUS.PENDING,
    });

    return res.status(201).json({
      success: true,
      data: { application },
    });
  } catch (error) {
    return next(error);
  }
};

const getReceivedApplications = async (req, res, next) => {
  try {
    const applications = await Application.findAll({
      include: [
        {
          model: Job,
          as: 'job',
          where: { poster_id: req.user.id },
          include: [{ model: Category, as: 'category' }],
        },
        {
          model: User,
          as: 'applicant',
          attributes: ['id', 'name', 'location', 'avatar'],
        },
      ],
      order: [['created_at', 'DESC']],
    });

    return res.json({
      success: true,
      data: { applications },
    });
  } catch (error) {
    return next(error);
  }
};

const getSentApplications = async (req, res, next) => {
  try {
    const applications = await Application.findAll({
      where: { applicant_id: req.user.id },
      include: [
        {
          model: Job,
          as: 'job',
          include: [
            { model: Category, as: 'category' },
            { model: User, as: 'poster', attributes: ['id', 'name', 'avatar'] },
          ],
        },
      ],
      order: [['created_at', 'DESC']],
    });

    return res.json({
      success: true,
      data: { applications },
    });
  } catch (error) {
    return next(error);
  }
};

const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (![APPLICATION_STATUS.ACCEPTED, APPLICATION_STATUS.REJECTED].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be accepted or rejected' });
    }

    const application = await Application.findByPk(req.params.id, {
      include: [{ model: Job, as: 'job' }],
    });

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    if (application.job.poster_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Only the job owner can update this application' });
    }

    const wasAcceptedBefore = application.status === APPLICATION_STATUS.ACCEPTED;
    await application.update({ status });

    // Auto-start the conversation if just accepted
    if (!wasAcceptedBefore && status === APPLICATION_STATUS.ACCEPTED) {
      await Message.create({
        job_id: application.job_id,
        sender_id: req.user.id, // The poster
        receiver_id: application.applicant_id, // The applicant
        content: '👋 Hej! Din ansökan har accepterats. Vi kan nu diskutera detaljerna kring uppdraget här.',
        is_read: false,
      });
    }

    // NOTE: job stays 'open' after acceptance. It only moves to 'in_progress'
    // when the poster successfully pays (escrow held). See payments.js.

    return res.json({
      success: true,
      data: { application },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createApplication,
  getReceivedApplications,
  getSentApplications,
  updateApplicationStatus,
};
