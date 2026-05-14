import { TOKEN_KEY } from '../utils/constants';

const storageService = {
  // ─── Token ──────────────────────────────────────────────────────────────────
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  saveToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
  },

  clearToken() {
    localStorage.removeItem(TOKEN_KEY);
  },

  // ─── Game State ─────────────────────────────────────────────────────────────
  getGameState(sessionId) {
    try {
      const raw = localStorage.getItem(`game_${sessionId}`);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  saveGameState(sessionId, state) {
    try {
      localStorage.setItem(`game_${sessionId}`, JSON.stringify(state));
    } catch {
      console.warn('[Storage] Failed to save game state');
    }
  },

  clearGameState(sessionId) {
    localStorage.removeItem(`game_${sessionId}`);
  },
};

export default storageService;
