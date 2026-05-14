const Notification = require('../models/Notification');
const User = require('../models/User');

/**
 * Map of userId -> socketId for tracking online users.
 * Shared across all socket handlers via module scope.
 */
const onlineUsers = new Map();

const registerNotificationSocket = (io, socket) => {
  // Track user as online
  onlineUsers.set(socket.user._id.toString(), socket.id);

  // Broadcast updated online list (optional, for UI indicators)
  io.emit('users_online', Array.from(onlineUsers.keys()));

  // ─── SEND INVITE ─────────────────────────────────────────────────────────────
  socket.on('send_invite', async ({ to_user_id }) => {
    try {
      const fromUser = socket.user;

      if (fromUser._id.toString() === to_user_id) {
        return socket.emit('error', { message: 'You cannot invite yourself' });
      }

      const toUser = await User.findById(to_user_id);
      if (!toUser) return socket.emit('error', { message: 'User not found' });

      const notification = await Notification.create({
        from_user_id: fromUser._id,
        to_user_id,
        type: 'invite',
        message: `${fromUser.username} invited you to play Nine Holes!`,
      });

      // If recipient is online, send real-time notification
      const recipientSocketId = onlineUsers.get(to_user_id);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('invite_received', {
          notification_id: notification._id,
          from_user: {
            _id: fromUser._id,
            username: fromUser.username,
            avatar: fromUser.avatar,
          },
          message: notification.message,
        });
      }

      socket.emit('invite_sent', {
        to_user: { _id: toUser._id, username: toUser.username },
        message: `Invite sent to ${toUser.username}`,
      });
    } catch (err) {
      console.error('send_invite error:', err);
      socket.emit('error', { message: 'Failed to send invite' });
    }
  });

  // ─── ACCEPT INVITE ───────────────────────────────────────────────────────────
  socket.on('accept_invite', async ({ notification_id }) => {
    try {
      const notification = await Notification.findById(notification_id).populate(
        'from_user_id',
        'username avatar'
      );

      if (!notification) return socket.emit('error', { message: 'Invite not found' });
      if (notification.to_user_id.toString() !== socket.user._id.toString()) {
        return socket.emit('error', { message: 'This invite is not for you' });
      }
      if (notification.type !== 'invite') {
        return socket.emit('error', { message: 'Invalid notification type' });
      }

      notification.read = true;
      await notification.save();

      // ─── AUTO CREATE GAME SESSION ───────────────────────────────────────────
      const GameSession = require('../models/GameSession');
      const firstGame = {
        game_number: 1,
        player1_id: notification.from_user_id._id,
        player2_id: socket.user._id,
        board_state: Array(9).fill(null),
        phase: 'placement',
        current_turn: notification.from_user_id._id,
        player1_balls_placed: 0,
        player2_balls_placed: 0,
        moves: [],
      };

      const gameSession = await GameSession.create({
        player1_id: notification.from_user_id._id,
        player2_id: socket.user._id,
        games: [firstGame],
        games_played: 0,
        player1_games_won: 0,
        player2_games_won: 0,
        status: 'active',
      });

      // ─── NOTIFY BOTH PLAYERS TO JOIN GAME ────────────────────────────────────
      const inviterSocketId = onlineUsers.get(notification.from_user_id._id.toString());

      // Emit ke Pemain A (yang kirim invite)
      if (inviterSocketId) {
        io.to(inviterSocketId).emit('game_ready', {
          session_id: gameSession._id,
          opponent: {
            _id: socket.user._id,
            username: socket.user.username,
            avatar: socket.user.avatar,
          },
          message: `${socket.user.username} accepted! Game room ready.`,
        });
      }

      // Emit ke Pemain B (penerima invite) - untuk auto redirect
      socket.emit('game_ready', {
        session_id: gameSession._id,
        opponent: {
          _id: notification.from_user_id._id,
          username: notification.from_user_id.username,
          avatar: notification.from_user_id.avatar,
        },
        message: `You accepted the invite! Redirecting to game room...`,
      });

      // Save acceptance notification for inviter
      await Notification.create({
        from_user_id: socket.user._id,
        to_user_id: notification.from_user_id._id,
        type: 'invite_accepted',
        message: `${socket.user.username} accepted your invite!`,
      });
    } catch (err) {
      console.error('accept_invite error:', err);
      socket.emit('error', { message: 'Failed to accept invite' });
    }
  });

  // ─── DECLINE INVITE ──────────────────────────────────────────────────────────
  socket.on('decline_invite', async ({ notification_id }) => {
    try {
      const notification = await Notification.findById(notification_id).populate(
        'from_user_id',
        'username'
      );

      if (!notification) return socket.emit('error', { message: 'Invite not found' });
      if (notification.to_user_id.toString() !== socket.user._id.toString()) {
        return socket.emit('error', { message: 'This invite is not for you' });
      }

      notification.read = true;
      await notification.save();

      // Notify the inviter if online
      const inviterSocketId = onlineUsers.get(notification.from_user_id._id.toString());
      if (inviterSocketId) {
        io.to(inviterSocketId).emit('invite_declined', {
          from_user: {
            _id: socket.user._id,
            username: socket.user.username,
          },
          message: `${socket.user.username} declined your invite.`,
        });
      }

      socket.emit('invite_declined_confirmed', {
        message: `You declined the invite from ${notification.from_user_id.username}`,
      });
    } catch (err) {
      console.error('decline_invite error:', err);
      socket.emit('error', { message: 'Failed to decline invite' });
    }
  });

  // ─── DISCONNECT ──────────────────────────────────────────────────────────────
  socket.on('disconnect', () => {
    onlineUsers.delete(socket.user._id.toString());
    io.emit('users_online', Array.from(onlineUsers.keys()));
  });
};

module.exports = { registerNotificationSocket, onlineUsers };