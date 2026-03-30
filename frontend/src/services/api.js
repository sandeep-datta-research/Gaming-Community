import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Format API error detail
export function formatApiErrorDetail(detail) {
  if (detail == null) return "Something went wrong. Please try again.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail))
    return detail.map((e) => (e && typeof e.msg === "string" ? e.msg : JSON.stringify(e))).filter(Boolean).join(" ");
  if (detail && typeof detail.msg === "string") return detail.msg;
  return String(detail);
}

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
  logout: () => api.post('/api/auth/logout'),
  getMe: () => api.get('/api/auth/me'),
  refresh: () => api.post('/api/auth/refresh'),
  forgotPassword: (email) => api.post('/api/auth/forgot-password', null, { params: { email } }),
  resetPassword: (token, newPassword) => api.post('/api/auth/reset-password', null, { params: { token, new_password: newPassword } }),
};

// User APIs
export const userAPI = {
  getProfile: (userId) => api.get(`/api/users/${userId}`),
  updateProfile: (data) => api.patch('/api/users/me', data),
  searchUsers: (query) => api.get('/api/users', { params: { q: query } }),
  getMyClans: () => api.get('/api/users/me/clans'),
  addGameStats: (data) => api.post('/api/users/me/game-stats', data),
  getGameStats: (userId) => api.get(`/api/users/${userId}/game-stats`),
};

// Game APIs
export const gameAPI = {
  getGames: () => api.get('/api/games'),
  createGame: (data) => api.post('/api/games', data),
};

// Tournament APIs
export const tournamentAPI = {
  getTournaments: (params) => api.get('/api/tournaments', { params }),
  getTournament: (id) => api.get(`/api/tournaments/${id}`),
  createTournament: (data) => api.post('/api/tournaments', data),
  updateTournament: (id, data) => api.patch(`/api/tournaments/${id}`, data),
  register: (id, data) => api.post(`/api/tournaments/${id}/register`, data),
  generateBrackets: (id) => api.post(`/api/tournaments/${id}/generate-brackets`),
  submitMatchResult: (tournamentId, matchId, data) => api.post(`/api/tournaments/${tournamentId}/matches/${matchId}/result`, data),
};

// Clan APIs
export const clanAPI = {
  getClans: (params) => api.get('/api/clans', { params }),
  getClan: (id) => api.get(`/api/clans/${id}`),
  createClan: (data) => api.post('/api/clans', data),
  updateClan: (id, data) => api.patch(`/api/clans/${id}`, data),
  joinClan: (id) => api.post(`/api/clans/${id}/join`),
  leaveClan: (id) => api.post(`/api/clans/${id}/leave`),
};

// Community APIs
export const communityAPI = {
  getPosts: (params) => api.get('/api/posts', { params }),
  getPost: (id) => api.get(`/api/posts/${id}`),
  createPost: (data) => api.post('/api/posts', data),
  likePost: (id) => api.post(`/api/posts/${id}/like`),
  addComment: (postId, data) => api.post(`/api/posts/${postId}/comments`, data),
};

// Leaderboard APIs
export const leaderboardAPI = {
  getLeaderboard: (gameSlug, metric) => api.get(`/api/leaderboards/${gameSlug}`, { params: { metric } }),
};

// Schedule APIs
export const scheduleAPI = {
  getSchedule: (params) => api.get('/api/schedule', { params }),
  createEvent: (data) => api.post('/api/schedule', data),
};

// Admin APIs
export const adminAPI = {
  getStats: () => api.get('/api/admin/stats'),
  getUsers: (params) => api.get('/api/admin/users', { params }),
};

export default api;
