import React, { useState, useEffect, useRef, useCallback } from 'react';

// 添加脉动动画样式
const style = document.createElement('style');
style.textContent = `
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.8;
      transform: scale(1.05);
    }
  }
`;
document.head.appendChild(style);

interface SimpleHyperPerformanceGameBoardProps {
  rows: number;
  cols: number;
  onSolved?: () => void;
  highlightedCells?: Array<{x: number, y: number}>;
  showSolution?: boolean;
  board?: number[][];
  onCellClick?: (row: number, col: number) => void;
}

const SimpleHyperPerformanceGameBoard: React.FC<SimpleHyperPerformanceGameBoardProps> = ({
  rows,
  cols,
  onSolved,
  highlightedCells = [],
  showSolution = false,
  board: externalBoard,
  onCellClick: externalOnCellClick
}) => {
  const [internalBoard, setInternalBoard] = useState(() =>
    Array(rows).fill(0).map(() => Array(cols).fill(0))
  );

  // 使用外部棋盘或内部棋盘
  const board = externalBoard || internalBoard;
  const [isSolved, setIsSolved] = useState(false);
  const [fps, setFps] = useState(0);
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const animationRef = useRef<number>();

  // FPS监控
  useEffect(() => {
    const measureFPS = () => {
      frameCountRef.current++;
      const currentTime = performance.now();
      const deltaTime = currentTime - lastTimeRef.current;

      if (deltaTime >= 1000) {
        setFps(Math.round((frameCountRef.current * 1000) / deltaTime));
        frameCountRef.current = 0;
        lastTimeRef.current = currentTime;
      }

      animationRef.current = requestAnimationFrame(measureFPS);
    };

    animationRef.current = requestAnimationFrame(measureFPS);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // 检查是否解决
  useEffect(() => {
    const solved = board.every(row => row.every(cell => cell === 1));
    if (solved && !isSolved) {
      setIsSolved(true);
      onSolved?.();
    } else if (!solved && isSolved) {
      setIsSolved(false);
    }
  }, [board, isSolved, onSolved]);

  const handleCellClick = useCallback((row: number, col: number) => {
    // 如果有外部点击处理器，使用外部处理器
    if (externalOnCellClick) {
      externalOnCellClick(row, col);
      return;
    }

    // 否则使用内部逻辑
    setInternalBoard(prevBoard => {
      const newBoard = prevBoard.map(row => [...row]);

      // 切换点击的格子
      newBoard[row][col] = newBoard[row][col] === 0 ? 1 : 0;

      // 切换相邻的格子
      const directions = [
        [-1, 0], [1, 0], [0, -1], [0, 1]
      ];

      directions.forEach(([dr, dc]) => {
        const newRow = row + dr;
        const newCol = col + dc;
        if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
          newBoard[newRow][newCol] = newBoard[newRow][newCol] === 0 ? 1 : 0;
        }
      });

      return newBoard;
    });
  }, [rows, cols, externalOnCellClick]);

  const handleReset = useCallback(() => {
    setInternalBoard(Array(rows).fill(0).map(() => Array(cols).fill(0)));
    setIsSolved(false);
  }, [rows, cols]);

  const cellSize = Math.max(8, Math.min(20, 600 / Math.max(rows, cols)));

  return (
    <div className="inline-block">
      {/* FPS显示 */}
      <div className="mb-2 text-center">
        <span className={`text-sm font-mono ${
          fps >= 1000 ? 'text-green-400' :
          fps >= 500 ? 'text-yellow-400' :
          fps >= 120 ? 'text-orange-400' :
          'text-red-400'
        }`}>
          FPS: {fps}
        </span>
      </div>

      {/* 游戏棋盘 */}
      <div
        className="bg-black p-2 rounded"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
          gap: '1px',
          border: '1px solid #333'
        }}
      >
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            // 检查是否是高亮单元格
            const isHighlighted = showSolution && highlightedCells.some(
              highlighted => highlighted.x === colIndex && highlighted.y === rowIndex
            );

            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                onClick={() => handleCellClick(rowIndex, colIndex)}
                className={`cursor-pointer transition-colors duration-75 ${
                  cell === 1
                    ? 'bg-cyan-400'
                    : isHighlighted
                    ? 'bg-yellow-400 shadow-lg shadow-yellow-400/50'
                    : 'bg-gray-800 hover:bg-gray-700'
                }`}
                style={{
                  width: cellSize,
                  height: cellSize,
                  // GPU加速
                  transform: 'translateZ(0)',
                  willChange: 'background-color',
                  // 为高亮单元格添加脉动效果
                  ...(isHighlighted && {
                    animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                  })
                }}
              />
            );
          })
        )}
      </div>

      {/* 控制按钮 */}
      <div className="mt-4 text-center">
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 text-sm"
        >
          重置
        </button>
        {isSolved && (
          <div className="mt-2 text-green-400 text-sm">
            🎉 已完成！
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleHyperPerformanceGameBoard;