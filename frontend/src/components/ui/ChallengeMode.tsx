import React, { useState } from 'react';
import { motion } from 'framer-motion';

export interface Challenge {
  id: string;
  name: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  board: number[][];
  optimalSteps: number;
  timeLimit?: number; // 秒
  hints: number;
  category: 'pattern' | 'symmetry' | 'efficiency' | 'creativity';
  unlocked: boolean;
  completed: boolean;
  bestScore?: {
    moves: number;
    time: number;
    hintsUsed: number;
  };
}

interface ChallengeModeProps {
  onStartChallenge: (challenge: Challenge) => void;
  onExit: () => void;
  theme: any;
}

const ChallengeMode: React.FC<ChallengeModeProps> = ({
  onStartChallenge,
  onExit
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [playerProgress] = useState<{
    completedChallenges: string[];
    unlockedCategories: string[];
    totalStars: number;
  }>({
    completedChallenges: [],
    unlockedCategories: ['pattern', 'symmetry'],
    totalStars: 0
  });

  // 示例挑战数据
  const challenges: Challenge[] = [
    {
      id: 'pattern-1',
      name: '十字架',
      description: '经典的十字图案，需要找到核心的翻转点',
      difficulty: 'easy',
      board: [
        [0, 1, 0],
        [1, 1, 1],
        [0, 1, 0]
      ],
      optimalSteps: 3,
      hints: 3,
      category: 'pattern',
      unlocked: true,
      completed: false
    },
    {
      id: 'pattern-2',
      name: '边框',
      description: '只有边缘是点亮的，需要小心处理',
      difficulty: 'medium',
      board: [
        [1, 1, 1, 1],
        [1, 0, 0, 1],
        [1, 0, 0, 1],
        [1, 1, 1, 1]
      ],
      optimalSteps: 8,
      hints: 5,
      category: 'pattern',
      unlocked: true,
      completed: false
    },
    {
      id: 'symmetry-1',
      name: '镜像对称',
      description: '利用对称性来简化问题',
      difficulty: 'medium',
      board: [
        [0, 1, 1, 0],
        [1, 0, 0, 1],
        [1, 0, 0, 1],
        [0, 1, 1, 0]
      ],
      optimalSteps: 6,
      hints: 4,
      category: 'symmetry',
      unlocked: true,
      completed: false
    },
    {
      id: 'symmetry-2',
      name: '旋转对称',
      description: '90度旋转对称的高级挑战',
      difficulty: 'hard',
      board: [
        [0, 0, 1, 0, 0],
        [0, 1, 1, 1, 0],
        [1, 1, 0, 1, 1],
        [0, 1, 1, 1, 0],
        [0, 0, 1, 0, 0]
      ],
      optimalSteps: 9,
      hints: 3,
      category: 'symmetry',
      unlocked: playerProgress.unlockedCategories.includes('symmetry'),
      completed: false
    },
    {
      id: 'efficiency-1',
      name: '最少步数',
      description: '5步内完成这个4x4棋盘',
      difficulty: 'hard',
      board: [
        [1, 0, 0, 1],
        [0, 1, 1, 0],
        [0, 1, 1, 0],
        [1, 0, 0, 1]
      ],
      optimalSteps: 4,
      timeLimit: 120,
      hints: 2,
      category: 'efficiency',
      unlocked: playerProgress.unlockedCategories.includes('efficiency'),
      completed: false
    },
    {
      id: 'creativity-1',
      name: '创意图案',
      description: '创建一个心形图案',
      difficulty: 'expert',
      board: [
        [0, 1, 0, 1, 0],
        [1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1],
        [0, 1, 1, 1, 0],
        [0, 0, 1, 0, 0]
      ],
      optimalSteps: 12,
      timeLimit: 300,
      hints: 6,
      category: 'creativity',
      unlocked: playerProgress.unlockedCategories.includes('creativity'),
      completed: false
    }
  ];

  const categories = [
    { id: 'all', name: '全部', icon: '🎯' },
    { id: 'pattern', name: '图案', icon: '🎨' },
    { id: 'symmetry', name: '对称', icon: '🔄' },
    { id: 'efficiency', name: '效率', icon: '⚡' },
    { id: 'creativity', name: '创意', icon: '✨' }
  ];

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

  const filteredChallenges = selectedCategory === 'all' 
    ? challenges 
    : challenges.filter(c => c.category === selectedCategory && c.unlocked);

  const handleChallengeClick = (challenge: Challenge) => {
    if (challenge.unlocked) {
      onStartChallenge(challenge);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-gray-800 rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* 头部 */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-white">挑战模式</h2>
          <button
            onClick={onExit}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* 进度统计 */}
        <div className="glass-effect rounded-lg p-4 mb-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-matrix-on">
                {playerProgress.completedChallenges.length}
              </div>
              <div className="text-sm text-gray-400">已完成</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-500">
                {playerProgress.totalStars}
              </div>
              <div className="text-sm text-gray-400">总星数</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-500">
                {filteredChallenges.filter(c => c.unlocked && !c.completed).length}
              </div>
              <div className="text-sm text-gray-400">待挑战</div>
            </div>
          </div>
        </div>

        {/* 分类选择 */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap transition-colors ${
                selectedCategory === category.id
                  ? 'bg-matrix-on text-gray-900'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <span>{category.icon}</span>
              <span>{category.name}</span>
            </button>
          ))}
        </div>

        {/* 挑战列表 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredChallenges.map((challenge) => (
            <motion.div
              key={challenge.id}
              whileHover={{ scale: challenge.unlocked ? 1.02 : 1 }}
              whileTap={{ scale: challenge.unlocked ? 0.98 : 1 }}
              className={`glass-effect rounded-lg p-4 cursor-pointer transition-all ${
                challenge.unlocked 
                  ? 'hover:bg-gray-700' 
                  : 'opacity-50 cursor-not-allowed'
              }`}
              onClick={() => handleChallengeClick(challenge)}
            >
              {/* 挑战头部 */}
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-white">{challenge.name}</h3>
                <div className="flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${difficultyColors[challenge.difficulty]}`} />
                  <span className="text-xs text-gray-400">
                    {difficultyNames[challenge.difficulty]}
                  </span>
                </div>
              </div>

              {/* 描述 */}
              <p className="text-sm text-gray-300 mb-3">{challenge.description}</p>

              {/* 挑战信息 */}
              <div className="space-y-1 text-xs text-gray-400">
                <div className="flex justify-between">
                  <span>最优步数</span>
                  <span className="text-white">{challenge.optimalSteps}</span>
                </div>
                {challenge.timeLimit && (
                  <div className="flex justify-between">
                    <span>时间限制</span>
                    <span className="text-white">{Math.floor(challenge.timeLimit / 60)}分{challenge.timeLimit % 60}秒</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>提示次数</span>
                  <span className="text-white">{challenge.hints}</span>
                </div>
              </div>

              {/* 状态指示器 */}
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {challenge.completed ? (
                    <span className="text-green-500 text-sm">✓ 已完成</span>
                  ) : challenge.unlocked ? (
                    <span className="text-matrix-on text-sm">🔓 已解锁</span>
                  ) : (
                    <span className="text-gray-500 text-sm">🔒 未解锁</span>
                  )}
                </div>
                {challenge.completed && (
                  <div className="flex gap-1">
                    {[1, 2, 3].map((star) => (
                      <span key={star} className="text-yellow-500">⭐</span>
                    ))}
                  </div>
                )}
              </div>

              {/* 小预览 */}
              <div className="mt-3 flex justify-center">
                <div className="grid gap-0.5" style={{ 
                  gridTemplateColumns: `repeat(${challenge.board[0]?.length || 3}, 1fr)`
                }}>
                  {challenge.board.slice(0, 3).map((row, i) => 
                    row.slice(0, 3).map((cell, j) => (
                      <div
                        key={`${i}-${j}`}
                        className={`w-2 h-2 rounded ${
                          cell ? 'bg-matrix-on' : 'bg-gray-600'
                        }`}
                      />
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* 底部信息 */}
        <div className="mt-6 text-center text-sm text-gray-400">
          完成挑战解锁新的分类和内容！
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ChallengeMode;