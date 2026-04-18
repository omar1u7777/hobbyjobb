// git commit: "feat(s4): add applicationService + integrate APIs"

import api from './api.js';

export const applicationService = {
  async apply(jobId, message, proposedPrice) {
    const { data } = await api.post('/applications', {
      job_id: jobId,
      message,
      proposed_price: proposedPrice,
    });
    return data.data?.application ?? data;
  },

  async getReceived() {
    const { data } = await api.get('/applications/received');
    return data.data?.applications ?? data;
  },

  async getSent() {
    const { data } = await api.get('/applications/sent');
    return data.data?.applications ?? data;
  },

  async updateStatus(applicationId, status) {
    const { data } = await api.put(`/applications/${applicationId}`, { status });
    return data.data?.application ?? data;
  },
};