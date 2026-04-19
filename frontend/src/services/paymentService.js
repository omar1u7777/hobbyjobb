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

  /**
   * Create a boost payment for a job (direct charge, no escrow).
   * @param {number} jobId
   * @param {'standard' | 'super'} packageName - 'standard' (29 kr, 48h) or 'super' (59 kr, 7 days)
   * @returns {Promise<{clientSecret, paymentIntentId, amount, package, label, durationHours}>}
   */
  async createBoost(jobId, packageName) {
    const { data } = await api.post('/payments/boost', { jobId, package: packageName });
    return data.data;
  },

  /**
   * Activate boost after client-side Stripe success.
   * @param {string} paymentIntentId
   */
  async confirmBoost(paymentIntentId) {
    const { data } = await api.post('/payments/boost/confirm', { paymentIntentId });
    return data.data;
  },
};

export default paymentService;
