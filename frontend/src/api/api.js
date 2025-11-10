import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';
if (!API_BASE) console.warn('VITE_API_BASE not set, using localhost fallback');

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`; // ensure backend expects Bearer
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API error:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('userName');
      localStorage.removeItem('userId');
      localStorage.removeItem('userEmail');
      window.dispatchEvent(new Event('authChanged'));
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
