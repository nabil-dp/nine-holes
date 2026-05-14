const express = require('express');
const router = express.Router();
const { getLeaderboard, getTopTen, getUserRank } = require('../controllers/leaderboardController');
const { protect } = require('../middleware/authMiddleware');

// Leaderboard is public - no auth required for viewing
router.get('/', getLeaderboard);
router.get('/top10', getTopTen);
router.get('/user/:userId', protect, getUserRank);

module.exports = router;
