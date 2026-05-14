const Leaderboard = require('../models/Leaderboard');
const { successResponse } = require('../utils/helpers');
const { NotFoundError } = require('../utils/errors');

const getLeaderboard = async (req, res, next) => {
  try {
    const ranked = await Leaderboard.getRanked();
    return successResponse(res, { leaderboard: ranked, count: ranked.length });
  } catch (err) {
    next(err);
  }
};

const getTopTen = async (req, res, next) => {
  try {
    const ranked = await Leaderboard.getRanked(10);
    return successResponse(res, { leaderboard: ranked });
  } catch (err) {
    next(err);
  }
};

const getUserRank = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const ranked = await Leaderboard.getRanked();
    const userEntry = ranked.find((e) => e.user_id._id.toString() === userId);

    if (!userEntry) throw new NotFoundError('User leaderboard entry');

    return successResponse(res, { entry: userEntry });
  } catch (err) {
    next(err);
  }
};

module.exports = { getLeaderboard, getTopTen, getUserRank };
