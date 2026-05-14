const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  deleteNotification,
} = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

router.get('/:userId', getNotifications);
router.post('/:userId/read/:notificationId', markAsRead);
router.delete('/:notificationId', deleteNotification);

module.exports = router;
