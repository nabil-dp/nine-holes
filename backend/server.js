require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');

const app = require('./src/app');
const { initSocketHandlers } = require('./src/socket/handlers');

const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nine-holes';

// ─── HTTP + SOCKET.IO SERVER ──────────────────────────────────────────────────
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',')
      : ['http://localhost:3000', 'http://localhost:5173'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

initSocketHandlers(io);

// ─── MONGODB CONNECTION ───────────────────────────────────────────────────────
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log(`[DB] MongoDB connected: ${MONGODB_URI}`);
    server.listen(PORT, () => {
      console.log(`[Server] Running on port ${PORT} — ${process.env.NODE_ENV || 'development'} mode`);
    });
  })
  .catch((err) => {
    console.error('[DB] Connection failed:', err.message);
    process.exit(1);
  });

// ─── GRACEFUL SHUTDOWN ────────────────────────────────────────────────────────
process.on('SIGTERM', async () => {
  console.log('[Server] SIGTERM received, shutting down...');
  await mongoose.connection.close();
  server.close(() => process.exit(0));
});

process.on('unhandledRejection', (err) => {
  console.error('[Server] Unhandled rejection:', err.message);
  server.close(() => process.exit(1));
});
