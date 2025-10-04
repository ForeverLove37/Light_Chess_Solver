import { useState, useCallback } from 'react';
import { toggleCell } from '../../utils/game/board';

interface GameState {
  board: number[][];
  history: number[][][];
  historyIndex: number;
  moveCount: number;
}

export const useGameState = (initialBoard: number[][]) => {
  const [gameState, setGameState] = useState<GameState>(() => ({
    board: initialBoard,
    history: [initialBoard],
    historyIndex: 0,
    moveCount: 0
  }));

  const makeMove = useCallback((row: number, col: number) => {
    setGameState(prev => {
      const newBoard = toggleCell(prev.board, row, col);
      const newHistory = prev.history.slice(0, prev.historyIndex + 1);
      newHistory.push(newBoard);
      
      return {
        board: newBoard,
        history: newHistory,
        historyIndex: newHistory.length - 1,
        moveCount: prev.moveCount + 1
      };
    });
  }, []);

  const undo = useCallback(() => {
    setGameState(prev => {
      if (prev.historyIndex > 0) {
        const newIndex = prev.historyIndex - 1;
        return {
          ...prev,
          board: prev.history[newIndex],
          historyIndex: newIndex,
          moveCount: prev.moveCount - 1
        };
      }
      return prev;
    });
  }, []);

  const redo = useCallback(() => {
    setGameState(prev => {
      if (prev.historyIndex < prev.history.length - 1) {
        const newIndex = prev.historyIndex + 1;
        return {
          ...prev,
          board: prev.history[newIndex],
          historyIndex: newIndex,
          moveCount: prev.moveCount + 1
        };
      }
      return prev;
    });
  }, []);

  const reset = useCallback((newBoard?: number[][]) => {
    const board = newBoard || gameState.history[0];
    setGameState({
      board,
      history: [board],
      historyIndex: 0,
      moveCount: 0
    });
  }, [gameState.history]);

  const canUndo = gameState.historyIndex > 0;
  const canRedo = gameState.historyIndex < gameState.history.length - 1;

  return {
    board: gameState.board,
    makeMove,
    undo,
    redo,
    reset,
    canUndo,
    canRedo,
    moveCount: gameState.moveCount,
    historySize: gameState.history.length
  };
};