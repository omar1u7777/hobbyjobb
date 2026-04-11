// git commit: "feat(api): configure Axios instance with baseURL and JWT auth header interceptor"

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT on every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('hj_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Centralised error handling — unwrap backend error messages
api.interceptors.response.use(
  res => res,
  err => {
    const msg =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err.message ||
      'Något gick fel. Försök igen.';
    return Promise.reject(new Error(msg));
  }
);

export default api;
