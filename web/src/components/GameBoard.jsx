import { GAME_PHASE } from '../utils/constants';

const cellColor = {
  player1: {
    base: 'bg-blue-500 border-blue-600 shadow-blue-200',
    selected: 'bg-blue-600 border-blue-700 ring-4 ring-blue-300 scale-110',
  },
  player2: {
    base: 'bg-red-500 border-red-600 shadow-red-200',
    selected: 'bg-red-600 border-red-700 ring-4 ring-red-300 scale-110',
  },
};

const Cell = ({ index, value, isSelected, isMyTurn, phase, myColor, hasSelectedCell, onClick }) => {
  const isEmpty = value === null;
  const isMyBall = value === myColor;
  const isValidPlacement = phase === GAME_PHASE.PLACEMENT && isMyTurn && isEmpty;
  const isSelectable = phase === GAME_PHASE.PLAYING && isMyTurn && isMyBall;
  const isMovable = phase === GAME_PHASE.PLAYING && isMyTurn && isEmpty && hasSelectedCell;
  const isClickable = isValidPlacement || isSelectable || isMovable;

  return (
    <button
      onClick={() => onClick(index)}
      disabled={!isClickable}
      className={`
        aspect-square rounded-full border-2 transition-all duration-200 shadow-md
        flex items-center justify-center text-white font-bold text-lg
        ${isEmpty
          ? isMovable
            ? 'bg-gray-200 border-dashed border-gray-400 hover:bg-blue-100 hover:border-blue-400 scale-90'
            : isValidPlacement
              ? 'bg-gray-100 border-gray-300 hover:bg-gray-200 cursor-pointer'
              : 'bg-gray-100 border-gray-200'
          : isSelected
            ? cellColor[value]?.selected
            : cellColor[value]?.base + ' hover:scale-105'
        }
        ${!isClickable ? 'cursor-default opacity-70' : 'cursor-pointer'}
      `}
    >
      {!isEmpty && (
        <span className="drop-shadow-sm text-xl">●</span>
      )}
    </button>
  );
};

const GameBoard = ({ boardState, phase, selectedCell, myColor, isMyTurn, onCellClick }) => {
  return (
    <div className="flex flex-col items-center gap-4">
      {/* Phase indicator */}
      <div className={`text-sm font-medium px-4 py-1.5 rounded-full ${
        phase === GAME_PHASE.PLACEMENT ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
      }`}>
        {phase === GAME_PHASE.PLACEMENT ? '📌 Placement Phase' : '🕹️ Playing Phase'}
      </div>

      {/* Board */}
      <div className="grid grid-cols-3 gap-4 p-6 bg-gray-50 rounded-2xl border-2 border-gray-200 shadow-inner">
        {boardState.map((cell, i) => (
          <Cell
            key={i}
            index={i}
            value={cell}
            isSelected={selectedCell === i}
            isMyTurn={isMyTurn}
            phase={phase}
            myColor={myColor}
            hasSelectedCell={selectedCell !== null}
            onClick={onCellClick}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="flex gap-6 text-sm text-gray-500">
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded-full bg-blue-500 inline-block" />
          <span>Player 1</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded-full bg-red-500 inline-block" />
          <span>Player 2</span>
        </div>
      </div>
    </div>
  );
};

export default GameBoard;