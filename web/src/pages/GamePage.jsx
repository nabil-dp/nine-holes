import { useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import GameBoard from '../components/GameBoard';
import Modal from '../components/Modal';
import Button from '../components/Button';
import Card from '../components/Card';
import Loading from '../components/Loading';
import useGame from '../hooks/useGame';
import useAuth from '../hooks/useAuth';

const ScoreBar = ({ session, player1GamesWon, player2GamesWon, gameNumber }) => {
  if (!session) return null;
  const p1 = session.player1_id;
  const p2 = session.player2_id;
  return (
    <div className="flex items-center justify-between bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-4">
      <div className="text-center flex-1">
        <p className="font-semibold text-blue-600">{p1?.username || 'Player 1'}</p>
        <p className="text-3xl font-bold text-gray-900">{player1GamesWon}</p>
      </div>
      <div className="text-center px-4">
        <p className="text-xs text-gray-400 uppercase tracking-wide">Game</p>
        <p className="text-xl font-bold text-gray-600">{gameNumber}/5</p>
      </div>
      <div className="text-center flex-1">
        <p className="font-semibold text-red-500">{p2?.username || 'Player 2'}</p>
        <p className="text-3xl font-bold text-gray-900">{player2GamesWon}</p>
      </div>
    </div>
  );
};

const TurnBanner = ({ isMyTurn, myColor }) => (
  <div className={`text-center text-sm font-medium py-2 px-4 rounded-full mb-4 ${
    isMyTurn
      ? 'bg-emerald-100 text-emerald-700'
      : 'bg-gray-100 text-gray-500'
  }`}>
    {isMyTurn ? '✅ Your turn' : '⏳ Waiting for opponent...'}
  </div>
);

const GamePage = () => {
  const { sessionId } = useParams();
  const { user } = useAuth();
  const {
    session, boardState, phase, gameNumber,
    player1GamesWon, player2GamesWon,
    lastWinner, sessionEnded, sessionWinnerId,
    selectedCell, myColor, isMyTurn,
    selectCell, leaveGame,
  } = useGame(sessionId);

  if (!session) return <Loading text="Loading game..." fullScreen />;

  const p1 = session.player1_id;
  const p2 = session.player2_id;
  const iWonSession = sessionWinnerId === user?._id || sessionWinnerId?._id === user?._id;

  const getWinnerName = () => {
    if (!lastWinner) return '';
    const winnerId = typeof lastWinner === 'object' ? lastWinner._id : lastWinner;
    if (p1?._id === winnerId || p1 === winnerId) return p1?.username || 'Player 1';
    return p2?.username || 'Player 2';
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      {/* Back button */}
      <button
        onClick={leaveGame}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors"
      >
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      {/* Score bar */}
      <ScoreBar
        session={session}
        player1GamesWon={player1GamesWon}
        player2GamesWon={player2GamesWon}
        gameNumber={gameNumber}
      />

      {/* Turn banner */}
      <TurnBanner isMyTurn={isMyTurn} myColor={myColor} />

      {/* Board */}
      <GameBoard
        boardState={boardState}
        phase={phase}
        selectedCell={selectedCell}
        myColor={myColor}
        isMyTurn={isMyTurn}
        onCellClick={selectCell}
      />

      {/* My color info */}
      <div className="mt-4 text-center text-sm text-gray-400">
        You are{' '}
        <span className={`font-semibold ${myColor === 'player1' ? 'text-blue-600' : 'text-red-500'}`}>
          {myColor === 'player1' ? p1?.username : p2?.username}
        </span>
        {' '}({myColor === 'player1' ? '🔵' : '🔴'})
      </div>

      {/* Round Won Modal */}
      <Modal isOpen={!!lastWinner && phase === 'finished' && !sessionEnded} onClose={() => {}} title="Round Over!">
        <div className="text-center">
          <div className="text-5xl mb-4">🎯</div>
          <p className="text-lg font-semibold text-gray-800 mb-1">
            {getWinnerName()} won this round!
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Score: {player1GamesWon} – {player2GamesWon}
          </p>
          <p className="text-sm text-gray-400">Next round starting...</p>
        </div>
      </Modal>

      {/* Session Ended Modal */}
      <Modal isOpen={sessionEnded} onClose={leaveGame} title="Session Complete!">
        <div className="text-center">
          <div className="text-5xl mb-4">{iWonSession ? '🏆' : '😔'}</div>
          <p className="text-xl font-bold text-gray-900 mb-2">
            {iWonSession ? 'You won the session!' : 'You lost the session.'}
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Final: {player1GamesWon} – {player2GamesWon} (5 rounds)
          </p>
          <div className="flex gap-2 justify-center">
            <Button onClick={leaveGame}>Back to Dashboard</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default GamePage;
