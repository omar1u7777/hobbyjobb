const { Op } = require('sequelize');
const { Message, Job, User, Application } = require('../models');

const getJobAccess = async (jobId, userId) => {
  const job = await Job.findByPk(jobId, {
    attributes: ['id', 'poster_id'],
  });

  if (!job) {
    return {
      allowed: false,
      status: 404,
      message: 'Job not found',
      job: null,
    };
  }

  if (job.poster_id === userId) {
    return { allowed: true, job };
  }

  const isApplicant = await Application.findOne({
    where: {
      job_id: jobId,
      applicant_id: userId,
    },
    attributes: ['id'],
  });

  if (!isApplicant) {
    return {
      allowed: false,
      status: 403,
      message: 'You are not allowed to access messages for this job',
      job,
    };
  }

  return { allowed: true, job };
};

const getMessages = async (req, res, next) => {
  try {
    const jobId = Number.parseInt(req.params.jobId, 10);
    if (Number.isNaN(jobId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid jobId',
      });
    }

    const access = await getJobAccess(jobId, req.user.id);
    if (!access.allowed) {
      return res.status(access.status).json({
        success: false,
        message: access.message,
      });
    }

    const messages = await Message.findAll({
      where: { job_id: jobId },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'name', 'avatar'],
        },
        {
          model: User,
          as: 'receiver',
          attributes: ['id', 'name', 'avatar'],
        },
      ],
      order: [['created_at', 'ASC']],
    });

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
    const { job_id, receiver_id, content } = req.body;
    const normalizedContent = typeof content === 'string' ? content.trim() : '';

    if (!job_id || !normalizedContent) {
      return res.status(400).json({
        success: false,
        message: 'job_id and content are required',
      });
    }

    if (!receiver_id) {
      return res.status(400).json({
        success: false,
        message: 'receiver_id is required',
      });
    }

    const jobId = Number.parseInt(job_id, 10);
    const receiverId = Number.parseInt(receiver_id, 10);
    if (Number.isNaN(jobId) || Number.isNaN(receiverId)) {
      return res.status(400).json({
        success: false,
        message: 'job_id and receiver_id must be valid numbers',
      });
    }

    if (receiverId === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot send a message to yourself',
      });
    }

    const access = await getJobAccess(jobId, req.user.id);
    if (!access.allowed) {
      return res.status(access.status).json({
        success: false,
        message: access.message,
      });
    }

    const receiverIsPoster = access.job.poster_id === receiverId;
    let receiverIsApplicant = false;

    if (!receiverIsPoster) {
      receiverIsApplicant = Boolean(await Application.findOne({
        where: {
          job_id: jobId,
          applicant_id: receiverId,
        },
        attributes: ['id'],
      }));
    }

    if (!receiverIsPoster && !receiverIsApplicant) {
      return res.status(403).json({
        success: false,
        message: 'Receiver must belong to this job conversation',
      });
    }

    const message = await Message.create({
      job_id: jobId,
      sender_id: req.user.id,
      receiver_id: receiverId,
      content: normalizedContent,
      is_read: false,
    });

    return res.status(201).json({
      success: true,
      data: { message },
    });
  } catch (error) {
    return next(error);
  }
};

const getUnreadCount = async (req, res, next) => {
  try {
    const count = await Message.count({
      where: {
        receiver_id: req.user.id,
        is_read: false,
      },
    });

    return res.json({
      success: true,
      data: { count },
    });
  } catch (error) {
    return next(error);
  }
};

const getConversations = async (req, res, next) => {
  try {
    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { sender_id: req.user.id },
          { receiver_id: req.user.id },
        ],
      },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'name', 'avatar'],
        },
        {
          model: User,
          as: 'receiver',
          attributes: ['id', 'name', 'avatar'],
        },
        {
          model: Job,
          as: 'job',
          attributes: ['id', 'title', 'status'],
        },
      ],
      order: [['created_at', 'DESC']],
    });

    const byConversation = new Map();

    for (const message of messages) {
      if (!message.job_id) {
        continue;
      }

      const otherUser = message.sender_id === req.user.id ? message.receiver : message.sender;
      if (!otherUser) {
        continue;
      }

      const key = `${message.job_id}:${otherUser.id}`;
      const existing = byConversation.get(key);

      if (!existing) {
        byConversation.set(key, {
          jobId: message.job_id,
          jobTitle: message.job ? message.job.title : null,
          jobStatus: message.job ? message.job.status : null,
          otherUser,
          lastMessage: {
            id: message.id,
            content: message.content,
            createdAt: message.created_at,
            senderId: message.sender_id,
            receiverId: message.receiver_id,
          },
          unreadCount:
            message.receiver_id === req.user.id && !message.is_read ? 1 : 0,
        });
        continue;
      }

      if (message.receiver_id === req.user.id && !message.is_read) {
        existing.unreadCount += 1;
      }
    }

    const conversations = Array.from(byConversation.values()).sort(
      (a, b) => new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt)
    );

    return res.json({
      success: true,
      data: { conversations },
    });
  } catch (error) {
    return next(error);
  }
};

const markConversationAsRead = async (req, res, next) => {
  try {
    const jobId = Number.parseInt(req.params.jobId, 10);
    if (Number.isNaN(jobId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid jobId',
      });
    }

    const access = await getJobAccess(jobId, req.user.id);
    if (!access.allowed) {
      return res.status(access.status).json({
        success: false,
        message: access.message,
      });
    }

    const [updatedCount] = await Message.update(
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
      data: { updatedCount },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getMessages,
  sendMessage,
  getUnreadCount,
  getConversations,
  markConversationAsRead,
};
