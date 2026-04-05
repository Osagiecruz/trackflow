import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://trackflow-production-22cc.up.railway.app';

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Attach access token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh token on 401
let refreshing = false;
let queue = [];

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;

    if (err.response?.status === 401 && !original._retry) {
      if (refreshing) {
        return new Promise((resolve, reject) => {
          queue.push({ resolve, reject });
        }).then(() => api(original));
      }

      original._retry = true;
      refreshing = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) throw new Error('No refresh token');

        const { data } = await axios.post(`${BASE_URL}/api/auth/refresh`, { refreshToken });
        localStorage.setItem('access_token', data.tokens.access);
        localStorage.setItem('refresh_token', data.tokens.refresh);

        queue.forEach(({ resolve }) => resolve());
        queue = [];

        return api(original);
      } catch (_) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        queue.forEach(({ reject }) => reject(err));
        queue = [];
        window.location.href = '/login';
      } finally {
        refreshing = false;
      }
    }

    return Promise.reject(err);
  }
);

// ─── Public API ──────────────────────────────────────────
export const trackApi = {
  track: (trackingId) => api.get(`/track/${trackingId}`),
  events: (trackingId) => api.get(`/track/${trackingId}/events`),
  subscribe: (trackingId, data) => api.post(`/track/${trackingId}/subscribe`, data),
};

// ─── Auth API ────────────────────────────────────────────
export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  logout: (refreshToken) => api.post('/auth/logout', { refreshToken }),
  me: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/me', data),
  changePassword: (data) => api.post('/auth/change-password', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};

// ─── Shipments API ───────────────────────────────────────
export const shipmentsApi = {
  list: (params) => api.get('/shipments', { params }),
  create: (data) => api.post('/shipments', data),
  getById: (id) => api.get(`/shipments/${id}`),
  update: (id, data) => api.put(`/shipments/${id}`, data),
  remove: (id) => api.delete(`/shipments/${id}`),
  addEvent: (id, data) => api.post(`/shipments/${id}/events`, data),
  notify: (id, data) => api.post(`/shipments/${id}/notify`, data),
  subscribe: (id, data) => api.post(`/shipments/${id}/subscribe`, data),
  bulkCreate: (shipments) => api.post('/shipments/bulk', { shipments }),
};

// ─── Analytics API ───────────────────────────────────────
export const analyticsApi = {
  overview: () => api.get('/analytics/overview'),
  deliveryRate: (days) => api.get('/analytics/delivery-rate', { params: { days } }),
};

export default api;
