import axios from 'axios';

// In production, API calls go to the backend URL set via VITE_API_URL env var.
// In development, Vite proxy handles /api → localhost:5000
const baseURL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('gp_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Helper to set auth header globally (used in login/register)
export const setAuthHeader = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export const repoService = {
  getAll: () => api.get('/repos').then(res => res.data),
  onboard: (repoUrl) => api.post('/repos', { repoUrl }).then(res => res.data),
  delete: (id) => api.delete(`/repos/${id}`).then(res => res.data),
  getDetails: (id) => api.get(`/analytics/${id}`).then(res => res.data),
};

export default api;
