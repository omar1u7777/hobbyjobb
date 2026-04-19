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
   * Confirm a payment (called after successful payment)
   * Note: In production, this is handled by webhooks
   * @param {string} paymentIntentId - Stripe PaymentIntent ID
   */
  async confirmPayment(paymentIntentId) {
    // This is a client-side confirmation only
    // Server-side confirmation happens via webhooks
    return { success: true, paymentIntentId };
  },
};

export default paymentService;
