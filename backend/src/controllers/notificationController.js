const Notification = require('../models/Notification');
const { successResponse } = require('../utils/helpers');
const { NotFoundError, ForbiddenError } = require('../utils/errors');

const getNotifications = async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (req.user._id.toString() !== userId) {
      throw new ForbiddenError('Cannot access another user notifications');
    }

    const notifications = await Notification.find({ to_user_id: userId, read: false })
      .populate('from_user_id', 'username avatar')
      .sort({ created_at: -1 });

    return successResponse(res, { notifications, count: notifications.length });
  } catch (err) {
    next(err);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const { userId, notificationId } = req.params;

    if (req.user._id.toString() !== userId) {
      throw new ForbiddenError('Cannot modify another user notifications');
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, to_user_id: userId },
      { read: true },
      { new: true }
    );

    if (!notification) throw new NotFoundError('Notification');

    return successResponse(res, { notification }, 200, 'Notification marked as read');
  } catch (err) {
    next(err);
  }
};

const deleteNotification = async (req, res, next) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findById(notificationId);
    if (!notification) throw new NotFoundError('Notification');

    if (notification.to_user_id.toString() !== req.user._id.toString()) {
      throw new ForbiddenError('Cannot delete another user notification');
    }

    await notification.deleteOne();

    return successResponse(res, null, 200, 'Notification deleted');
  } catch (err) {
    next(err);
  }
};

module.exports = { getNotifications, markAsRead, deleteNotification };
