import { io } from 'socket.io-client';
import { SOCKET_URL, TOKEN_KEY } from '../utils/constants';

let socket = null;

const socketService = {
  connect() {
    if (socket?.connected) return socket;

    const token = localStorage.getItem(TOKEN_KEY);
    socket = io(SOCKET_URL, {
      auth: { token: `Bearer ${token}` },
      transports: ['websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => console.log('[Socket] Connected:', socket.id));
    socket.on('disconnect', (reason) => console.log('[Socket] Disconnected:', reason));
    socket.on('connect_error', (err) => console.error('[Socket] Error:', err.message));

    return socket;
  },

  disconnect() {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  },

  emit(event, data) {
    if (!socket?.connected) return;
    socket.emit(event, data);
  },

  on(event, callback) {
    if (!socket) return;
    socket.on(event, callback);
  },

  off(event, callback) {
    if (!socket) return;
    callback ? socket.off(event, callback) : socket.off(event);
  },

  get instance() {
    return socket;
  },

  get isConnected() {
    return socket?.connected ?? false;
  },
};

export default socketService;
