import api from './api.js';

export const connectService = {
  async onboard() {
    const { data } = await api.post('/connect/onboard');
    return data.data;
  },

  async getStatus() {
    const { data } = await api.get('/connect/status');
    return data.data;
  },

  async refresh() {
    const { data } = await api.post('/connect/refresh');
    return data.data;
  },
};
