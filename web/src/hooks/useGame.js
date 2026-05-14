import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useGameStore from '../store/gameStore';
import useAuthStore from '../store/authStore';
import socketService from '../services/socketService';
import { gameAPI } from '../services/api';
import { SOCKET_EVENTS, GAME_PHASE } from '../utils/constants';
import { getPlayerColor } from '../utils/helpers';

const useGame = (sessionId) => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const {
    session,
    boardState,
    phase,
    currentTurn,
    player1GamesWon,
    player2GamesWon,
    gamesPlayed,
    gameNumber,
    lastWinner,
    sessionEnded,
    sessionWinnerId,
    selectedCell,
    setSession,
    setSelectedCell,
    applyBallPlaced,
    applyBallMoved,
    applyGameWon,
    applyGameStarted,
    applySessionEnded,
    applyGameJoined,
    reset,
  } = useGameStore();

  const myColor = getPlayerColor(session, user?._id);

  // Normalize IDs for comparison
  const currentTurnStr = currentTurn?._id?.toString() || currentTurn?.toString();
  const userIdStr = user?._id?.toString();
  const isMyTurn = currentTurnStr === userIdStr && !!currentTurnStr;

  useEffect(() => {
    if (!sessionId) return;

    socketService.emit(SOCKET_EVENTS.JOIN_GAME, { session_id: sessionId });

    socketService.on(SOCKET_EVENTS.GAME_JOINED, applyGameJoined);
    socketService.on(SOCKET_EVENTS.BALL_PLACED, applyBallPlaced);
    socketService.on(SOCKET_EVENTS.BALL_MOVED, applyBallMoved);
    socketService.on(SOCKET_EVENTS.GAME_WON, applyGameWon);
    socketService.on(SOCKET_EVENTS.GAME_STARTED, applyGameStarted);
    socketService.on(SOCKET_EVENTS.SESSION_ENDED, applySessionEnded);

    return () => {
      socketService.emit(SOCKET_EVENTS.LEAVE_GAME, { session_id: sessionId });
      socketService.off(SOCKET_EVENTS.GAME_JOINED);
      socketService.off(SOCKET_EVENTS.BALL_PLACED);
      socketService.off(SOCKET_EVENTS.BALL_MOVED);
      socketService.off(SOCKET_EVENTS.GAME_WON);
      socketService.off(SOCKET_EVENTS.GAME_STARTED);
      socketService.off(SOCKET_EVENTS.SESSION_ENDED);
    };
  }, [sessionId, applyGameJoined, applyBallPlaced, applyBallMoved, applyGameWon, applyGameStarted, applySessionEnded]);

  useEffect(() => {
    if (!sessionId) return;
    gameAPI
      .getSession(sessionId)
      .then((res) => setSession(res.data.session))
      .catch(() => navigate('/dashboard'));
  }, [sessionId, setSession, navigate]);

  const placeBall = useCallback(
    (position) => {
      if (!isMyTurn || phase !== GAME_PHASE.PLACEMENT) return;
      if (boardState[position] !== null) return;
      socketService.emit(SOCKET_EVENTS.PLACE_BALL, { session_id: sessionId, position });
    },
    [isMyTurn, phase, boardState, sessionId]
  );

  const moveBall = useCallback(
    (fromPosition, toPosition) => {
      if (!isMyTurn || phase !== GAME_PHASE.PLAYING) return;
      if (boardState[toPosition] !== null) return;
      if (boardState[fromPosition] !== myColor) return;
      socketService.emit(SOCKET_EVENTS.MOVE_BALL, {
        session_id: sessionId,
        from_position: fromPosition,
        to_position: toPosition,
      });
      setSelectedCell(null);
    },
    [isMyTurn, phase, boardState, sessionId, myColor, setSelectedCell]
  );

  const selectCell = useCallback(
    (index) => {
      // Placement phase: place ball directly
      if (phase === GAME_PHASE.PLACEMENT) {
        placeBall(index);
        return;
      }

      // Playing phase: select and move logic
      if (!isMyTurn || phase !== GAME_PHASE.PLAYING) return;

      if (selectedCell === null) {
        if (boardState[index] === myColor) {
          setSelectedCell(index);
        }
        return;
      }

      if (selectedCell === index) {
        setSelectedCell(null);
        return;
      }

      if (boardState[index] === null) {
        moveBall(selectedCell, index);
        return;
      }

      if (boardState[index] === myColor) {
        setSelectedCell(index);
        return;
      }

      setSelectedCell(null);
    },
    [selectedCell, boardState, myColor, isMyTurn, phase, placeBall, moveBall, setSelectedCell]
  );

  const startSession = useCallback(
    async (opponentId) => {
      const res = await gameAPI.startSession(opponentId);
      const newSession = res.data.session;
      setSession(newSession);
      navigate(`/game/${newSession._id}`);
      return newSession;
    },
    [setSession, navigate]
  );

  const leaveGame = useCallback(() => {
    reset();
    navigate('/dashboard');
  }, [reset, navigate]);

  return {
    session,
    boardState,
    phase,
    currentTurn,
    player1GamesWon,
    player2GamesWon,
    gamesPlayed,
    gameNumber,
    lastWinner,
    sessionEnded,
    sessionWinnerId,
    selectedCell,
    myColor,
    isMyTurn,
    placeBall,
    moveBall,
    selectCell,
    startSession,
    leaveGame,
  };
};

export default useGame;