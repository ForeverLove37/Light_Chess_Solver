import React, { useState, useCallback, useEffect, useMemo, memo } from 'react';
import { motion } from 'framer-motion';
import HyperPerformanceMatrixCell from './HyperPerformanceMatrixCell';
import { CellPosition } from '../../types/index';
import { toggleCell, isBoardSolved } from '../../utils/game/board';
import './GameBoard.css';

// 临时的MatrixCell组件，使用HyperPerformanceMatrixCell作为替代
const MatrixCell = HyperPerformanceMatrixCell;

// 临时的hooks，使用空的实现
const usePerformanceMonitor = () => ({
  getMetrics: () => ({ renderTime: 0, fps: 60 })
});

const useSmartPerformanceManager = () => ({
  getOptimalRenderStrategy: () => 'normal',
  getRealTimeHints: () => []
});

const useRenderPipeline = (options: any) => ({
  optimizedRender: true,
  shouldVirtualize: false
});

interface GameBoardProps {
  board: number[][];
  onBoardChange: (board: number[][]) => void;
  onCellClick?: (row: number, col: number) => void;
  disabled?: boolean;
  highlightedCells?: CellPosition[];
  showAffectedOnHover?: boolean;
}

// 优化的单元格组件，使用memo避免不必要的重渲染
const OptimizedMatrixCell = memo(MatrixCell);

const GameBoard: React.FC<GameBoardProps> = ({
  board,
  onBoardChange,
  onCellClick,
  disabled = false,
  highlightedCells = []
}) => {
  const [isSolved, setIsSolved] = useState(false);
  const { getMetrics } = usePerformanceMonitor();
  const {
    getOptimalRenderStrategy,
    getRealTimeHints
  } = useSmartPerformanceManager();

  const {
    optimizedRender,
    shouldVirtualize
  } = useRenderPipeline({
    enableBatching: true,
    enableVirtualization: true,
    enableMemoization: true
  });

  const cols = board[0]?.length || 0;
  const matrixSize = board.length * cols;

  // 计算点亮的格子数量
  const boardLitCount = useMemo(() => {
    return board.flat().filter(cell => cell === 1).length;
  }, [board]);

  // 获取最优渲染策略
  const renderStrategy = useMemo(() => {
    return getOptimalRenderStrategy();
  }, [getOptimalRenderStrategy]);

  // 智能性能监控 - 修复实际渲染测量
  useEffect(() => {
    if (renderStrategy.strategy === 'ultra') {
      // 极致性能模式：减少测量频率
      const interval = setInterval(() => {
        const metrics = getMetrics();
        if (metrics.averageRenderTime > 8) { // 8.33ms = 120fps
          console.warn('🚨 性能警告：渲染时间超过8.33ms');
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [renderStrategy.strategy, getMetrics]);

  useEffect(() => {
    const solved = isBoardSolved(board);
    setIsSolved(solved);
  }, [board]);

  // 每30帧输出一次性能提示
  useEffect(() => {
    const interval = setInterval(() => {
      const hints = getRealTimeHints();
      if (hints.length > 0) {
        console.log(`🚀 ${hints.join(' | ')}`);
      }
    }, 500); // 每500ms检查一次

    return () => clearInterval(interval);
  }, [getRealTimeHints]);

  const handleCellClick = useCallback((row: number, col: number) => {
    if (disabled) return;

    if (onCellClick) {
      onCellClick(row, col);
    } else {
      const newBoard = toggleCell(board, row, col);
      onBoardChange(newBoard);
    }
  }, [board, onBoardChange, onCellClick, disabled]);

  // 优化高亮检查，使用Set提高性能
  const highlightedSet = useMemo(() => {
    const set = new Set<string>();
    highlightedCells.forEach(cell => {
      set.add(`${cell.x}-${cell.y}`);
    });
    return set;
  }, [highlightedCells]);

  const isCellHighlighted = useCallback((row: number, col: number) => {
    return highlightedSet.has(`${row}-${col}`);
  }, [highlightedSet]);

  // 性能优化：为大矩阵禁用动画
  const shouldDisableAnimations = matrixSize > 100;

  // 性能优化：动态调整单元格大小
  const cellSize = useMemo(() => {
    if (matrixSize > 400) return 'w-6 h-6 sm:w-8 sm:h-8'; // 20x20+
    if (matrixSize > 100) return 'w-8 h-8 sm:w-10 sm:h-10'; // 10x10-20x20
    return 'w-12 h-12 sm:w-14 sm:h-14'; // 小矩阵
  }, [matrixSize]);

  // 移除第一个重复的isSolved检查，统一使用后面的完成界面

  // 使用智能虚拟化判断
  if (shouldVirtualize()) {
    return (
      <VirtualizedGameBoard
        board={board}
        onBoardChange={onBoardChange}
        onCellClick={onCellClick}
        disabled={disabled}
        highlightedCells={highlightedCells}
      />
    );
  }

  // 渲染单元格组件 - 修复网格布局
  const renderCells = () => {
    const cellComponent = renderStrategy.strategy === 'ultra' ? UltraHighPerfMatrixCell : OptimizedMatrixCell;
    const isUltraMode = renderStrategy.strategy === 'ultra';

    return (
      <div
        className={`grid gap-0 p-2 glass-effect rounded-xl ${
          matrixSize >= 625 ? 'matrix-large' : ''
        }`}
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          // 紧凑排列优化
          width: '100%',
          aspectRatio: cols > 0 ? `${board.length}/${cols}` : '1',
          minHeight: matrixSize > 400 ? '150px' : '200px',
          maxHeight: '85vh',
          contain: 'layout style paint',
          // 增强GPU加速优化
          transform: 'translateZ(0)',
          willChange: isUltraMode ? 'transform' : 'auto',
          backfaceVisibility: 'hidden',
          isolation: 'isolate',
          // 优化大矩阵显示
          fontSize: matrixSize > 625 ? '4px' : matrixSize > 400 ? '6px' : matrixSize > 100 ? '8px' : '10px',
          // 响应式优化
          overflow: matrixSize > 400 ? 'auto' : 'visible'
        }}
      >
        {board.map((row, rowIndex) =>
          row.map((cellValue, colIndex) => {
            const isHighlighted = isCellHighlighted(rowIndex, colIndex);

            const CellComponent = cellComponent;
            const cellProps = {
              key: `${rowIndex}-${colIndex}`,
              value: cellValue,
              row: rowIndex,
              col: colIndex,
              onClick: handleCellClick,
              isHovered: false,
              isHighlighted,
              disabled,
              size: cellSize
            };

            // 极致性能模式只需要基本props + GPU优化
            if (isUltraMode) {
              return (
                <div
                  key={`wrapper-${rowIndex}-${colIndex}`}
                  style={{
                    // GPU加速容器
                    transform: 'translateZ(0)',
                    backfaceVisibility: 'hidden',
                    contain: 'layout style paint'
                  }}
                >
                  <CellComponent {...cellProps} />
                </div>
              );
            }

            // 其他模式需要额外的性能属性
            return (
              <CellComponent
                {...cellProps}
                disableAnimations={boardLitCount > 150}
                boardLitCount={boardLitCount}
              />
            );
          })
        )}
      </div>
    );
  };

  // 使用优化渲染管线处理渲染
  const [renderedBoard, setRenderedBoard] = useState<React.ReactNode>(null);

  useEffect(() => {
    optimizedRender(() => {
      setRenderedBoard(renderCells());
    }, null, 'high');
  }, [
    board,
    handleCellClick,
    isCellHighlighted,
    disabled,
    cellSize,
    boardLitCount,
    renderStrategy,
    optimizedRender
  ]);

  // 根据性能策略设置样式类
  const boardClassName = useMemo(() => {
    const baseClasses = 'game-board';
    const performanceClasses = `performance-${renderStrategy.strategy}`;
    const litCountClasses = boardLitCount > 300 ? 'high-lit-count' : '';

    return `${baseClasses} ${performanceClasses} ${litCountClasses}`.trim();
  }, [renderStrategy.strategy, boardLitCount]);

  if (isSolved) {
    return (
      <div className="w-full min-h-[400px] flex items-center justify-center">
        <motion.div
          className="glass-effect rounded-xl p-8 text-center max-w-md mx-auto"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: shouldDisableAnimations ? 0 : 0.5 }}
        >
          <motion.div
            className="text-6xl mb-4"
            animate={shouldDisableAnimations ? {} : {
              scale: [1, 1.2, 1],
              rotate: [0, 10, -10, 0]
            }}
            transition={shouldDisableAnimations ? {} : { duration: 1, repeat: Infinity }}
          >
            🎉
          </motion.div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-matrix-on to-matrix-accent bg-clip-text text-transparent mb-4">
            恭喜完成！
          </h2>
          <p className="text-lg text-gray-300 mb-6">
            你成功解开了这个 {board.length}×{board[0].length} 的光影矩阵！
          </p>
          <div className="flex flex-col gap-3">
            <div className="text-sm text-gray-400">
              <span className="inline-block px-3 py-1 bg-matrix-on bg-opacity-20 rounded-full">
                矩阵已完全点亮
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`${boardClassName} ${matrixSize >= 625 ? 'gpu-accelerated' : ''}`} style={{
      contain: 'layout style paint',
      backfaceVisibility: 'hidden',
      transform: 'translateZ(0)',
      willChange: renderStrategy.strategy === 'ultra' ? 'transform' : 'auto',
      isolation: 'isolate',
      // 大矩阵容器优化
      width: '100%',
      maxWidth: '100vw',
      overflow: 'auto'
    }}>
      {renderedBoard}
    </div>
  );
};

export default GameBoard;