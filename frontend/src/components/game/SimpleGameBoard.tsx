import React from 'react';
import { CellPosition } from '../../types/index';
import SimpleMatrixCell from './SimpleMatrixCell';
import { toggleCell } from '../../utils/game/board';

interface SimpleGameBoardProps {
  board: number[][];
  onCellClick?: (row: number, col: number) => void;
  disabled?: boolean;
  highlightedCells?: CellPosition[];
}

const SimpleGameBoard: React.FC<SimpleGameBoardProps> = ({
  board,
  onCellClick,
  disabled = false,
  highlightedCells = []
}) => {
  const handleCellClick = (row: number, col: number) => {
    if (disabled) return;

    if (onCellClick) {
      onCellClick(row, col);
    }
  };

  const isHighlighted = (row: number, col: number) => {
    return highlightedCells.some(cell => cell.x === row && cell.y === col);
  };

  const rows = board.length;
  const cols = board[0]?.length || 0;

  return (
    <div className="inline-block p-4 bg-gray-800 rounded-lg shadow-xl">
      <div
        className="grid gap-1"
        style={{
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
        }}
      >
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <SimpleMatrixCell
              key={`${rowIndex}-${colIndex}`}
              value={cell}
              onClick={() => handleCellClick(rowIndex, colIndex)}
              disabled={disabled}
              isHighlighted={isHighlighted(rowIndex, colIndex)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default SimpleGameBoard;