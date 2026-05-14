const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    from_user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    to_user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['invite', 'invite_accepted', 'invite_declined', 'session_result'],
      required: true,
    },
    game_session_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'GameSession',
      default: null,
    },
    message: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: false },
  }
);

notificationSchema.index({ to_user_id: 1, read: 1, created_at: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
