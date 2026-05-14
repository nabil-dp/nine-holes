const GameSession = require('../models/GameSession');
const Leaderboard = require('../models/Leaderboard');
const Notification = require('../models/Notification');
const { checkWin, isPlacementComplete, getPlayerColor } = require('../utils/helpers');

/**
 * Advance to the next game in the session, or end the session if 5 games played.
 * Returns true if session ended, false if a new game was started.
 */
const advanceSession = async (session, io) => {
  const isOver = session.player1_games_won >= 3 || session.player2_games_won >= 3 || session.games_played >= 5;

  if (isOver) {
    session.status = 'finished';
    session.ended_at = new Date();

    const winnerId =
      session.player1_games_won >= session.player2_games_won
        ? session.player1_id
        : session.player2_id;
    session.session_winner_id = winnerId;

    await session.save();

    await session.populate('player1_id', 'username').populate('player2_id', 'username');

    const sessionWonByP1 = session.session_winner_id.toString() === session.player1_id._id.toString();

    await Leaderboard.upsertEntry(session.player1_id._id, session.player1_id.username, sessionWonByP1);
    await Leaderboard.upsertEntry(session.player2_id._id, session.player2_id.username, !sessionWonByP1);

    const resultNotifBase = {
      type: 'session_result',
      game_session_id: session._id,
    };

    await Notification.create([
      {
        ...resultNotifBase,
        from_user_id: session.player1_id,
        to_user_id: session.player1_id,
        message: sessionWonByP1 ? 'You won the session! 🎉' : 'You lost the session.',
      },
      {
        ...resultNotifBase,
        from_user_id: session.player2_id,
        to_user_id: session.player2_id,
        message: !sessionWonByP1 ? 'You won the session! 🎉' : 'You lost the session.',
      },
    ]);

    io.to(session._id.toString()).emit('session_ended', {
      session_id: session._id,
      session_winner_id: session.session_winner_id,
      player1_games_won: session.player1_games_won,
      player2_games_won: session.player2_games_won,
      games_played: session.games_played,
    });

    return true;
  }

  // Start next game
  const nextGameNumber = session.games_played + 1;
  const nextGame = {
    game_number: nextGameNumber,
    player1_id: session.player1_id,
    player2_id: session.player2_id,
    board_state: Array(9).fill(null),
    phase: 'placement',
    current_turn: session.player1_id,
    player1_balls_placed: 0,
    player2_balls_placed: 0,
    moves: [],
  };

  session.games.push(nextGame);
  await session.save();

  io.to(session._id.toString()).emit('game_started', {
    session_id: session._id,
    game_number: nextGameNumber,
    board_state: nextGame.board_state,
    phase: 'placement',
    current_turn: session.player1_id,
    player1_games_won: session.player1_games_won,
    player2_games_won: session.player2_games_won,
  });

  return false;
};

const registerGameSocket = (io, socket) => {
  // ─── JOIN GAME ROOM ───────────────────────────────────────────────────────────
  socket.on('join_game', async ({ session_id }) => {
    try {
      const session = await GameSession.findById(session_id)
        .populate('player1_id', 'username avatar')
        .populate('player2_id', 'username avatar');

      if (!session) return socket.emit('error', { message: 'Session not found' });

      const userId = socket.user._id.toString();
      const isParticipant =
        session.player1_id._id.toString() === userId ||
        session.player2_id._id.toString() === userId;

      if (!isParticipant) return socket.emit('error', { message: 'Access denied' });

      socket.join(session_id);

      const currentGame = session.games[session.games_played] || session.games[session.games.length - 1];

      socket.emit('game_joined', {
        session_id,
        player1: session.player1_id,
        player2: session.player2_id,
        board_state: currentGame?.board_state || Array(9).fill(null),
        phase: currentGame?.phase || 'placement',
        current_turn: currentGame?.current_turn,
        game_number: currentGame?.game_number || 1,
        player1_games_won: session.player1_games_won,
        player2_games_won: session.player2_games_won,
        status: session.status,
      });
    } catch (err) {
      socket.emit('error', { message: 'Failed to join game' });
    }
  });

  // ─── LEAVE GAME ROOM ─────────────────────────────────────────────────────────
  socket.on('leave_game', ({ session_id }) => {
    socket.leave(session_id);
    socket.emit('game_left', { message: 'Left game room' });
  });

  // ─── PLACE BALL (Placement Phase) ────────────────────────────────────────────
  socket.on('place_ball', async ({ session_id, position }) => {
    try {
      const session = await GameSession.findById(session_id);
      if (!session || session.status !== 'active') {
        return socket.emit('error', { message: 'Session not found or not active' });
      }

      const currentGame = session.games[session.games_played];
      if (!currentGame) return socket.emit('error', { message: 'No active game' });
      if (currentGame.phase !== 'placement') {
        return socket.emit('error', { message: 'Not in placement phase' });
      }

      const userId = socket.user._id.toString();
      if (currentGame.current_turn.toString() !== userId) {
        return socket.emit('error', { message: 'Not your turn' });
      }

      if (position < 0 || position > 8) {
        return socket.emit('error', { message: 'Invalid position' });
      }
      if (currentGame.board_state[position] !== null) {
        return socket.emit('error', { message: 'Cell already occupied' });
      }

      const playerColor = getPlayerColor(currentGame, userId);
      const isPlayer1 = playerColor === 'player1';

      const ballsPlaced = isPlayer1
        ? currentGame.player1_balls_placed
        : currentGame.player2_balls_placed;

      if (ballsPlaced >= 3) {
        return socket.emit('error', { message: 'You have already placed all 3 balls' });
      }

      // Place ball
      currentGame.board_state[position] = playerColor;
      currentGame.moves.push({
        player_id: userId,
        type: 'place',
        to_position: position,
        board_snapshot: [...currentGame.board_state],
      });

      if (isPlayer1) {
        currentGame.player1_balls_placed += 1;
      } else {
        currentGame.player2_balls_placed += 1;
      }

      // Check if placement phase is done
      const placementDone = isPlacementComplete(
        currentGame.player1_balls_placed,
        currentGame.player2_balls_placed
      );

      // ─── CHECK WIN EVEN IN PLACEMENT PHASE ───────────────────────────────────
      const winner = checkWin(currentGame.board_state);

      if (winner) {
        // Player menang even in placement phase!
        const winnerId = winner === 'player1' ? currentGame.player1_id : currentGame.player2_id;
        currentGame.winner_id = winnerId;
        currentGame.phase = 'finished';

        if (winner === 'player1') {
          session.player1_games_won += 1;
        } else {
          session.player2_games_won += 1;
        }
        session.games_played += 1;

        session.markModified('games');
        await session.save();

        io.to(session_id).emit('ball_placed', {
          session_id,
          position,
          player_color: playerColor,
          board_state: currentGame.board_state,
          phase: currentGame.phase,
          current_turn: currentGame.current_turn,
          player1_balls_placed: currentGame.player1_balls_placed,
          player2_balls_placed: currentGame.player2_balls_placed,
        });

        io.to(session_id).emit('game_won', {
          session_id,
          winner_id: winnerId,
          winner_color: winner,
          game_number: currentGame.game_number,
          board_state: currentGame.board_state,
          player1_games_won: session.player1_games_won,
          player2_games_won: session.player2_games_won,
        });

        await advanceSession(session, io);
        return;
      }

      if (placementDone) {
        currentGame.phase = 'playing';
        currentGame.current_turn = currentGame.player1_id;
      } else {
        // Alternate turns
        currentGame.current_turn =
          currentGame.current_turn.toString() === currentGame.player1_id.toString()
            ? currentGame.player2_id
            : currentGame.player1_id;
      }

      session.markModified('games');
      await session.save();

      io.to(session_id).emit('ball_placed', {
        session_id,
        position,
        player_color: playerColor,
        board_state: currentGame.board_state,
        phase: currentGame.phase,
        current_turn: currentGame.current_turn,
        player1_balls_placed: currentGame.player1_balls_placed,
        player2_balls_placed: currentGame.player2_balls_placed,
      });
    } catch (err) {
      console.error('place_ball error:', err);
      socket.emit('error', { message: 'Failed to place ball' });
    }
  });

  // ─── MOVE BALL (Playing Phase) ────────────────────────────────────────────────
  socket.on('move_ball', async ({ session_id, from_position, to_position }) => {
    try {
      const session = await GameSession.findById(session_id);
      if (!session || session.status !== 'active') {
        return socket.emit('error', { message: 'Session not found or not active' });
      }

      const currentGame = session.games[session.games_played];
      if (!currentGame) return socket.emit('error', { message: 'No active game' });
      if (currentGame.phase !== 'playing') {
        return socket.emit('error', { message: 'Not in playing phase' });
      }

      const userId = socket.user._id.toString();
      if (currentGame.current_turn.toString() !== userId) {
        return socket.emit('error', { message: 'Not your turn' });
      }

      if (from_position < 0 || from_position > 8 || to_position < 0 || to_position > 8) {
        return socket.emit('error', { message: 'Invalid position' });
      }
      if (from_position === to_position) {
        return socket.emit('error', { message: 'Must move to a different cell' });
      }

      const playerColor = getPlayerColor(currentGame, userId);

      if (currentGame.board_state[from_position] !== playerColor) {
        return socket.emit('error', { message: 'That is not your ball' });
      }
      if (currentGame.board_state[to_position] !== null) {
        return socket.emit('error', { message: 'Target cell is occupied' });
      }

      // Move ball
      currentGame.board_state[to_position] = playerColor;
      currentGame.board_state[from_position] = null;
      currentGame.moves.push({
        player_id: userId,
        type: 'move',
        from_position,
        to_position,
        board_snapshot: [...currentGame.board_state],
      });

      // Check win
      const winner = checkWin(currentGame.board_state);

      if (winner) {
        const winnerId =
          winner === 'player1'
            ? currentGame.player1_id
            : currentGame.player2_id;

        currentGame.winner_id = winnerId;
        currentGame.phase = 'finished';

        if (winner === 'player1') {
          session.player1_games_won += 1;
        } else {
          session.player2_games_won += 1;
        }
        session.games_played += 1;

        session.markModified('games');
        await session.save();

        io.to(session_id).emit('ball_moved', {
          session_id,
          from_position,
          to_position,
          player_color: playerColor,
          board_state: currentGame.board_state,
          current_turn: currentGame.current_turn,
        });

        io.to(session_id).emit('game_won', {
          session_id,
          winner_id: winnerId,
          winner_color: winner,
          game_number: currentGame.game_number,
          board_state: currentGame.board_state,
          player1_games_won: session.player1_games_won,
          player2_games_won: session.player2_games_won,
        });

        await advanceSession(session, io);
      } else {
        // Switch turns
        currentGame.current_turn =
          currentGame.current_turn.toString() === currentGame.player1_id.toString()
            ? currentGame.player2_id
            : currentGame.player1_id;

        session.markModified('games');
        await session.save();

        io.to(session_id).emit('ball_moved', {
          session_id,
          from_position,
          to_position,
          player_color: playerColor,
          board_state: currentGame.board_state,
          current_turn: currentGame.current_turn,
        });
      }
    } catch (err) {
      console.error('move_ball error:', err);
      socket.emit('error', { message: 'Failed to move ball' });
    }
  });
};

module.exports = { registerGameSocket };