import React from 'react';

interface SimpleMatrixCellProps {
  value: number;
  onClick: () => void;
  disabled?: boolean;
  isHighlighted?: boolean;
}

const SimpleMatrixCell: React.FC<SimpleMatrixCellProps> = ({
  value,
  onClick,
  disabled = false,
  isHighlighted = false
}) => {
  return (
    <div
      onClick={disabled ? undefined : onClick}
      className={`w-12 h-12 border border-gray-600 cursor-pointer transition-all duration-200 ${
        value === 1
          ? 'bg-cyan-500 shadow-lg shadow-cyan-500/50'
          : 'bg-gray-700 hover:bg-gray-600'
      } ${
        isHighlighted ? 'ring-2 ring-yellow-400' : ''
      } ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
      style={{
        transform: value === 1 ? 'scale(1.05)' : 'scale(1)',
        transition: 'all 0.2s ease'
      }}
    />
  );
};

export default SimpleMatrixCell;