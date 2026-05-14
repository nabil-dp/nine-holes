export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

export const TOKEN_KEY = 'nine_holes_token';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  GAME: '/game/:sessionId',
  LEADERBOARD: '/leaderboard',
  PROFILE: '/profile',
};

export const SOCKET_EVENTS = {
  // Game
  JOIN_GAME: 'join_game',
  LEAVE_GAME: 'leave_game',
  GAME_JOINED: 'game_joined',
  PLACE_BALL: 'place_ball',
  BALL_PLACED: 'ball_placed',
  MOVE_BALL: 'move_ball',
  BALL_MOVED: 'ball_moved',
  GAME_WON: 'game_won',
  GAME_STARTED: 'game_started',
  SESSION_ENDED: 'session_ended',
  GAME_READY: 'game_ready',
  // Notifications
  SEND_INVITE: 'send_invite',
  INVITE_SENT: 'invite_sent',
  INVITE_RECEIVED: 'invite_received',
  ACCEPT_INVITE: 'accept_invite',
  INVITE_ACCEPTED: 'invite_accepted',
  DECLINE_INVITE: 'decline_invite',
  INVITE_DECLINED: 'invite_declined',
  USERS_ONLINE: 'users_online',
  // Misc
  ERROR: 'error',
};

export const GAME_PHASE = {
  PLACEMENT: 'placement',
  PLAYING: 'playing',
  FINISHED: 'finished',
};

export const PLAYER_COLOR = {
  PLAYER1: 'player1',
  PLAYER2: 'player2',
};

// Win lines: rows and columns only (no diagonal)
export const WIN_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
];