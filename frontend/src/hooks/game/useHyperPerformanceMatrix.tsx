import { useState, useCallback, useRef, useEffect } from 'react';
import { MatrixOperation, MatrixResult } from '../../workers/matrixWorker';

// 1000fps性能优化Hook
export const useHyperPerformanceMatrix = (initialBoard: number[][]) => {
  const [board, setBoard] = useState<number[][]>(initialBoard);
  const [litCount, setLitCount] = useState(0);
  const [isSolved, setIsSolved] = useState(false);

  // Web Worker引用
  const workerRef = useRef<Worker | null>(null);
  const isProcessingRef = useRef(false);

  // 性能监控
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const fpsRef = useRef(0);

  // 初始化Web Worker
  useEffect(() => {
    if (typeof Worker !== 'undefined') {
      workerRef.current = new Worker(
        new URL('../workers/matrixWorker.ts', import.meta.url),
        { type: 'module' }
      );

      workerRef.current.onmessage = (event: MessageEvent<MatrixResult>) => {
        const result = event.data;
        setBoard(result.board);
        setLitCount(result.litCount);
        setIsSolved(result.isSolved);
        isProcessingRef.current = false;

        // 计算FPS
        frameCountRef.current++;
        const now = performance.now();
        if (now - lastTimeRef.current >= 1000) {
          fpsRef.current = frameCountRef.current;
          frameCountRef.current = 0;
          lastTimeRef.current = now;

          // 输出性能信息
          if (fpsRef.current < 1000) {
            console.log(`⚡ 当前FPS: ${fpsRef.current}`);
          } else {
            console.log(`🚀 达到1000fps+! 当前: ${fpsRef.current}`);
          }
        }
      };

      // 初始计算
      workerRef.current.postMessage({
        type: 'calculate',
        board: initialBoard
      });
    }

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, [initialBoard]);

  // 超高性能切换单元格
  const toggleCell = useCallback((row: number, col: number) => {
    if (isProcessingRef.current || !workerRef.current) return;

    isProcessingRef.current = true;

    // 立即发送到Worker处理
    workerRef.current.postMessage({
      type: 'toggle',
      board,
      row,
      col
    });
  }, []); // 移除board依赖，避免闭包问题

  // 重置矩阵
  const reset = useCallback(() => {
    if (!workerRef.current) return;

    const rows = board.length;
    const cols = board[0]?.length || 0;
    const emptyBoard = Array(rows).fill(0).map(() => Array(cols).fill(0));

    setBoard(emptyBoard);
    setLitCount(0);
    setIsSolved(false);
  }, [board]);

  // 获取当前FPS
  const getFPS = useCallback(() => {
    return fpsRef.current;
  }, []);

  // 设置棋盘状态（用于同步）
  const syncBoardState = useCallback((newBoard: number[][]) => {
    if (!workerRef.current) return;

    workerRef.current.postMessage({
      type: 'calculate',
      board: newBoard
    });
  }, []);

  return {
    board,
    litCount,
    isSolved,
    toggleCell,
    reset,
    syncBoardState,
    getFPS,
    isProcessing: isProcessingRef.current
  };
};