const { Review, Job, Payment, User } = require('../models');

/**
 * POST /api/reviews
 * Leave a review for a completed job.
 * Body: { job_id, rating (1-5), comment?, reviewee_id }
 *
 * Business rules (per README escrow flow):
 * - Only the payer (job poster) and the payee (accepted applicant) can
 *   review each other, and only for a job where the Payment is 'released'.
 * - Each user can only leave one review per job (reviewer_id + job_id unique).
 */
const createReview = async (req, res, next) => {
  try {
    const { job_id, rating, comment, reviewee_id } = req.body;
    const reviewerId = req.user.id;

    if (!job_id || !rating || !reviewee_id) {
      return res.status(400).json({
        success: false,
        message: 'job_id, rating and reviewee_id are required',
      });
    }

    const ratingNum = Number(rating);
    if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({
        success: false,
        message: 'rating must be an integer between 1 and 5',
      });
    }

    if (Number(reviewee_id) === reviewerId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot review yourself',
      });
    }

    // Job must exist and be completed with a released payment.
    const job = await Job.findByPk(job_id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    const payment = await Payment.findOne({
      where: { job_id, status: 'released' },
    });
    if (!payment) {
      return res.status(400).json({
        success: false,
        message: 'Cannot review: job payment is not released yet',
      });
    }

    // Reviewer must be either payer or payee.
    const isPayer = payment.payer_id === reviewerId;
    const isPayee = payment.payee_id === reviewerId;
    if (!isPayer && !isPayee) {
      return res.status(403).json({
        success: false,
        message: 'Only the job poster or the accepted applicant can review this job',
      });
    }

    // Reviewee must be the counterpart.
    const expectedRevieweeId = isPayer ? payment.payee_id : payment.payer_id;
    if (Number(reviewee_id) !== expectedRevieweeId) {
      return res.status(400).json({
        success: false,
        message: 'Reviewee must be the other party of the job',
      });
    }

    // One review per reviewer per job.
    const existing = await Review.findOne({
      where: { job_id, reviewer_id: reviewerId },
    });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'You have already reviewed this job',
      });
    }

    const review = await Review.create({
      job_id,
      reviewer_id: reviewerId,
      reviewee_id,
      rating: ratingNum,
      comment: typeof comment === 'string' && comment.trim() ? comment.trim() : null,
    });

    return res.status(201).json({
      success: true,
      data: { review },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/reviews/job/:jobId
 * List all reviews for a specific job.
 */
const getJobReviews = async (req, res, next) => {
  try {
    const reviews = await Review.findAll({
      where: { job_id: req.params.jobId },
      include: [
        { model: User, as: 'reviewer', attributes: ['id', 'name', 'avatar'] },
        { model: User, as: 'reviewee', attributes: ['id', 'name', 'avatar'] },
      ],
      order: [['created_at', 'DESC']],
    });

    return res.json({
      success: true,
      data: { reviews },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createReview,
  getJobReviews,
};
