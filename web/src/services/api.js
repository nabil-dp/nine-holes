import axios from 'axios';
import { API_URL, TOKEN_KEY } from '../utils/constants';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Normalize response & handle errors globally
api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const message = err.response?.data?.message || 'Something went wrong';
    if (err.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      window.location.href = '/login';
    }
    return Promise.reject(new Error(message));
  }
);

// ─── Auth ──────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
  logout: () => api.post('/api/auth/logout'),
  getMe: () => api.get('/api/auth/me'),
};

// ─── Game ──────────────────────────────────────────────────────────────────
export const gameAPI = {
  startSession: (opponentId) => api.post('/api/games/start', { opponent_id: opponentId }),
  getSession: (sessionId) => api.get(`/api/games/${sessionId}`),
  getActiveSession: () => api.get('/api/games/active'),
  getUserSessions: (userId) => api.get(`/api/games/user/${userId}/sessions`),
  getUserStats: (userId) => api.get(`/api/games/user/${userId}/stats`),
};

// ─── Leaderboard ──────────────────────────────────────────────────────────
export const leaderboardAPI = {
  getAll: () => api.get('/api/leaderboard'),
  getTopTen: () => api.get('/api/leaderboard/top10'),
  getUserRank: (userId) => api.get(`/api/leaderboard/user/${userId}`),
};

// ─── Notifications ────────────────────────────────────────────────────────
export const notificationAPI = {
  getAll: (userId) => api.get(`/api/notifications/${userId}`),
  markAsRead: (userId, notificationId) =>
    api.post(`/api/notifications/${userId}/read/${notificationId}`),
  delete: (notificationId) => api.delete(`/api/notifications/${notificationId}`),
};

export default api;
