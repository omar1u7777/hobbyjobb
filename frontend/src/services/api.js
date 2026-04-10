import axios from 'axios';
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api', timeout: 15000, headers: { 'Content-Type': 'application/json' } });
api.interceptors.request.use(config => { const token = localStorage.getItem('hj_token'); if (token) config.headers.Authorization = 'Bearer ' + token; return config; });
api.interceptors.response.use(res => res, err => { const msg = err?.response?.data?.message || err.message || 'Något gick fel.'; return Promise.reject(new Error(msg)); });
export default api;
