// git commit: "feat(users): implement userService for profile and income API calls"

import api from './api.js';

export const userService = {
  async getProfile(id) {
    const { data } = await api.get(`/users/${id}`);
    return data.data?.user ?? data.user ?? data;
  },

  async updateProfile(id, payload) {
    const { data } = await api.put(`/users/${id}`, payload);
    return data.data?.user ?? data.user ?? data;
  },

  async getMyIncome() {
    const { data } = await api.get('/users/me/income');
    return data.data ?? data.income ?? data;
  },

  async getReviews(id) {
    const { data } = await api.get(`/users/${id}/reviews`);
    return data.data?.reviews ?? data.reviews ?? data;
  },
};
