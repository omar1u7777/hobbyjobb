import api from './api.js';

export const reviewService = {
  /**
   * Leave a review for a completed job. Only the job poster and the accepted
   * applicant can review each other, and only after escrow release.
   * @param {{ job_id: number, rating: number, reviewee_id: number, comment?: string }} payload
   */
  async create(payload) {
    const { data } = await api.post('/reviews', payload);
    return data.data?.review ?? data;
  },

  async getForUser(userId) {
    const { data } = await api.get(`/users/${userId}/reviews`);
    return data.data?.reviews ?? data.reviews ?? data;
  },

  async getForJob(jobId) {
    const { data } = await api.get(`/reviews/job/${jobId}`);
    return data.data?.reviews ?? data.reviews ?? data;
  },
};
