import React, { useState, useEffect } from 'react';
import SimpleGameBoard from './components/game/SimpleGameBoard';
import SimpleHyperPerformanceGameBoard from './components/game/SimpleHyperPerformanceGameBoard';
import SimpleChallengeMode from './components/ui/SimpleChallengeMode';
import Toast from './components/ui/Toast';
import SimpleThemeSwitcher from './components/ui/SimpleThemeSwitcher';
import { createEmptyBoard, toggleCell, isBoardSolved } from './utils/game/board';
import { lightsMatrixAPI } from './utils/core/api';
import { ExportManager } from './utils/game/export';
import MagicButton from './components/ui/MagicButton';
import MagicCard from './components/ui/MagicCard';
import DynamicBackground from './components/ui/DynamicBackground';
import './styles/core/globals.css';

interface GameState {
  board: number[][];
  history: number[][][];
  historyIndex: number;
  moveCount: number;
}

interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

const App: React.FC = () => {
  const [rows, setRows] = useState(5);
  const [cols, setCols] = useState(5);
  const [isHyperPerformanceMode, setIsHyperPerformanceMode] = useState(false);
  const [showChallengeMode, setShowChallengeMode] = useState(false);
  const [currentChallenge, setCurrentChallenge] = useState<any>(null);
  const [challengeTimer, setChallengeTimer] = useState<number | null>(null);
  const [challengeStartTime, setChallengeStartTime] = useState<number | null>(null);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [gameState, setGameState] = useState<GameState>(() => ({
    board: createEmptyBoard(5, 5),
    history: [createEmptyBoard(5, 5)],
    historyIndex: 0,
    moveCount: 0
  }));
  const [solution, setSolution] = useState<Array<{x: number, y: number}>>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [initialBoard, setInitialBoard] = useState<number[][] | null>(null);
  const [boardStates, setBoardStates] = useState<number[][][]>([]); // 存储每一步的棋盘状态
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // 检查服务器状态
  useEffect(() => {
    const checkServer = async () => {
      try {
        await lightsMatrixAPI.checkServerHealth();
        setServerStatus('online');
      } catch (error) {
        setServerStatus('offline');
      }
    };
    checkServer();
    const interval = setInterval(checkServer, 30000);
    return () => clearInterval(interval);
  }, []);

  // 检查游戏是否完成
  useEffect(() => {
    if (isBoardSolved(gameState.board) && gameState.moveCount > 0) {
      showToast(`🎉 恭喜完成！用了 ${gameState.moveCount} 步解开了 ${rows}×${cols} 光影矩阵！`, 'success');
    }
  }, [gameState.board, gameState.moveCount, rows, cols]);

  const makeMove = (row: number, col: number) => {
    const newBoard = toggleCell(gameState.board, row, col);
    const newHistory = gameState.history.slice(0, gameState.historyIndex + 1);
    newHistory.push(newBoard);

    setGameState({
      board: newBoard,
      history: newHistory,
      historyIndex: newHistory.length - 1,
      moveCount: gameState.moveCount + 1
    });
  };

  const undo = () => {
    if (gameState.historyIndex > 0) {
      const newIndex = gameState.historyIndex - 1;
      setGameState({
        ...gameState,
        board: gameState.history[newIndex],
        historyIndex: newIndex,
        moveCount: gameState.moveCount - 1
      });
    }
  };

  const redo = () => {
    if (gameState.historyIndex < gameState.history.length - 1) {
      const newIndex = gameState.historyIndex + 1;
      setGameState({
        ...gameState,
        board: gameState.history[newIndex],
        historyIndex: newIndex,
        moveCount: gameState.moveCount + 1
      });
    }
  };

  const handleSizeChange = (newRows: number, newCols: number) => {
    const newBoard = createEmptyBoard(newRows, newCols);
    setRows(newRows);
    setCols(newCols);
    setGameState({
      board: newBoard,
      history: [newBoard],
      historyIndex: 0,
      moveCount: 0
    });
    setSolution([]);
    setCurrentStep(0);
    setBoardStates([]);
    setIsAutoPlaying(false);
  };

  const handleReset = () => {
    const newBoard = createEmptyBoard(rows, cols);
    setGameState({
      board: newBoard,
      history: [newBoard],
      historyIndex: 0,
      moveCount: 0
    });
    setSolution([]);
    setCurrentStep(0);
    setBoardStates([]);
    setIsAutoPlaying(false);
  };

  const handleSolve = async () => {
    if (serverStatus === 'offline') {
      showToast('无法连接到服务器，请稍后重试', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const currentRows = gameState.board.length;
      const currentCols = gameState.board[0]?.length || 0;
      const currentBoard = gameState.board;

      // 计算当前状态中已点亮的格子数量
      const litCount = currentBoard.flat().filter(cell => cell === 1).length;

      const response = await lightsMatrixAPI.solve({
        rows: currentRows,
        cols: currentCols,
        board: currentBoard
      });

      if (response.status === 'solvable' && response.solution) {
        setSolution(response.solution);
        setCurrentStep(0);
        const initialBoardState = gameState.board.map(row => [...row]); // 深拷贝当前棋盘状态
        setInitialBoard(initialBoardState);

        // 预计算所有步骤的棋盘状态
        const states: number[][][] = [initialBoardState];
        let currentBoardState = initialBoardState.map(row => [...row]);

        response.solution.forEach(step => {
          currentBoardState = toggleCell(currentBoardState, step.y, step.x);
          states.push(currentBoardState.map(row => [...row]));
        });

        setBoardStates(states);

        // 根据当前状态提供不同的提示信息
        if (gameState.moveCount === 0 && litCount === 0) {
          showToast(`找到解法！需要 ${response.solution.length} 步`, 'success');
        } else {
          showToast(`从当前状态求解！需要 ${response.solution.length} 步 (当前已点亮: ${litCount} 格)`, 'success');
        }
      } else {
        if (litCount === 0) {
          showToast('这个棋盘配置无解', 'error');
        } else {
          showToast('从当前状态无法找到解法，请尝试重置棋盘', 'error');
        }
      }
    } catch (error) {
      showToast('求解失败，请重试', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRandomBoard = async () => {
    if (serverStatus === 'offline') {
      showToast('无法连接到服务器，请稍后重试', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const response = await lightsMatrixAPI.getRandomBoard(rows, cols);
      setGameState({
        board: response.board,
        history: [response.board],
        historyIndex: 0,
        moveCount: 0
      });
      setSolution([]);
      setCurrentStep(0);
      setIsAutoPlaying(false);
      showToast('已生成新的随机棋盘', 'success');
    } catch (error) {
      showToast('生成随机棋盘失败，请重试', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const executeStep = (step: {x: number, y: number}) => {
    makeMove(step.x, step.y);
  };

  const handleNextStep = () => {
    if (currentStep < solution.length) {
      executeStep(solution[currentStep]);
      setCurrentStep(currentStep + 1);
    }
  };

  const handleAutoPlay = () => {
    if (isAutoPlaying) {
      setIsAutoPlaying(false);
      return;
    }

    setIsAutoPlaying(true);
    const playNext = () => {
      if (currentStep < solution.length) {
        executeStep(solution[currentStep]);
        setCurrentStep(prev => prev + 1);
      } else {
        setIsAutoPlaying(false);
      }
    };
    playNext();
  };

  // 进度条拖动处理函数
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!solution.length || isAutoPlaying) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickPercentage = clickX / rect.width;
    const targetStep = Math.floor(clickPercentage * solution.length);

    // 确保步数在有效范围内
    const validStep = Math.max(0, Math.min(targetStep, solution.length));

    // 使用新的跳转函数
    jumpToStep(validStep);
  };

  const handleProgressMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    handleProgressClick(e);
  };

  const handleProgressMouseMove = (e: MouseEvent) => {
    if (!isDragging || !solution.length) return;

    const progressElement = document.getElementById('progress-bar');
    if (progressElement) {
      const rect = progressElement.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickPercentage = Math.max(0, Math.min(1, clickX / rect.width));
      const targetStep = Math.floor(clickPercentage * solution.length);

      const validStep = Math.max(0, Math.min(targetStep, solution.length));

      if (validStep !== currentStep) {
        jumpToStep(validStep);
      }
    }
  };

  const handleProgressMouseUp = () => {
    setIsDragging(false);
  };

  // 跳转到指定步骤
  const jumpToStep = (targetStep: number) => {
    if (!initialBoard || boardStates.length === 0 || targetStep === currentStep) return;

    // 直接使用预计算的状态
    const targetBoard = boardStates[targetStep];
    if (targetBoard) {
      setGameState({
        board: targetBoard.map(row => [...row]),
        history: boardStates.slice(0, targetStep + 1).map(state => state.map(row => [...row])),
        historyIndex: targetStep,
        moveCount: targetStep
      });
      setCurrentStep(targetStep);
    }
  };

  // 导出解法数据
  const handleExportData = (format: 'csv' | 'json') => {
    if (solution.length === 0) {
      showToast('没有可导出的解法数据', 'error');
      return;
    }

    try {
      // 创建ExportData对象
      const exportData = {
        board: gameState.board,
        solution: solution,
        solveTimeMs: '0', // 暂时使用0，后续可以记录真实求解时间
        timestamp: new Date().toISOString(),
        boardSize: {
          rows: rows,
          cols: cols
        }
      };

      const fileName = `lights_matrix_solution_${rows}x${cols}_${Date.now()}`;

      switch (format) {
        case 'csv':
          ExportManager.exportToCSV(exportData, `${fileName}.csv`);
          break;
        case 'json':
          ExportManager.exportToJSON(exportData, `${fileName}.json`);
          break;
        default:
          showToast('不支持的导出格式', 'error');
          return;
      }

      showToast(`解法数据已导出为 ${format.toUpperCase()} 格式`, 'success');
    } catch (error) {
      console.error('导出失败:', error);
      showToast('导出失败，请重试', 'error');
    }
  };

  // 全局鼠标事件监听
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleProgressMouseMove);
      document.addEventListener('mouseup', handleProgressMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleProgressMouseMove);
        document.removeEventListener('mouseup', handleProgressMouseUp);
      };
    }
  }, [isDragging]);

  // 自动播放效果
  useEffect(() => {
    if (isAutoPlaying && currentStep < solution.length) {
      const timer = setTimeout(() => {
        // 使用预计算的下一步状态，而不是重新执行步骤
        const nextStep = currentStep + 1;
        if (boardStates[nextStep]) {
          const nextBoard = boardStates[nextStep];
          setGameState({
            board: nextBoard.map(row => [...row]),
            history: boardStates.slice(0, nextStep + 1).map(state => state.map(row => [...row])),
            historyIndex: nextStep,
            moveCount: nextStep
          });
          setCurrentStep(nextStep);
        }
      }, 800);
      return () => clearTimeout(timer);
    } else if (isAutoPlaying && currentStep >= solution.length) {
      setIsAutoPlaying(false);
    }
  }, [isAutoPlaying, currentStep, solution, boardStates]);

  const isSolved = isBoardSolved(gameState.board);
  const canUndo = gameState.historyIndex > 0;
  const canRedo = gameState.historyIndex < gameState.history.length - 1;

  // 获取高亮格子
  const highlightedCells = solution.slice(0, currentStep);

  return (
    <div className="min-h-screen relative">
      {/* 动态背景 */}
      <DynamicBackground />

      {/* 主题切换器 */}
      <SimpleThemeSwitcher />

      {/* Toast容器 */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* 头部 */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            光影矩阵
          </h1>
          <p className="text-lg text-gray-300 mb-6">
            Lights Matrix Solver - 优雅的数字艺术解谜游戏
          </p>

          {/* 1000fps模式切换按钮 */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <button
              onClick={() => setIsHyperPerformanceMode(!isHyperPerformanceMode)}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                isHyperPerformanceMode
                  ? 'bg-yellow-500 text-gray-900 hover:bg-yellow-400 shadow-lg shadow-yellow-500/50'
                  : 'bg-gray-700 text-white hover:bg-gray-600'
              }`}
            >
              {isHyperPerformanceMode ? '⚡ 1000fps模式' : '🎮 普通模式'}
            </button>
            {isHyperPerformanceMode && (
              <span className="text-sm text-yellow-400 animate-pulse">
                Web Worker加速中
              </span>
            )}
          </div>

          {/* 服务器状态 */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className={`w-3 h-3 rounded-full ${
              serverStatus === 'online' ? 'bg-green-500' :
              serverStatus === 'checking' ? 'bg-yellow-500' : 'bg-red-500'
            }`} />
            <span className="text-sm text-gray-400">
              {serverStatus === 'online' ? '服务器在线' :
               serverStatus === 'checking' ? '检查中...' : '服务器离线'}
            </span>
          </div>
        </header>

        {/* 控制面板 */}
        <div className="glass-effect rounded-xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 尺寸控制 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                棋盘大小
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="3"
                  max="20"
                  value={rows}
                  onChange={(e) => handleSizeChange(parseInt(e.target.value) || 3, cols)}
                  className="w-20 px-2 py-1 bg-gray-800 border border-gray-600 rounded text-white"
                  disabled={gameState.moveCount > 0}
                />
                <span className="text-gray-400">×</span>
                <input
                  type="number"
                  min="3"
                  max="20"
                  value={cols}
                  onChange={(e) => handleSizeChange(rows, parseInt(e.target.value) || 3)}
                  className="w-20 px-2 py-1 bg-gray-800 border border-gray-600 rounded text-white"
                  disabled={gameState.moveCount > 0}
                />
              </div>
            </div>

            {/* 主要操作 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                操作
              </label>
              <div className="flex gap-2">
                <button
                  onClick={handleSolve}
                  disabled={isLoading}
                  className="px-3 py-1 bg-cyan-500 text-white rounded hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {isLoading ? '求解中...' : '从当前状态求解'}
                </button>
                <button
                  onClick={handleReset}
                  className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
                >
                  重置
                </button>
              </div>
            </div>

            {/* 随机棋盘 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                随机游戏
              </label>
              <MagicButton
                onClick={handleRandomBoard}
                disabled={isLoading}
                variant="gradient"
                size="sm"
                className="w-full"
              >
                随机棋盘
              </MagicButton>
            </div>

            {/* 游戏状态 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                游戏状态
              </label>
              <div className="text-sm">
                <span className={`inline-block px-2 py-1 rounded ${
                  isSolved ? 'bg-green-600 text-white' : 'bg-yellow-600 text-white'
                }`}>
                  {isSolved ? '已完成!' : '步数: ' + gameState.moveCount}
                </span>
              </div>
            </div>
          </div>

          {/* 撤销重做 */}
          <div className="flex gap-2 mt-4 pt-4 border-t border-gray-700">
            <button
              onClick={undo}
              disabled={!canUndo}
              className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50 text-sm"
            >
              ↶ 撤销
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50 text-sm"
            >
              ↷ 重做
            </button>
          </div>
        </div>

        {/* 游戏棋盘 */}
        <div className="flex justify-center mb-8">
          {isHyperPerformanceMode ? (
            <SimpleHyperPerformanceGameBoard
              rows={rows}
              cols={cols}
              onSolved={() => {
                showToast(`🎉 恭喜完成！解开了 ${rows}×${cols} 的光影矩阵！`, 'success');
              }}
              highlightedCells={highlightedCells}
              showSolution={solution.length > 0}
              board={gameState.board}
              onCellClick={makeMove}
            />
          ) : (
            <SimpleGameBoard
              board={gameState.board}
              onCellClick={makeMove}
              disabled={isLoading || isAutoPlaying}
              highlightedCells={highlightedCells}
            />
          )}
        </div>

        {/* 解法控制 */}
        {solution.length > 0 && (
          <div className="glass-effect rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4 text-cyan-400">解法控制</h3>

            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-gray-300">
                步骤: {currentStep} / {solution.length}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleNextStep}
                  disabled={currentStep >= solution.length || isAutoPlaying}
                  className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50 text-sm"
                >
                  下一步
                </button>
                <button
                  onClick={handleAutoPlay}
                  className="px-3 py-1 bg-cyan-500 text-white rounded hover:bg-cyan-600 text-sm"
                >
                  {isAutoPlaying ? '停止' : '自动播放'}
                </button>
                {solution.length > 0 && (
                  <>
                    <button
                      onClick={() => handleExportData('csv')}
                      className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                      title="下载解法数据为CSV文件"
                    >
                      下载CSV
                    </button>
                    <button
                      onClick={() => handleExportData('json')}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                      title="下载解法数据为JSON文件"
                    >
                      下载JSON
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* 进度条 */}
            <div
              id="progress-bar"
              className="relative w-full bg-gray-700 rounded-full h-3 mb-2 cursor-pointer group"
              onClick={handleProgressClick}
              onMouseDown={handleProgressMouseDown}
            >
              {/* 背景轨道 */}
              <div className="absolute inset-0 bg-gray-600 rounded-full opacity-30" />

              {/* 主进度条 */}
              <div
                className={`h-3 rounded-full transition-all duration-100 ${
                  isDragging ? 'bg-purple-500 shadow-lg shadow-purple-500/50' : 'bg-cyan-500'
                }`}
                style={{ width: `${(currentStep / solution.length) * 100}%` }}
              />

              {/* 拖动指示器 */}
              <div
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg cursor-grab"
                style={{
                  left: `${(currentStep / solution.length) * 100}%`,
                  transform: 'translateX(-50%)',
                  cursor: isDragging ? 'grabbing' : 'grab',
                  boxShadow: isDragging ? '0 0 15px rgba(255, 255, 255, 0.6)' : '0 2px 4px rgba(0, 0, 0, 0.2)',
                  transition: isDragging ? 'none' : 'all 0.2s ease-out'
                }}
              />

              {/* 步数标记 */}
              <div className="absolute inset-0 flex items-center">
                {solution.length > 0 && solution.map((_, index) => (
                  <div
                    key={index}
                    className={`absolute h-2 w-0.5 rounded-full transition-colors duration-200 ${
                      index <= currentStep ? 'bg-cyan-400' : 'bg-gray-500'
                    }`}
                    style={{
                      left: `${(index / solution.length) * 100}%`,
                      transform: 'translateX(-50%)'
                    }}
                  />
                ))}
              </div>
            </div>
            <div className="text-sm text-gray-300">
              进度: {Math.round((currentStep / solution.length) * 100)}%
            </div>
          </div>
        )}

        {/* 游戏模式选择面板 */}
        {!currentChallenge && !isHyperPerformanceMode && (
          <div className="glass-effect rounded-xl p-6 mb-8">
            <h3 className="text-2xl font-bold mb-4 text-white">游戏模式</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* 自由模式 */}
              <div className="text-center p-4 bg-gray-700 bg-opacity-50 rounded-lg">
                <div className="text-2xl mb-2">🎮</div>
                <h4 className="font-semibold text-white mb-1">自由模式</h4>
                <p className="text-sm text-gray-300 mb-3">
                  无限制的自由玩法，可以自定义棋盘大小和随机生成
                </p>
                <div className="text-xs text-gray-400">
                  当前模式
                </div>
              </div>

              {/* 挑战模式 */}
              <div
                className="text-center p-4 bg-gray-700 bg-opacity-50 rounded-lg cursor-pointer hover:bg-opacity-70 transition-all"
                onClick={() => setShowChallengeMode(true)}
              >
                <div className="text-2xl mb-2">🏆</div>
                <h4 className="font-semibold text-white mb-1">挑战模式</h4>
                <p className="text-sm text-gray-300 mb-3">
                  完成预设挑战，测试你的解谜技巧
                </p>
                <button className="px-4 py-2 bg-yellow-500 text-gray-900 rounded text-sm font-medium hover:bg-yellow-400 transition-colors">
                  开始挑战
                </button>
              </div>

              {/* 1000fps模式 */}
              <div
                className="text-center p-4 bg-gray-700 bg-opacity-50 rounded-lg cursor-pointer hover:bg-opacity-70 transition-all"
                onClick={() => setIsHyperPerformanceMode(true)}
              >
                <div className="text-2xl mb-2">⚡</div>
                <h4 className="font-semibold text-white mb-1">极速模式</h4>
                <p className="text-sm text-gray-300 mb-3">
                  体验1000fps极致性能，支持大型矩阵
                </p>
                <button className="px-4 py-2 bg-red-500 text-white rounded text-sm font-medium hover:bg-red-400 transition-colors">
                  进入极速
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 挑战状态显示 */}
        {currentChallenge && (
          <div className="glass-effect rounded-xl p-4 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-yellow-500 font-medium">🎯 挑战中</span>
                <span className="text-white">{currentChallenge.name}</span>
                {currentChallenge.timeLimit && challengeTimer && (
                  <span className="text-yellow-500 font-mono">
                    ⏱️ {Math.floor(challengeTimer / 60)}:{(challengeTimer % 60).toString().padStart(2, '0')}
                  </span>
                )}
                <span className="text-gray-300">
                  💡 {hintsUsed}/{currentChallenge.hints}
                </span>
              </div>
              <button
                onClick={handleExitChallenge}
                className="text-red-500 hover:text-red-400 transition-colors"
              >
                退出挑战
              </button>
            </div>
          </div>
        )}

        {/* 游戏说明 */}
        <div className="text-center text-gray-300 mt-8">
          <p className="mb-2">点击格子来切换灯光状态</p>
          <p className="text-sm">目标：点亮所有格子</p>
        </div>

        {/* 挑战模式弹窗 */}
        {showChallengeMode && (
          <SimpleChallengeMode
            onStartChallenge={handleStartChallenge}
            onExit={() => setShowChallengeMode(false)}
          />
        )}
      </div>
    </div>
  );

  function handleStartChallenge(challenge: any) {
    setCurrentChallenge(challenge);
    setRows(challenge.board.length);
    setCols(challenge.board[0].length);
    setGameState({
      board: challenge.board,
      history: [challenge.board],
      historyIndex: 0,
      moveCount: 0
    });
    setSolution([]);
    setCurrentStep(0);
    setBoardStates([]);
    setIsAutoPlaying(false);
    setHintsUsed(0);
    setShowChallengeMode(false);

    // 如果有时间限制，启动计时器
    if (challenge.timeLimit) {
      const startTime = Date.now();
      setChallengeStartTime(startTime);

      const timer = window.setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const remaining = challenge.timeLimit - elapsed;

        if (remaining <= 0) {
          clearInterval(timer);
          setChallengeTimer(null);
          showToast('⏰ 时间到！挑战失败', 'error');
          setCurrentChallenge(null);
        } else {
          setChallengeTimer(remaining);
        }
      }, 1000);

      setChallengeTimer(timer);
    }

    showToast(`🎯 挑战开始：${challenge.name}`, 'info');
  }

  function handleExitChallenge() {
    if (challengeTimer) {
      clearInterval(challengeTimer);
      setChallengeTimer(null);
    }
    setCurrentChallenge(null);
    setChallengeStartTime(null);
    setHintsUsed(0);
    handleReset();
    showToast('挑战已退出', 'info');
  }
};

export default App;