import React from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

interface QoLPanelProps {
  onUndo: () => void;
  onRedo: () => void;
  onHint: () => void;
  onClearHint: () => void;
  onSave: () => void;
  onLoad: () => void;
  canUndo: boolean;
  canRedo: boolean;
  hintLoading: boolean;
  hasSavedGame: boolean;
  moveCount: number;
}

const QoLPanel: React.FC<QoLPanelProps> = ({
  onUndo,
  onRedo,
  onHint,
  onClearHint,
  onSave,
  onLoad,
  canUndo,
  canRedo,
  hintLoading,
  hasSavedGame,
  moveCount
}) => {
  const handleUndo = () => {
    onUndo();
    toast('已撤销上一步', {
      icon: '↩️',
      style: {
        background: 'rgba(26, 26, 46, 0.9)',
        color: '#fff',
        border: '1px solid #16f4d0',
      },
    });
  };

  const handleRedo = () => {
    onRedo();
    toast('已重做下一步', {
      icon: '↪️',
      style: {
        background: 'rgba(26, 26, 46, 0.9)',
        color: '#fff',
        border: '1px solid #16f4d0',
      },
    });
  };

  const handleHint = () => {
    onHint();
    toast('正在获取提示...', {
      icon: '💡',
      duration: 2000,
      style: {
        background: 'rgba(26, 26, 46, 0.9)',
        color: '#fff',
        border: '1px solid #16f4d0',
      },
    });
  };

  const handleSave = () => {
    onSave();
    toast('游戏已保存', {
      icon: '💾',
      style: {
        background: 'rgba(26, 26, 46, 0.9)',
        color: '#fff',
        border: '1px solid #16f4d0',
      },
    });
  };

  const handleLoad = () => {
    onLoad();
    toast('游戏已加载', {
      icon: '📂',
      style: {
        background: 'rgba(26, 26, 46, 0.9)',
        color: '#fff',
        border: '1px solid #16f4d0',
      },
    });
  };

  return (
    <motion.div
      className="glass-effect rounded-xl p-6 mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* 操作历史控制 */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-300 mr-2">操作历史:</span>
          <button
            onClick={handleUndo}
            disabled={!canUndo}
            className={`px-3 py-2 rounded-lg transition-all duration-200 ${
              canUndo 
                ? 'bg-matrix-hover text-white hover:bg-gray-700' 
                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
            }`}
          >
            ↩️ 撤销
          </button>
          <button
            onClick={handleRedo}
            disabled={!canRedo}
            className={`px-3 py-2 rounded-lg transition-all duration-200 ${
              canRedo 
                ? 'bg-matrix-hover text-white hover:bg-gray-700' 
                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
            }`}
          >
            ↪️ 重做
          </button>
        </div>

        {/* 步数统计 */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-300">步数:</span>
          <span className="text-lg font-mono text-matrix-on">{moveCount}</span>
        </div>

        {/* 智能提示 */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-300">智能提示:</span>
          <button
            onClick={handleHint}
            disabled={hintLoading}
            className={`px-3 py-2 rounded-lg transition-all duration-200 ${
              hintLoading 
                ? 'bg-yellow-600 text-white cursor-not-allowed' 
                : 'bg-matrix-accent text-white hover:bg-red-600'
            }`}
          >
            {hintLoading ? '🤔 思考中...' : '💡 提示'}
          </button>
          <button
            onClick={onClearHint}
            className="px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200"
          >
            🚫 清除提示
          </button>
        </div>

        {/* 游戏存档 */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-300">存档:</span>
          <button
            onClick={handleSave}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            💾 保存
          </button>
          <button
            onClick={handleLoad}
            disabled={!hasSavedGame}
            className={`px-3 py-2 rounded-lg transition-all duration-200 ${
              hasSavedGame 
                ? 'bg-green-600 text-white hover:bg-green-700' 
                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
            }`}
          >
            📂 加载
          </button>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
          <span>💡 提示: 智能提示会显示下一步的最佳操作</span>
          <span>•</span>
          <span>💾 存档: 自动保存当前游戏进度到本地</span>
          <span>•</span>
          <span>🎯 快捷键: Ctrl+Z (撤销) / Ctrl+Y (重做)</span>
        </div>
      </div>
    </motion.div>
  );
};

export default QoLPanel;