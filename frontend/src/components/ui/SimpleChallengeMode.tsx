import React, { useState } from 'react';
import { CellPosition } from '../../types/index';

interface Challenge {
  id: string;
  name: string;
  description: string;
  board: number[][];
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  optimalSteps: number;
  timeLimit?: number;
  hints: number;
}

interface SimpleChallengeModeProps {
  onStartChallenge: (challenge: Challenge) => void;
  onExit: () => void;
}

const SimpleChallengeMode: React.FC<SimpleChallengeModeProps> = ({
  onStartChallenge,
  onExit
}) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  // 示例挑战数据
  const challenges: Challenge[] = [
    {
      id: '1',
      name: '入门训练',
      description: '简单的3x3棋盘，适合新手',
      board: [
        [1, 0, 1],
        [0, 1, 0],
        [1, 0, 1]
      ],
      difficulty: 'easy',
      optimalSteps: 5,
      timeLimit: 120,
      hints: 3
    },
    {
      id: '2',
      name: '十字路口',
      description: '经典的十字图案',
      board: [
        [0, 1, 0, 1, 0],
        [1, 1, 1, 1, 1],
        [0, 1, 1, 1, 0],
        [1, 1, 1, 1, 1],
        [0, 1, 0, 1, 0]
      ],
      difficulty: 'medium',
      optimalSteps: 8,
      timeLimit: 180,
      hints: 2
    },
    {
      id: '3',
      name: '螺旋迷宫',
      description: '复杂的螺旋图案',
      board: [
        [0, 0, 1, 0, 0, 0],
        [0, 1, 1, 1, 0, 0],
        [1, 0, 1, 0, 1, 0],
        [0, 0, 1, 0, 0, 1],
        [0, 0, 1, 1, 1, 0],
        [0, 0, 0, 1, 0, 0]
      ],
      difficulty: 'hard',
      optimalSteps: 12,
      timeLimit: 300,
      hints: 1
    }
  ];

  const filteredChallenges = selectedDifficulty === 'all'
    ? challenges
    : challenges.filter(c => c.difficulty === selectedDifficulty);

  const difficultyColors = {
    easy: 'bg-green-500',
    medium: 'bg-yellow-500',
    hard: 'bg-orange-500',
    expert: 'bg-red-500'
  };

  const difficultyNames = {
    easy: '简单',
    medium: '中等',
    hard: '困难',
    expert: '专家'
  };

  const renderBoardPreview = (board: number[][]) => {
    const cellSize = 6;
    return (
      <div
        className="grid gap-px bg-gray-600 p-px rounded mx-auto"
        style={{
          gridTemplateColumns: `repeat(${board[0]?.length || 5}, ${cellSize}px)`,
        }}
      >
        {board.map((row, i) =>
          row.map((cell, j) => (
            <div
              key={`${i}-${j}`}
              className={`rounded-sm ${
                cell ? 'bg-cyan-400' : 'bg-gray-700'
              }`}
              style={{
                width: cellSize,
                height: cellSize
              }}
            />
          ))
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* 头部 */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-white">挑战模式</h2>
          <button
            onClick={onExit}
            className="text-gray-400 hover:text-white transition-colors text-2xl"
          >
            ✕
          </button>
        </div>

        {/* 难度筛选 */}
        <div className="flex gap-2 mb-6">
          {['all', 'easy', 'medium', 'hard', 'expert'].map(diff => (
            <button
              key={diff}
              onClick={() => setSelectedDifficulty(diff)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedDifficulty === diff
                  ? 'bg-cyan-500 text-gray-900'
                  : 'bg-gray-700 text-white hover:bg-gray-600'
              }`}
            >
              {diff === 'all' ? '全部' : difficultyNames[diff as keyof typeof difficultyNames]}
            </button>
          ))}
        </div>

        {/* 挑战列表 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredChallenges.map((challenge) => (
            <div
              key={challenge.id}
              className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors cursor-pointer"
              onClick={() => onStartChallenge(challenge)}
            >
              {/* 头部 */}
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-white">{challenge.name}</h3>
                <span className={`px-2 py-1 rounded text-xs text-white ${difficultyColors[challenge.difficulty]}`}>
                  {difficultyNames[challenge.difficulty]}
                </span>
              </div>

              {/* 描述 */}
              <p className="text-sm text-gray-300 mb-3">{challenge.description}</p>

              {/* 棋盘预览 */}
              <div className="mb-3">
                {renderBoardPreview(challenge.board)}
              </div>

              {/* 挑战信息 */}
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
                <div>最优步数: {challenge.optimalSteps}</div>
                <div>提示次数: {challenge.hints}</div>
                {challenge.timeLimit && (
                  <div>时间限制: {Math.floor(challenge.timeLimit / 60)}:{(challenge.timeLimit % 60).toString().padStart(2, '0')}</div>
                )}
                <div>大小: {challenge.board.length}×{challenge.board[0].length}</div>
              </div>

              {/* 开始按钮 */}
              <button className="w-full mt-3 px-3 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 transition-colors text-sm">
                开始挑战
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SimpleChallengeMode;