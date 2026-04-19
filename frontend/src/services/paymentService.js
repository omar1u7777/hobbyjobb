// git commit: "feat(s1): add paymentService for Stripe integration"

import api from './api.js';

export const paymentService = {
  /**
   * Create a checkout session for a job payment
   * @param {number} jobId - Job ID
   * @param {number} amount - Amount in SEK
   * @returns {Promise<{clientSecret: string, paymentIntentId: string}>}
   */
  async createCheckout(jobId, amount) {
    const { data } = await api.post('/payments/checkout', { jobId, amount });
    return data.data;
  },

  /**
   * Get payment history for current user
   * @returns {Promise<Array>} List of payments
   */
  async getHistory() {
    const { data } = await api.get('/payments/history');
    return data.data?.payments ?? [];
  },

  /**
   * Confirm a payment server-side after Stripe client-side success.
   * Backend verifies with Stripe API and updates DB status from pending -> held.
   * This is a fallback for when webhooks cannot reach the server (e.g. localhost dev).
   * @param {string} paymentIntentId - Stripe PaymentIntent ID
   */
  async confirmPayment(paymentIntentId) {
    const { data } = await api.post('/payments/confirm', { paymentIntentId });
    return data.data;
  },

  /**
   * Release escrow funds to payee (called by payer when job is marked complete).
   * @param {number} jobId
   */
  async releaseEscrow(jobId) {
    const { data } = await api.post(`/payments/release/${jobId}`);
    return data.data;
  },
};

export default paymentService;
