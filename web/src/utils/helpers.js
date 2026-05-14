import { WIN_LINES } from './constants';

/**
 * Check if a board state has a winner.
 * Returns 'player1' | 'player2' | null
 */
export const checkWin = (board) => {
  for (const [a, b, c] of WIN_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
};

/**
 * Get player color ('player1' | 'player2') based on user ID and session.
 */
export const getPlayerColor = (session, userId) => {
  if (!session || !userId) return null;
  const uid = userId.toString();
  const p1 = (session.player1_id?._id || session.player1_id)?.toString();
  const p2 = (session.player2_id?._id || session.player2_id)?.toString();
  if (p1 === uid) return 'player1';
  if (p2 === uid) return 'player2';
  return null;
};

/**
 * Format a date string to a readable format.
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

/**
 * Get rank badge emoji based on rank number.
 */
export const getRankBadge = (rank) => {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return `#${rank}`;
};

/**
 * Truncate a string to a max length with ellipsis.
 */
export const truncate = (str, max = 15) => {
  if (!str) return '';
  return str.length > max ? str.slice(0, max) + '…' : str;
};