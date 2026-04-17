// git commit: "feat(jobs): implement jobService with CRUD and filter query support"

import api from './api.js';

export const jobService = {
  async getJobs(params = {}) {
    const { data } = await api.get('/jobs', { params });
    const inner = data.data ?? data;
    const pagination = inner.pagination ?? data.pagination ?? {};
    const jobs = inner.jobs ?? (Array.isArray(inner) ? inner : []);
    return {
      jobs,
      total: pagination.total ?? jobs.length,
      page: pagination.page ?? 1,
      pages: pagination.totalPages ?? 1,
    };
  },

  async getJob(id) {
    const { data } = await api.get(`/jobs/${id}`);
    const inner = data.data ?? data;
    const job = inner.job ?? inner;
    if (inner.applicationsCount != null) job.applicationsCount = inner.applicationsCount;
    return job;
  },

  async getMyJobs() {
    const { data } = await api.get('/jobs/my');
    return data.data?.jobs ?? data.jobs ?? [];
  },

  async createJob(payload) {
    const { data } = await api.post('/jobs', payload);
    return data.data?.job ?? data.job ?? data;
  },

  async updateJob(id, payload) {
    const { data } = await api.put(`/jobs/${id}`, payload);
    return data.data?.job ?? data.job ?? data;
  },

  async deleteJob(id) {
    await api.delete(`/jobs/${id}`);
  },

  async applyToJob(jobId, message) {
    const { data } = await api.post('/applications', { job_id: jobId, message });
    return data.data ?? data;
  },

  async getReceivedApplications() {
    const { data } = await api.get('/applications/received');
    return data.data?.applications ?? data.applications ?? [];
  },

  async getSentApplications() {
    const { data } = await api.get('/applications/sent');
    return data.data?.applications ?? data.applications ?? [];
  },

  async updateApplication(id, status) {
    const { data } = await api.put(`/applications/${id}`, { status });
    return data.data ?? data;
  },

  async getCategories() {
    const { data } = await api.get('/categories');
    return data.data?.categories ?? data.categories ?? [];
  },
};
