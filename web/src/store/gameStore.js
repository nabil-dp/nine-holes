import { create } from 'zustand';

const useGameStore = create((set) => ({
  session: null,
  boardState: Array(9).fill(null),
  phase: 'placement',
  currentTurn: null,
  player1GamesWon: 0,
  player2GamesWon: 0,
  gamesPlayed: 0,
  gameNumber: 1,
  lastWinner: null,
  sessionEnded: false,
  sessionWinnerId: null,
  selectedCell: null,

  setSession: (session) => set({ session }),

  setBoardState: (boardState) => set({ boardState }),

  setPhase: (phase) => set({ phase }),

  setCurrentTurn: (currentTurn) => set({ currentTurn }),

  setSelectedCell: (selectedCell) => set({ selectedCell }),

  applyBallPlaced: ({ board_state, phase, current_turn, player1_balls_placed, player2_balls_placed }) => {
    set({ boardState: board_state, phase, currentTurn: current_turn });
  },

  applyBallMoved: ({ board_state, current_turn }) => {
    set({ boardState: board_state, currentTurn: current_turn, selectedCell: null });
  },

  applyGameWon: ({ winner_id, game_number, board_state, player1_games_won, player2_games_won }) => {
    set({
      boardState: board_state,
      lastWinner: winner_id,
      gameNumber: game_number,
      player1GamesWon: player1_games_won,
      player2GamesWon: player2_games_won,
    });
  },

  applyGameStarted: ({ board_state, phase, current_turn, game_number, player1_games_won, player2_games_won }) => {
    set({
      boardState: board_state,
      phase,
      currentTurn: current_turn,
      gameNumber: game_number,
      player1GamesWon: player1_games_won,
      player2GamesWon: player2_games_won,
      lastWinner: null,
      selectedCell: null,
    });
  },

  applySessionEnded: ({ session_winner_id, player1_games_won, player2_games_won, games_played }) => {
    set({
      sessionEnded: true,
      sessionWinnerId: session_winner_id,
      player1GamesWon: player1_games_won,
      player2GamesWon: player2_games_won,
      gamesPlayed: games_played,
    });
  },

  applyGameJoined: ({ board_state, phase, current_turn, game_number, player1_games_won, player2_games_won, status }) => {
    set({
      boardState: board_state,
      phase,
      currentTurn: current_turn,
      gameNumber: game_number,
      player1GamesWon: player1_games_won ?? 0,
      player2GamesWon: player2_games_won ?? 0,
      sessionEnded: status === 'finished',
      selectedCell: null,
      lastWinner: null,
    });
  },

  reset: () =>
    set({
      session: null,
      boardState: Array(9).fill(null),
      phase: 'placement',
      currentTurn: null,
      player1GamesWon: 0,
      player2GamesWon: 0,
      gamesPlayed: 0,
      gameNumber: 1,
      lastWinner: null,
      sessionEnded: false,
      sessionWinnerId: null,
      selectedCell: null,
    }),
}));

export default useGameStore;
