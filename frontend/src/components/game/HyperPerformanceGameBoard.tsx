import React, { memo, useMemo, useCallback } from 'react';
import HyperPerformanceMatrixCell from './HyperPerformanceMatrixCell';
import { useHyperPerformanceMatrix } from '../../hooks/game/useHyperPerformanceMatrix';

interface HyperPerformanceGameBoardProps {
  rows: number;
  cols: number;
  onSolved?: () => void;
  className?: string;
}

// 1000fps游戏棋盘组件
const HyperPerformanceGameBoard: React.FC<HyperPerformanceGameBoardProps> = memo(({
  rows,
  cols,
  onSolved,
  className = ''
}) => {
  // 创建初始棋盘
  const initialBoard = useMemo(() =>
    Array(rows).fill(0).map(() => Array(cols).fill(0)),
    [rows, cols]
  );

  const {
    board,
    litCount,
    isSolved,
    toggleCell,
    reset,
    getFPS
  } = useHyperPerformanceMatrix(initialBoard);

  // 监听解决状态
  React.useEffect(() => {
    if (isSolved && onSolved) {
      onSolved();
    }
  }, [isSolved, onSolved]);

  // 超高效的渲染策略
  const renderBoard = useMemo(() => {
    const cells = [];

    // 使用for循环而不是map，减少函数调用开销
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const key = `${row}-${col}`;
        const value = board[row]?.[col] || 0;

        cells.push(
          <HyperPerformanceMatrixCell
            key={key}
            value={value}
            row={row}
            col={col}
            onClick={toggleCell}
            isHighlighted={false}
            disabled={false}
          />
        );
      }
    }

    return cells;
  }, [board, rows, cols, toggleCell]);

  // 完全紧挨排列的网格样式
  const gridStyle = useMemo(() => ({
    display: 'grid',
    gridTemplateColumns: `repeat(${cols}, 1fr)`,
    gridTemplateRows: `repeat(${rows}, 1fr)`,
    width: '100%',
    aspectRatio: `${cols}/${rows}`,
    gap: 0, // 完全无间隙，紧密排列
    border: '1px solid #374151',
    borderRadius: '4px',
    overflow: 'hidden',
    // 激进的GPU优化
    transform: 'translateZ(0)',
    willChange: 'transform',
    backfaceVisibility: 'hidden' as const,
    contain: 'layout style paint' as const,
    isolation: 'isolate' as const,
    // 优化布局计算
    containIntrinsicSize: `${cols * 20}px ${rows * 20}px`,
    contentVisibility: 'auto'
  }), [cols, rows]);

  const containerStyle = useMemo(() => ({
    width: '100%',
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
    // 性能优化
    transform: 'translateZ(0)',
    backfaceVisibility: 'hidden' as const,
    contain: 'layout style paint' as const
  }), []);

  return (
    <div style={containerStyle} className={className}>
      {/* 性能指示器 */}
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        background: 'rgba(0, 0, 0, 0.8)',
        color: '#0f0',
        padding: '4px 8px',
        borderRadius: '4px',
        fontFamily: 'monospace',
        fontSize: '12px',
        zIndex: 1000
      }}>
        FPS: {getFPS()} | 点亮: {litCount}
      </div>

      {/* 游戏棋盘 */}
      <div style={gridStyle}>
        {renderBoard}
      </div>

      {/* 控制按钮 */}
      <div style={{
        marginTop: '20px',
        display: 'flex',
        gap: '10px',
        justifyContent: 'center'
      }}>
        <button
          onClick={reset}
          style={{
            padding: '10px 20px',
            background: '#374151',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          重置
        </button>
      </div>

      {/* 解决状态 */}
      {isSolved && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(0, 0, 0, 0.9)',
          color: 'white',
          padding: '30px',
          borderRadius: '12px',
          textAlign: 'center',
          fontSize: '24px',
          fontWeight: 'bold',
          zIndex: 1000
        }}>
          🎉 恭喜完成！
          <div style={{ fontSize: '16px', marginTop: '10px' }}>
            FPS: {getFPS()}
          </div>
        </div>
      )}
    </div>
  );
});

HyperPerformanceGameBoard.displayName = 'HyperPerformanceGameBoard';

export default HyperPerformanceGameBoard;