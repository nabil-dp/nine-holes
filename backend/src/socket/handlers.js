const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { registerGameSocket } = require('./gameSocket');
const { registerNotificationSocket } = require('./notificationSocket');

/**
 * Socket.io authentication middleware.
 * Expects the client to send a JWT token in the handshake auth:
 *   socket = io(SERVER_URL, { auth: { token: 'Bearer <jwt>' } })
 */
const socketAuthMiddleware = async (socket, next) => {
  try {
    const authHeader = socket.handshake.auth?.token;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new Error('Authentication error: No token provided'));
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) return next(new Error('Authentication error: User not found'));

    socket.user = user;
    next();
  } catch (err) {
    next(new Error('Authentication error: Invalid token'));
  }
};

/**
 * Register all socket event handlers.
 */
const initSocketHandlers = (io) => {
  io.use(socketAuthMiddleware);

  io.on('connection', (socket) => {
    console.log(`[Socket] User connected: ${socket.user.username} (${socket.id})`);

    registerGameSocket(io, socket);
    registerNotificationSocket(io, socket);

    socket.on('disconnect', (reason) => {
      console.log(`[Socket] User disconnected: ${socket.user.username} — ${reason}`);
    });

    socket.on('error', (err) => {
      console.error(`[Socket] Error for ${socket.user.username}:`, err.message);
    });
  });
};

module.exports = { initSocketHandlers };
