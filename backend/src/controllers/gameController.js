const GameSession = require('../models/GameSession');
const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/helpers');
const { NotFoundError, BadRequestError } = require('../utils/errors');

const startSession = async (req, res, next) => {
  try {
    const { opponent_id } = req.body;
    const player1_id = req.user._id;

    if (player1_id.toString() === opponent_id) {
      throw new BadRequestError('You cannot play against yourself');
    }

    const opponent = await User.findById(opponent_id);
    if (!opponent) throw new NotFoundError('Opponent');

    const activeSession = await GameSession.findOne({
      $or: [{ player1_id }, { player2_id: player1_id }],
      status: 'active',
    });
    if (activeSession) {
      throw new BadRequestError('You already have an active session');
    }

    const firstGame = {
      game_number: 1,
      player1_id,
      player2_id: opponent_id,
      board_state: Array(9).fill(null),
      phase: 'placement',
      current_turn: player1_id,
      player1_balls_placed: 0,
      player2_balls_placed: 0,
      moves: [],
    };

    const session = await GameSession.create({
      player1_id,
      player2_id: opponent_id,
      games: [firstGame],
      games_played: 0,
      player1_games_won: 0,
      player2_games_won: 0,
      status: 'active',
    });

    return successResponse(res, { session }, 201, 'Game session started');
  } catch (err) {
    next(err);
  }
};

const getSession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    const session = await GameSession.findById(sessionId)
      .populate('player1_id', 'username avatar')
      .populate('player2_id', 'username avatar')
      .populate('session_winner_id', 'username');

    if (!session) throw new NotFoundError('Game session');

    const isParticipant =
      session.player1_id._id.toString() === req.user._id.toString() ||
      session.player2_id._id.toString() === req.user._id.toString();

    if (!isParticipant) {
      return errorResponse(res, 'Access denied', 403);
    }

    return successResponse(res, { session });
  } catch (err) {
    next(err);
  }
};

const getActiveSession = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const session = await GameSession.findOne({
      $or: [{ player1_id: userId }, { player2_id: userId }],
      status: 'active',
    })
      .populate('player1_id', 'username avatar')
      .populate('player2_id', 'username avatar');

    if (!session) {
      return successResponse(res, { session: null }, 200, 'No active session');
    }

    return successResponse(res, { session });
  } catch (err) {
    next(err);
  }
};

const getUserSessions = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const sessions = await GameSession.find({
      $or: [{ player1_id: userId }, { player2_id: userId }],
    })
      .populate('player1_id', 'username avatar')
      .populate('player2_id', 'username avatar')
      .populate('session_winner_id', 'username')
      .sort({ created_at: -1 });

    return successResponse(res, { sessions, count: sessions.length });
  } catch (err) {
    next(err);
  }
};

const getUserStats = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const sessions = await GameSession.find({
      $or: [{ player1_id: userId }, { player2_id: userId }],
      status: 'finished',
    });

    const total_sessions = sessions.length;
    const sessions_won = sessions.filter(
      (s) => s.session_winner_id && s.session_winner_id.toString() === userId
    ).length;
    const win_rate = total_sessions > 0 ? Math.round((sessions_won / total_sessions) * 100) : 0;

    return successResponse(res, { total_sessions, sessions_won, win_rate });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  startSession,
  getSession,
  getActiveSession,
  getUserSessions,
  getUserStats,
};
