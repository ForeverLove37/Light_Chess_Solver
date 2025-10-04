import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { createEmptyBoard } from '../../utils/game/board';
import { CellPosition } from '../../types/index';

export interface SharedBoard {
  id: string;
  title: string;
  description: string;
  author: string;
  board: number[][];
  rows: number;
  cols: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  tags: string[];
  likes: number;
  plays: number;
  createdAt: string;
  verified: boolean;
  solution?: CellPosition[];
}

interface CreationShareModeProps {
  onLoadBoard: (board: number[][], rows: number, cols: number, title?: string) => void;
  onExit: () => void;
  theme: any;
  currentUser?: string;
}

const CreationShareMode: React.FC<CreationShareModeProps> = ({
  onLoadBoard,
  onExit,
  currentUser = '匿名用户'
}) => {
  const [activeTab, setActiveTab] = useState<'browse' | 'create' | 'myCreations'>('browse');
  const [sharedBoards, setSharedBoards] = useState<SharedBoard[]>([]);
  const [myCreations, setMyCreations] = useState<SharedBoard[]>([]);
  const [creationForm, setCreationForm] = useState({
    title: '',
    description: '',
    rows: 5,
    cols: 5,
    board: createEmptyBoard(5, 5),
    tags: [] as string[],
    difficulty: 'medium' as const
  });
  const [isLoading, setIsLoading] = useState(false);

  // 示例共享棋盘数据
  useEffect(() => {
    // 模拟从服务器加载共享棋盘
    const mockBoards: SharedBoard[] = [
      {
        id: '1',
        title: '笑脸图案',
        description: '一个经典的笑脸，需要巧妙的方法来解决',
        author: '棋艺大师',
        board: [
          [0, 1, 1, 1, 0],
          [1, 0, 0, 0, 1],
          [1, 0, 1, 0, 1],
          [1, 0, 0, 0, 1],
          [0, 1, 1, 1, 0]
        ],
        rows: 5,
        cols: 5,
        difficulty: 'medium',
        tags: ['表情', '经典', '对称'],
        likes: 42,
        plays: 128,
        createdAt: '2025-01-15',
        verified: true
      },
      {
        id: '2',
        title: '螺旋迷宫',
        description: '复杂的螺旋图案，需要12步才能完成',
        author: '解谜专家',
        board: [
          [0, 0, 1, 0, 0, 0],
          [0, 1, 1, 1, 0, 0],
          [1, 0, 1, 0, 1, 0],
          [0, 0, 1, 0, 0, 1],
          [0, 0, 1, 1, 1, 0],
          [0, 0, 0, 1, 0, 0]
        ],
        rows: 6,
        cols: 6,
        difficulty: 'hard',
        tags: ['螺旋', '复杂', '挑战'],
        likes: 28,
        plays: 87,
        createdAt: '2025-01-20',
        verified: true
      },
      {
        id: '3',
        title: '钻石形状',
        description: '优雅的钻石图案，适合新手练习',
        author: '光影艺术家',
        board: [
          [0, 0, 1, 0, 0],
          [0, 1, 1, 1, 0],
          [1, 1, 0, 1, 1],
          [0, 1, 1, 1, 0],
          [0, 0, 1, 0, 0]
        ],
        rows: 5,
        cols: 5,
        difficulty: 'easy',
        tags: ['钻石', '优雅', '新手'],
        likes: 56,
        plays: 203,
        createdAt: '2025-01-10',
        verified: true
      }
    ];

    setSharedBoards(mockBoards);
    setMyCreations(mockBoards.filter(b => b.author === currentUser));
  }, [currentUser]);

  const handleCellClick = (row: number, col: number) => {
    const newBoard = [...creationForm.board];
    newBoard[row] = [...newBoard[row]];
    newBoard[row][col] = newBoard[row][col] === 0 ? 1 : 0;
    
    setCreationForm({
      ...creationForm,
      board: newBoard
    });
  };

  const handlePublish = async () => {
    if (!creationForm.title.trim()) {
      alert('请输入标题');
      return;
    }

    setIsLoading(true);
    
    // 模拟发布到服务器
    const newBoard: SharedBoard = {
      id: Date.now().toString(),
      title: creationForm.title,
      description: creationForm.description,
      author: currentUser,
      board: creationForm.board,
      rows: creationForm.rows,
      cols: creationForm.cols,
      difficulty: creationForm.difficulty,
      tags: creationForm.tags,
      likes: 0,
      plays: 0,
      createdAt: new Date().toISOString().split('T')[0],
      verified: false
    };

    // 模拟API调用
    setTimeout(() => {
      setSharedBoards([newBoard, ...sharedBoards]);
      setMyCreations([newBoard, ...myCreations]);
      setCreationForm({
        ...creationForm,
        title: '',
        description: '',
        board: createEmptyBoard(creationForm.rows, creationForm.cols),
        tags: []
      });
      setIsLoading(false);
      alert('发布成功！');
      setActiveTab('browse');
    }, 1000);
  };

  const handleLoadBoard = (board: SharedBoard) => {
    onLoadBoard(board.board, board.rows, board.cols, board.title);
    onExit();
  };

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

  const renderBoardPreview = (board: number[][], size: 'small' | 'medium' = 'small') => {
    const cellSize = size === 'small' ? 8 : 12;

    return (
      <div 
        className="grid gap-px bg-gray-600 p-px rounded"
        style={{ 
          gridTemplateColumns: `repeat(${board[0]?.length || 5}, ${cellSize}px)`,
        }}
      >
        {board.map((row, i) => 
          row.map((cell, j) => (
            <div
              key={`${i}-${j}`}
              className={`rounded-sm ${
                cell ? 'bg-matrix-on' : 'bg-gray-700'
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
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-gray-800 rounded-xl p-6 max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* 头部 */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-white">创作分享</h2>
          <button
            onClick={onExit}
            className="text-gray-400 hover:text-white transition-colors text-2xl"
          >
            ✕
          </button>
        </div>

        {/* 标签页 */}
        <div className="flex gap-2 mb-6 border-b border-gray-700">
          <button
            onClick={() => setActiveTab('browse')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'browse'
                ? 'text-matrix-on border-b-2 border-matrix-on'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            浏览作品
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'create'
                ? 'text-matrix-on border-b-2 border-matrix-on'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            创建作品
          </button>
          <button
            onClick={() => setActiveTab('myCreations')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'myCreations'
                ? 'text-matrix-on border-b-2 border-matrix-on'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            我的作品 ({myCreations.length})
          </button>
        </div>

        {/* 内容区域 */}
        {activeTab === 'browse' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sharedBoards.map((board) => (
              <motion.div
                key={board.id}
                whileHover={{ scale: 1.02 }}
                className="glass-effect rounded-lg p-4 hover:bg-gray-700 transition-colors cursor-pointer"
                onClick={() => handleLoadBoard(board)}
              >
                {/* 头部信息 */}
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-white">{board.title}</h3>
                  {board.verified && (
                    <span className="text-green-500 text-sm">✓</span>
                  )}
                </div>

                {/* 作者和难度 */}
                <div className="flex items-center gap-2 mb-2 text-sm">
                  <span className="text-gray-400">by {board.author}</span>
                  <span className={`w-2 h-2 rounded-full ${difficultyColors[board.difficulty]}`} />
                  <span className="text-gray-400">{difficultyNames[board.difficulty]}</span>
                </div>

                {/* 描述 */}
                <p className="text-sm text-gray-300 mb-3">{board.description}</p>

                {/* 棋盘预览 */}
                <div className="flex justify-center mb-3">
                  {renderBoardPreview(board.board)}
                </div>

                {/* 标签 */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {board.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* 统计信息 */}
                <div className="flex justify-between text-xs text-gray-400">
                  <span>❤️ {board.likes}</span>
                  <span>🎮 {board.plays}</span>
                  <span>{board.createdAt}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {activeTab === 'create' && (
          <div className="space-y-6">
            {/* 基本信息 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  作品标题 *
                </label>
                <input
                  type="text"
                  value={creationForm.title}
                  onChange={(e) => setCreationForm({...creationForm, title: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                  placeholder="给你的作品起个名字"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  难度等级
                </label>
                <select
                  value={creationForm.difficulty}
                  onChange={(e) => setCreationForm({...creationForm, difficulty: e.target.value as any})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                >
                  <option value="easy">简单</option>
                  <option value="medium">中等</option>
                  <option value="hard">困难</option>
                  <option value="expert">专家</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                作品描述
              </label>
              <textarea
                value={creationForm.description}
                onChange={(e) => setCreationForm({...creationForm, description: e.target.value})}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                rows={3}
                placeholder="描述你的作品特点、难度或解题思路"
              />
            </div>

            {/* 棋盘设置 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  行数
                </label>
                <input
                  type="number"
                  min="3"
                  max="10"
                  value={creationForm.rows}
                  onChange={(e) => {
                    const rows = parseInt(e.target.value) || 3;
                    setCreationForm({
                      ...creationForm,
                      rows,
                      board: createEmptyBoard(rows, creationForm.cols)
                    });
                  }}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  列数
                </label>
                <input
                  type="number"
                  min="3"
                  max="10"
                  value={creationForm.cols}
                  onChange={(e) => {
                    const cols = parseInt(e.target.value) || 3;
                    setCreationForm({
                      ...creationForm,
                      cols,
                      board: createEmptyBoard(creationForm.rows, cols)
                    });
                  }}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                />
              </div>
            </div>

            {/* 棋盘编辑器 */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                编辑棋盘 (点击格子切换状态)
              </label>
              <div className="flex justify-center">
                <div 
                  className="grid gap-1 bg-gray-700 p-4 rounded-lg"
                  style={{ 
                    gridTemplateColumns: `repeat(${creationForm.cols}, 1fr)`,
                  }}
                >
                  {creationForm.board.map((row, i) => 
                    row.map((cell, j) => (
                      <div
                        key={`${i}-${j}`}
                        onClick={() => handleCellClick(i, j)}
                        className={`w-8 h-8 rounded cursor-pointer transition-all hover:scale-110 ${
                          cell ? 'bg-matrix-on' : 'bg-gray-600'
                        }`}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setCreationForm({
                  ...creationForm,
                  board: createEmptyBoard(creationForm.rows, creationForm.cols)
                })}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              >
                清空棋盘
              </button>
              <button
                onClick={handlePublish}
                disabled={isLoading || !creationForm.title.trim()}
                className="px-6 py-2 bg-matrix-on text-gray-900 rounded hover:bg-cyan-400 transition-colors disabled:opacity-50"
              >
                {isLoading ? '发布中...' : '发布作品'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'myCreations' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myCreations.length > 0 ? (
              myCreations.map((board) => (
                <motion.div
                  key={board.id}
                  whileHover={{ scale: 1.02 }}
                  className="glass-effect rounded-lg p-4 hover:bg-gray-700 transition-colors"
                >
                  {/* 头部信息 */}
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-white">{board.title}</h3>
                    {!board.verified && (
                      <span className="text-yellow-500 text-sm">审核中</span>
                    )}
                  </div>

                  {/* 棋盘预览 */}
                  <div className="flex justify-center mb-3">
                    {renderBoardPreview(board.board, 'medium')}
                  </div>

                  {/* 统计信息 */}
                  <div className="flex justify-between text-sm text-gray-400 mb-3">
                    <span>❤️ {board.likes}</span>
                    <span>🎮 {board.plays}</span>
                    <span>{board.createdAt}</span>
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleLoadBoard(board)}
                      className="flex-1 px-3 py-1 bg-matrix-on text-gray-900 rounded text-sm hover:bg-cyan-400 transition-colors"
                    >
                      加载游戏
                    </button>
                    <button className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 transition-colors">
                      编辑
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-400 mb-4">你还没有发布任何作品</p>
                <button
                  onClick={() => setActiveTab('create')}
                  className="px-4 py-2 bg-matrix-on text-gray-900 rounded hover:bg-cyan-400 transition-colors"
                >
                  创建第一个作品
                </button>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default CreationShareMode;