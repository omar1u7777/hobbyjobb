// git commit: "feat(jobs): implement jobService with CRUD and filter query support"

import api from './api.js';

export const jobService = {
  async getJobs(params = {}) {
    const { data } = await api.get('/jobs', { params });
    if (Array.isArray(data.data) && data.pagination) {
      return {
        jobs: data.data,
        total: data.pagination.total ?? data.data.length,
        page: data.pagination.page ?? 1,
        pages: data.pagination.totalPages ?? 1,
      };
    }
    return data; // Backward compatibility for any legacy response shape
  },

  async getJob(id) {
    const { data } = await api.get(`/jobs/${id}`);
    return data.job ?? data;
  },

  async getMyJobs() {
    const { data } = await api.get('/jobs/my');
    return data.jobs ?? data;
  },

  async createJob(payload) {
    const { data } = await api.post('/jobs', payload);
    return data.job ?? data;
  },

  async updateJob(id, payload) {
    const { data } = await api.put(`/jobs/${id}`, payload);
    return data.job ?? data;
  },

  async deleteJob(id) {
    await api.delete(`/jobs/${id}`);
  },

  async applyToJob(jobId, message) {
    const { data } = await api.post('/applications', { job_id: jobId, message });
    return data;
  },

  async getReceivedApplications() {
    const { data } = await api.get('/applications/received');
    return data.applications ?? data;
  },

  async getSentApplications() {
    const { data } = await api.get('/applications/sent');
    return data.applications ?? data;
  },

  async updateApplication(id, status) {
    const { data } = await api.put(`/applications/${id}`, { status });
    return data;
  },

  async getCategories() {
    const { data } = await api.get('/categories');
    return data.categories ?? data;
  },
};
