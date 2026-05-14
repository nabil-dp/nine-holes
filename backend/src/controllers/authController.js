const User = require('../models/User');
const Leaderboard = require('../models/Leaderboard');
const { generateToken } = require('../middleware/authMiddleware');
const { successResponse, errorResponse } = require('../utils/helpers');
const { ConflictError } = require('../utils/errors');

const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      const field = existing.email === email ? 'Email' : 'Username';
      throw new ConflictError(`${field} already exists`);
    }

    const user = await User.create({ username, email, password });

    await Leaderboard.create({
      user_id: user._id,
      username: user.username,
      total_sessions_won: 0,
      total_sessions_played: 0,
      win_rate: 0,
    });

    const token = generateToken(user._id);

    return successResponse(res, { token, user: user.toPublicJSON() }, 201, 'Registration successful');
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { identifier, password } = req.body;

    const user = await User.findOne({
      $or: [{ email: identifier.toLowerCase() }, { username: identifier }],
    }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    const token = generateToken(user._id);

    return successResponse(res, { token, user: user.toPublicJSON() }, 200, 'Login successful');
  } catch (err) {
    next(err);
  }
};

const logout = (req, res) => {
  return successResponse(res, null, 200, 'Logged out successfully');
};

const getMe = async (req, res, next) => {
  try {
    return successResponse(res, { user: req.user.toPublicJSON() });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, logout, getMe };
