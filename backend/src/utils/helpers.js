/**
 * Check win condition for Nine Holes game.
 * Win = 3 same-colored balls in any row or column 
 * board: array of 9 strings (null | 'player1' | 'player2')
 * positions:
 *   0 | 1 | 2
 *   3 | 4 | 5
 *   6 | 7 | 8
 */
const WIN_LINES = [
  [0, 1, 2], // row 1
  [3, 4, 5], // row 2
  [6, 7, 8], // row 3
  [0, 3, 6], // col 1
  [1, 4, 7], // col 2
  [2, 5, 8], // col 3
];

const checkWin = (board) => {
  for (const [a, b, c] of WIN_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
};

/**
 * Check if placement phase is complete.
 * Complete when both players have placed all 3 balls (6 balls total on board).
 */
const isPlacementComplete = (player1BallsPlaced, player2BallsPlaced) => {
  return player1BallsPlaced >= 3 && player2BallsPlaced >= 3;
};

/**
 * Returns the color identifier for a player in a game.
 */
const getPlayerColor = (game, playerId) => {
  if (game.player1_id.toString() === playerId.toString()) return 'player1';
  if (game.player2_id.toString() === playerId.toString()) return 'player2';
  return null;
};

/**
 * Count how many balls a player has on the board.
 */
const countBallsOnBoard = (board, color) => {
  return board.filter((cell) => cell === color).length;
};

/**
 * Build a formatted API response.
 */
const successResponse = (res, data, statusCode = 200, message = 'Success') => {
  return res.status(statusCode).json({ success: true, message, data });
};

const errorResponse = (res, message, statusCode = 400, errors = null) => {
  const payload = { success: false, message };
  if (errors) payload.errors = errors;
  return res.status(statusCode).json(payload);
};

module.exports = {
  checkWin,
  isPlacementComplete,
  getPlayerColor,
  countBallsOnBoard,
  successResponse,
  errorResponse,
};
