module.exports = {
  HOBBY_ANNUAL_LIMIT: parseInt(process.env.HOBBY_ANNUAL_LIMIT) || 30000,
  HOBBY_WARNING_THRESHOLD: parseInt(process.env.HOBBY_WARNING_THRESHOLD) || 25000,
  HOBBY_MONTHLY_JOB_LIMIT: parseInt(process.env.HOBBY_MONTHLY_JOB_LIMIT) || 20,
  STRIPE_PLATFORM_FEE_PERCENT: parseInt(process.env.STRIPE_PLATFORM_FEE_PERCENT) || 8,
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  JOB_STATUS: { OPEN: 'open', IN_PROGRESS: 'in_progress', COMPLETED: 'completed', CANCELLED: 'cancelled' },
  APPLICATION_STATUS: { PENDING: 'pending', ACCEPTED: 'accepted', REJECTED: 'rejected', WITHDRAWN: 'withdrawn' },
};
