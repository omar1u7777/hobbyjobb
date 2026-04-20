import api from './api.js';

function unwrap(response) {
  return response.data?.data ?? response.data ?? {};
}

export const adminService = {
  async getStats() {
    const { stats } = unwrap(await api.get('/admin/stats'));
    return stats || null;
  },

  async getCharts() {
    const { charts } = unwrap(await api.get('/admin/charts'));
    return charts || null;
  },

  async getFlaggedAccounts({ search = '', risk = 'all' } = {}) {
    const params = {};
    if (search) params.search = search;
    if (risk && risk !== 'all') params.risk = risk;

    const { accounts } = unwrap(await api.get('/admin/flagged-accounts', { params }));
    return Array.isArray(accounts) ? accounts : [];
  },

  async updateFlaggedAccountStatus(id, payload) {
    const { account } = unwrap(await api.patch(`/admin/flagged-accounts/${id}`, payload));
    return account || null;
  },

  async getCategories() {
    const { categories } = unwrap(await api.get('/admin/categories'));
    return Array.isArray(categories) ? categories : [];
  },

  async createCategory(payload) {
    const { category } = unwrap(await api.post('/admin/categories', payload));
    return category;
  },

  async updateCategory(id, payload) {
    const { category } = unwrap(await api.put(`/admin/categories/${id}`, payload));
    return category;
  },

  async deleteCategory(id) {
    await api.delete(`/admin/categories/${id}`);
    return true;
  },
};

export default adminService;
