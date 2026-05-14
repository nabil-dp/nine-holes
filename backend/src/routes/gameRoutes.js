const express = require('express');
const router = express.Router();
const {
  startSession,
  getSession,
  getActiveSession,
  getUserSessions,
  getUserStats,
} = require('../controllers/gameController');
const { protect } = require('../middleware/authMiddleware');
const { validateStartGame } = require('../middleware/validation');

// All routes require authentication
router.use(protect);

router.post('/start', validateStartGame, startSession);
router.get('/active', getActiveSession);
router.get('/:sessionId', getSession);
router.get('/user/:userId/sessions', getUserSessions);
router.get('/user/:userId/stats', getUserStats);

module.exports = router;
