// git commit: "feat(auth): implement authService with register, login, logout, getMe calls"

import api from './api.js';

export const authService = {
  async register({ name, email, password, hobbyAgreed }) {
    const { data } = await api.post('/auth/register', { name, email, password, hobbyAgreed });
    return data; // { user, token }
  },

  async login(email, password) {
    const { data } = await api.post('/auth/login', { email, password });
    return data; // { user, token }
  },

  async logout() {
    await api.post('/auth/logout');
  },

  async getMe() {
    const { data } = await api.get('/auth/me');
    return data.user ?? data;
  },
};
