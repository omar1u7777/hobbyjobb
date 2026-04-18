// git commit: "feat(s4): integrate jobService with S2 backend API responses"

import api from './api.js';

export const jobService = {
  async getJobs(params = {}) {
    const { data } = await api.get('/jobs', { params });
    // Backend returns: { success, data: { jobs, pagination } }
    const inner = data.data ?? data;
    if (inner.jobs && inner.pagination) {
      return {
        jobs: inner.jobs,
        total: inner.pagination.total ?? inner.jobs.length,
        page: inner.pagination.page ?? 1,
        pages: inner.pagination.totalPages ?? 1,
      };
    }
    return { jobs: [], total: 0, page: 1, pages: 1 };
  },

  async getJob(id) {
    const { data } = await api.get(`/jobs/${id}`);
    // Backend returns: { success, data: { job, applicationsCount } }
    const inner = data.data ?? data;
    const job = inner.job ?? inner;
    // Flatten poster info for the UI
    if (job.poster) {
      job.poster_id = job.poster_id ?? job.poster.id;
      job.poster_name = job.poster.name;
      job.poster_avatar = job.poster.avatar;
      job.poster_location = job.poster.location;
    }
    job.applicationsCount = inner.applicationsCount ?? job.application_count ?? 0;
    return job;
  },

  async getMyJobs() {
    const { data } = await api.get('/jobs/my');
    // Backend returns: { success, data: { jobs } }
    return data.data?.jobs ?? data.jobs ?? data;
  },

  async createJob(payload) {
    const { data } = await api.post('/jobs', payload);
    // Backend returns: { success, data: { job, warning? } }
    const inner = data.data ?? data;
    return inner;
  },

  async updateJob(id, payload) {
    const { data } = await api.put(`/jobs/${id}`, payload);
    return data.data?.job ?? data.job ?? data;
  },

  async deleteJob(id) {
    await api.delete(`/jobs/${id}`);
  },

  async getCategories() {
    const { data } = await api.get('/categories');
    // Backend returns: { success, data: { categories } }
    return data.data?.categories ?? data.categories ?? data;
  },
};
