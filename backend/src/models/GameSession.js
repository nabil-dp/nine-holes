const mongoose = require('mongoose');

const moveSchema = new mongoose.Schema(
  {
    player_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['place', 'move'], required: true },
    from_position: { type: Number, default: null },
    to_position: { type: Number, required: true },
    board_snapshot: { type: [String], required: true },
  },
  { _id: false, timestamps: { createdAt: 'created_at', updatedAt: false } }
);

const gameSchema = new mongoose.Schema(
  {
    game_number: { type: Number, required: true, min: 1, max: 5 },
    player1_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    player2_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    winner_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    board_state: {
      type: [String],
      default: Array(9).fill(null),
      validate: {
        validator: (v) => v.length === 9,
        message: 'Board must have exactly 9 cells',
      },
    },
    phase: { type: String, enum: ['placement', 'playing', 'finished'], default: 'placement' },
    current_turn: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    player1_balls_placed: { type: Number, default: 0 },
    player2_balls_placed: { type: Number, default: 0 },
    moves: [moveSchema],
  },
  { _id: false, timestamps: { createdAt: 'created_at', updatedAt: false } }
);

const gameSessionSchema = new mongoose.Schema(
  {
    player1_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    player2_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    games: [gameSchema],
    games_played: { type: Number, default: 0, min: 0, max: 5 },
    player1_games_won: { type: Number, default: 0, min: 0, max: 5 },
    player2_games_won: { type: Number, default: 0, min: 0, max: 5 },
    session_winner_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    status: {
      type: String,
      enum: ['waiting', 'active', 'finished'],
      default: 'waiting',
    },
    ended_at: { type: Date, default: null },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

gameSessionSchema.methods.getCurrentGame = function () {
  return this.games[this.games_played] || null;
};

gameSessionSchema.methods.isSessionFinished = function () {
  return this.games_played >= 5 || this.player1_games_won >= 3 || this.player2_games_won >= 3;
};

module.exports = mongoose.model('GameSession', gameSessionSchema);
