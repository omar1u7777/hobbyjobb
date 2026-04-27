const { Op } = require('sequelize');
const { Message, Job, User, Application } = require('../models');

function toPositiveInt(value) {
  const num = Number(value);
  return Number.isInteger(num) && num > 0 ? num : null;
}

async function getJobParticipants(jobId) {
  const job = await Job.findByPk(jobId, { attributes: ['id', 'poster_id'] });
  if (!job) return null;

  const applications = await Application.findAll({
    where: { job_id: jobId },
    attributes: ['applicant_id'],
  });

  const participantIds = new Set([job.poster_id]);
  for (const app of applications) participantIds.add(app.applicant_id);

  return { job, participantIds };
}

const getMessagesByJob = async (req, res, next) => {
  try {
    const jobId = toPositiveInt(req.params.jobId);
    if (!jobId) {
      return res.status(400).json({ success: false, message: 'Invalid jobId' });
    }

    const participants = await getJobParticipants(jobId);
    if (!participants) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    if (!participants.participantIds.has(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Not allowed for this job chat' });
    }

    const messages = await Message.findAll({
      where: {
        job_id: jobId,
        [Op.or]: [{ sender_id: req.user.id }, { receiver_id: req.user.id }],
      },
      include: [
        { model: User, as: 'sender', attributes: ['id', 'name', 'avatar'] },
        { model: User, as: 'receiver', attributes: ['id', 'name', 'avatar'] },
      ],
      order: [['created_at', 'ASC']],
    });

    await Message.update(
      { is_read: true },
      {
        where: {
          job_id: jobId,
          receiver_id: req.user.id,
          is_read: false,
        },
      }
    );

    return res.json({
      success: true,
      data: { messages },
    });
  } catch (error) {
    return next(error);
  }
};

const sendMessage = async (req, res, next) => {
  try {
    const jobId = toPositiveInt(req.body.job_id);
    const receiverId = toPositiveInt(req.body.receiver_id);
    const content = typeof req.body.content === 'string' ? req.body.content.trim() : '';

    if (!jobId) {
      return res.status(400).json({ success: false, message: 'Invalid job_id' });
    }

    if (!receiverId) {
      return res.status(400).json({ success: false, message: 'Invalid receiver_id' });
    }

    if (!content) {
      return res.status(400).json({ success: false, message: 'content is required' });
    }

    if (receiverId === req.user.id) {
      return res.status(400).json({ success: false, message: 'Cannot send message to yourself' });
    }

    const participants = await getJobParticipants(jobId);
    if (!participants) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    if (!participants.participantIds.has(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Not allowed for this job chat' });
    }

    if (!participants.participantIds.has(receiverId)) {
      return res.status(400).json({ success: false, message: 'Receiver is not part of this job chat' });
    }

    const receiver = await User.findByPk(receiverId, { attributes: ['id'] });
    if (!receiver) {
      return res.status(404).json({ success: false, message: 'Receiver not found' });
    }

    const message = await Message.create({
      job_id: jobId,
      sender_id: req.user.id,
      receiver_id: receiverId,
      content,
      is_read: false,
    });

    const createdMessage = await Message.findByPk(message.id, {
      include: [
        { model: User, as: 'sender', attributes: ['id', 'name', 'avatar'] },
        { model: User, as: 'receiver', attributes: ['id', 'name', 'avatar'] },
      ],
    });

    return res.status(201).json({
      success: true,
      data: { message: createdMessage },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getMessagesByJob,
  sendMessage,
};
