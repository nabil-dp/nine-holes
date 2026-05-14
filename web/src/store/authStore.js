import { create } from 'zustand';
import { authAPI } from '../services/api';
import storageService from '../services/storageService';
import socketService from '../services/socketService';

const useAuthStore = create((set, get) => ({
  user: null,
  token: storageService.getToken(),
  isAuthenticated: !!storageService.getToken(),
  isLoading: false,
  error: null,

  setUser: (user) => set({ user }),

  login: async (identifier, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authAPI.login({ identifier, password });
      const { token, user } = res.data;
      storageService.saveToken(token);
      socketService.connect();
      set({ user, token, isAuthenticated: true, isLoading: false });
      return { success: true };
    } catch (err) {
      set({ error: err.message, isLoading: false });
      return { success: false, message: err.message };
    }
  },

  register: async (username, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authAPI.register({ username, email, password });
      const { token, user } = res.data;
      storageService.saveToken(token);
      socketService.connect();
      set({ user, token, isAuthenticated: true, isLoading: false });
      return { success: true };
    } catch (err) {
      set({ error: err.message, isLoading: false });
      return { success: false, message: err.message };
    }
  },

  logout: () => {
    authAPI.logout().catch(() => {});
    storageService.clearToken();
    socketService.disconnect();
    set({ user: null, token: null, isAuthenticated: false, error: null });
  },

  fetchMe: async () => {
    if (!get().token) return;
    try {
      const res = await authAPI.getMe();
      set({ user: res.data.user });
    } catch {
      get().logout();
    }
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
