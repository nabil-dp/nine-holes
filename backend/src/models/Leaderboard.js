const mongoose = require('mongoose');

const leaderboardSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    username: {
      type: String,
      required: true,
    },
    total_sessions_won: {
      type: Number,
      default: 0,
      min: 0,
    },
    total_sessions_played: {
      type: Number,
      default: 0,
      min: 0,
    },
    win_rate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'last_updated' },
  }
);

leaderboardSchema.methods.recalculate = function () {
  if (this.total_sessions_played > 0) {
    this.win_rate = Math.round((this.total_sessions_won / this.total_sessions_played) * 100);
  } else {
    this.win_rate = 0;
  }
};

leaderboardSchema.statics.upsertEntry = async function (userId, username, sessionWon) {
  const updateData = {
    $set: { username },
    $inc: { total_sessions_played: 1 },
  };

  if (sessionWon) {
    updateData.$inc.total_sessions_won = 1;
  }

  const entry = await this.findOneAndUpdate(
    { user_id: userId },
    updateData,
    { upsert: true, new: true }
  );

  entry.recalculate();
  await entry.save();
  return entry;
};

leaderboardSchema.statics.getRanked = async function (limit = null) {
  const query = this.find()
    .populate('user_id', 'username avatar')
    .sort({ total_sessions_won: -1, win_rate: -1 });

  if (limit) query.limit(limit);

  const entries = await query.exec();

  return entries.map((entry, index) => ({
    rank: index + 1,
    user_id: entry.user_id,
    username: entry.username,
    total_sessions_won: entry.total_sessions_won,
    total_sessions_played: entry.total_sessions_played,
    win_rate: entry.win_rate,
  }));
};

module.exports = mongoose.model('Leaderboard', leaderboardSchema);