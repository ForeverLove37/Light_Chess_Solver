import { useState, useCallback } from 'react';
import { CellPosition } from '../../types/index';
import { lightsMatrixAPI } from '../../utils/core/api';

export const useHint = () => {
  const [hint, setHint] = useState<CellPosition | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const getHint = useCallback(async (board: number[][]) => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const response = await lightsMatrixAPI.solve({
        rows: board.length,
        cols: board[0].length,
        board
      });

      if (response.status === 'solvable' && response.solution && response.solution.length > 0) {
        // 返回第一步的提示
        setHint(response.solution[0]);
        setShowHint(true);
        return response.solution[0];
      } else {
        setHint(null);
        setShowHint(false);
        return null;
      }
    } catch (error) {
      console.error('获取提示失败:', error);
      setHint(null);
      setShowHint(false);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  const clearHint = useCallback(() => {
    setHint(null);
    setShowHint(false);
  }, []);

  return {
    hint,
    showHint,
    isLoading,
    getHint,
    clearHint
  };
};