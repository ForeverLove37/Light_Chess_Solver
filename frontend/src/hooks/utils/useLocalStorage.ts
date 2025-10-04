import { useState, useEffect, useCallback } from 'react';

interface SavedGame {
  board: number[][];
  rows: number;
  cols: number;
  moveCount: number;
  timestamp: number;
  isSolved: boolean;
}

const STORAGE_KEY = 'lights-matrix-game';

export const useLocalStorage = () => {
  const [savedGame, setSavedGame] = useState<SavedGame | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // 加载保存的游戏
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const gameData = JSON.parse(saved) as SavedGame;
        // 检查保存的数据是否在合理的时间范围内（7天）
        const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        if (gameData.timestamp > weekAgo) {
          setSavedGame(gameData);
        } else {
          // 清理过期数据
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch (error) {
      console.error('加载保存的游戏失败:', error);
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const saveGame = useCallback((gameData: Omit<SavedGame, 'timestamp'>) => {
    try {
      const dataToSave: SavedGame = {
        ...gameData,
        timestamp: Date.now()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
      setSavedGame(dataToSave);
    } catch (error) {
      console.error('保存游戏失败:', error);
    }
  }, []);

  const clearSavedGame = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setSavedGame(null);
    } catch (error) {
      console.error('清除保存的游戏失败:', error);
    }
  }, []);

  const hasSavedGame = savedGame !== null;

  return {
    savedGame,
    isLoaded,
    hasSavedGame,
    saveGame,
    clearSavedGame
  };
};