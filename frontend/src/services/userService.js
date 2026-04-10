import api from './api.js';
export const userService = {
  async getProfile(id) { const { data } = await api.get('/users/' + id); return data.user ?? data; },
  async updateProfile(id, payload) { const { data } = await api.put('/users/' + id, payload); return data.user ?? data; },
  async getMyIncome() { const { data } = await api.get('/users/me/income'); return data; },
  async getReviews(id) { const { data } = await api.get('/users/' + id + '/reviews'); return data.reviews ?? data; },
};
