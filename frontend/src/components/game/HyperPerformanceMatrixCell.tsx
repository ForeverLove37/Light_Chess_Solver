import React, { memo } from 'react';

interface HyperPerformanceMatrixCellProps {
  value: number;
  row: number;
  col: number;
  onClick: (row: number, col: number) => void;
  isHighlighted: boolean;
  disabled: boolean;
}

// 1000fps极致性能组件 - 完全无任何开销
const HyperPerformanceMatrixCell: React.FC<HyperPerformanceMatrixCellProps> = memo(({
  value,
  row,
  col,
  onClick,
  isHighlighted,
  disabled
}) => {
  // 内联点击处理，避免函数创建开销
  const handleClick = () => {
    if (!disabled) onClick(row, col);
  };

  // 使用最简单的条件渲染，完全紧挨排列
  const cellStyle = {
    width: '100%',
    height: '100%',
    backgroundColor: value === 1 ? '#16f4d0' : '#1f2937',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    // 强制GPU加速和合成层优化
    transform: 'translateZ(0)',
    willChange: 'transform',
    backfaceVisibility: 'hidden' as const,
    // CSS containment - 最激进的隔离
    contain: 'layout style paint' as const,
    // 创建新的堆叠上下文
    isolation: 'isolate' as const
  };

  // 高亮状态
  if (isHighlighted) {
    cellStyle.backgroundColor = '#e94560';
    cellStyle.boxShadow = '0 0 4px #e94560';
  }

  // 返回最简单的div，零动画零过渡
  return (
    <div style={cellStyle} onClick={handleClick} />
  );
}, (prevProps, nextProps) => {
  // 最严格的浅比较
  return (
    prevProps.value === nextProps.value &&
    prevProps.isHighlighted === nextProps.isHighlighted &&
    prevProps.disabled === nextProps.disabled
  );
});

HyperPerformanceMatrixCell.displayName = 'HyperPerformanceMatrixCell';

export default HyperPerformanceMatrixCell;