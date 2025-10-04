# 开发规范文档

本文档详细说明了 Lights Matrix 项目的开发规范、最佳实践和技术标准。

## 📋 目录

1. [代码规范](#代码规范)
2. [文件组织](#文件组织)
3. [组件开发](#组件开发)
4. [性能优化](#性能优化)
5. [状态管理](#状态管理)
6. [样式规范](#样式规范)
7. [TypeScript 规范](#typescript-规范)
8. [测试规范](#测试规范)
9. [Git 工作流](#git-工作流)
10. [部署规范](#部署规范)

## 代码规范

### 命名规范

#### 文件命名
```
- 组件文件: PascalCase.tsx (如 GameBoard.tsx)
- 工具文件: camelCase.ts (如 boardUtils.ts)
- Hook文件: camelCase.ts (如 useGameState.ts)
- 样式文件: kebab-case.css (如 game-board.css)
- 类型文件: camelCase.ts (如 index.ts)
```

#### 变量命名
```typescript
// ✅ 好的命名
const gameState = useState<GameState>();
const isGameSolved = computed(() => gameState.value.isSolved);
const handleCellClick = useCallback((row: number, col: number) => {
  // 处理点击逻辑
}, []);

// ❌ 避免的命名
const state = useState();
const data = computed(() => state.value.data);
const onClick = useCallback(() => {
  // 处理点击逻辑
}, []);
```

#### 组件命名
```typescript
// ✅ 组件名使用 PascalCase
const GameBoard: React.FC<GameBoardProps> = ({ board, onCellClick }) => {
  return (
    <div className="game-board">
      {/* 组件内容 */}
    </div>
  );
};

// ✅ 组件Props接口命名
interface GameBoardProps {
  board: number[][];
  onCellClick: (row: number, col: number) => void;
  disabled?: boolean;
}
```

### 代码格式

#### 缩进和空格
```typescript
// 使用 2 个空格缩进
const someFunction = (param1: string, param2: number): boolean => {
  if (param1.length > param2) {
    return true;
  }
  return false;
};
```

#### 函数声明
```typescript
// ✅ 箭头函数（推荐用于组件内函数）
const handleClick = useCallback(() => {
  // 处理逻辑
}, [dependencies]);

// ✅ 函数声明（推荐用于导出函数）
export function calculateMatrix(board: number[][]): number {
  // 计算逻辑
}
```

## 文件组织

### 目录结构
```
src/
├── components/
│   ├── game/          # 游戏核心组件
│   ├── ui/            # UI组件
│   └── layout/        # 布局组件
├── hooks/
│   ├── game/          # 游戏相关hooks
│   └── utils/         # 工具hooks
├── utils/
│   ├── game/          # 游戏工具函数
│   └── core/          # 核心工具函数
├── styles/
│   ├── core/          # 核心样式
│   └── components/    # 组件样式
├── workers/           # Web Workers
├── types/             # TypeScript类型定义
└── __tests__/         # 测试文件
```

### 文件导出规范

#### 组件导出
```typescript
// GameBoard.tsx
import React from 'react';

const GameBoard: React.FC<GameBoardProps> = ({ ... }) => {
  // 组件实现
};

// ✅ 默认导出组件
export default GameBoard;

// ✅ 同时导出类型
export type { GameBoardProps };
```

#### 工具函数导出
```typescript
// board.ts
export const toggleCell = (board: number[][], row: number, col: number): number[][] => {
  // 实现逻辑
};

export const isBoardSolved = (board: number[][]): boolean => {
  // 实现逻辑
};

// ✅ 统一导出
export { toggleCell, isBoardSolved };
```

## 组件开发

### 组件结构

```typescript
// 1. 导入
import React, { useState, useCallback, memo } from 'react';
import { motion } from 'framer-motion';
import type { GameBoardProps } from '../types';

// 2. 组件定义
const GameBoard: React.FC<GameBoardProps> = memo(({
  board,
  onCellClick,
  disabled = false
}) => {
  // 3. Hooks (按顺序)
  const [isSolved, setIsSolved] = useState(false);

  // 4. 事件处理函数
  const handleClick = useCallback((row: number, col: number) => {
    if (disabled) return;
    onCellClick(row, col);
  }, [disabled, onCellClick]);

  // 5. 计算属性
  const boardSize = useMemo(() => board.length, [board]);

  // 6. 渲染
  return (
    <motion.div
      className="game-board"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* JSX内容 */}
    </motion.div>
  );
});

// 7. 显示名称
GameBoard.displayName = 'GameBoard';

// 8. 导出
export default GameBoard;
```

### 组件优化

#### 使用 React.memo
```typescript
// ✅ 对于复杂组件使用 memo
const ExpensiveComponent = memo<Props>(({ data, onUpdate }) => {
  return (
    <div>
      {data.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
}, (prevProps, nextProps) => {
  // 自定义比较函数
  return prevProps.data.length === nextProps.data.length;
});
```

#### 使用 useCallback
```typescript
// ✅ 缓存事件处理函数
const handleClick = useCallback((id: string) => {
  onItemClick(id);
}, [onItemClick]);

// ✅ 缓存复杂计算
const processedData = useCallback((rawData: DataItem[]) => {
  return rawData.map(item => ({
    ...item,
    processed: true
  }));
}, []);
```

## 性能优化

### 渲染优化

#### 大列表优化
```typescript
// ✅ 使用虚拟化渲染大列表
const VirtualizedMatrix: React.FC<MatrixProps> = ({ board }) => {
  const visibleRange = useVirtualization(board.length, 50);

  return (
    <div className="virtual-matrix">
      {visibleRange.map(rowIndex => (
        <MatrixRow
          key={rowIndex}
          row={board[rowIndex]}
          rowIndex={rowIndex}
        />
      ))}
    </div>
  );
};
```

#### GPU加速
```typescript
// ✅ 使用GPU加速样式
const gpuAcceleratedStyle: CSSProperties = {
  transform: 'translateZ(0)',
  willChange: 'transform',
  backfaceVisibility: 'hidden',
  contain: 'layout style paint'
};
```

### 内存优化

#### 清理副作用
```typescript
useEffect(() => {
  const handleResize = () => {
    // 处理窗口大小变化
  };

  window.addEventListener('resize', handleResize);

  // ✅ 清理事件监听器
  return () => {
    window.removeEventListener('resize', handleResize);
  };
}, []);
```

#### 避免内存泄漏
```typescript
// ✅ 及时清理定时器
useEffect(() => {
  const timer = setInterval(() => {
    // 定时逻辑
  }, 1000);

  return () => clearInterval(timer);
}, []);

// ✅ 清理Worker
useEffect(() => {
  const worker = new Worker('/worker.js');

  return () => {
    worker.terminate();
  };
}, []);
```

## 状态管理

### Hook使用规范

#### useState
```typescript
// ✅ 使用类型注解
const [board, setBoard] = useState<number[][]>([]);

// ✅ 使用函数式更新避免闭包问题
const updateBoard = useCallback((newRow: number, newCol: number) => {
  setBoard(prevBoard => {
    const newBoard = prevBoard.map(row => [...row]);
    newBoard[newRow][newCol] = 1 - newBoard[newRow][newCol];
    return newBoard;
  });
}, []);
```

#### useEffect
```typescript
// ✅ 明确依赖项
useEffect(() => {
  if (board.length > 0) {
    setIsSolved(isBoardSolved(board));
  }
}, [board]); // 明确依赖board

// ✅ 清理副作用
useEffect(() => {
  const worker = new Worker(matrixWorker);

  worker.postMessage({ type: 'init', board });

  return () => worker.terminate();
}, [board]);
```

#### 自定义Hook
```typescript
// ✅ 自定义Hook以'use'开头
export const useGameState = (initialBoard: number[][]) => {
  const [board, setBoard] = useState(initialBoard);
  const [isSolved, setIsSolved] = useState(false);

  const reset = useCallback(() => {
    setBoard(initialBoard);
    setIsSolved(false);
  }, [initialBoard]);

  return { board, isSolved, reset };
};
```

## 样式规范

### CSS类命名
```css
/* ✅ 使用BEM命名规范 */
.game-board { /* Block */ }
.game-board__cell { /* Element */ }
.game-board__cell--highlighted { /* Modifier */ }

/* ✅ 使用语义化的类名 */
.matrix-container { }
.matrix-cell { }
.matrix-cell--active { }
.matrix-cell--disabled { }
```

### Tailwind CSS使用
```typescript
// ✅ 优先使用Tailwind类
<div className="flex items-center justify-center p-4 bg-gray-100 rounded-lg">
  <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
    Click me
  </button>
</div>

// ✅ 复杂样式使用CSS模块
import styles from './GameBoard.module.css';

<div className={styles.gameBoard}>
  <div className={styles.matrixGrid}>
    {/* 内容 */}
  </div>
</div>
```

### 响应式设计
```css
/* ✅ 移动优先的响应式设计 */
.matrix-container {
  @apply w-full max-w-md;
  @apply md:max-w-lg;
  @apply lg:max-w-2xl;
}

.matrix-cell {
  @apply w-8 h-8;
  @apply sm:w-10 sm:h-10;
  @apply md:w-12 md:h-12;
}
```

## TypeScript规范

### 类型定义

#### 接口定义
```typescript
// ✅ 使用interface定义对象类型
interface GameState {
  board: number[][];
  moves: number;
  isSolved: boolean;
  startTime: number;
}

// ✅ 使用type定义联合类型或复杂类型
type MatrixValue = 0 | 1;
type CellPosition = [row: number, col: number];
type GameStatus = 'playing' | 'solved' | 'paused';
```

#### 泛型使用
```typescript
// ✅ 组件泛型
interface ListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T) => string;
}

function List<T>({ items, renderItem, keyExtractor }: ListProps<T>) {
  return (
    <div>
      {items.map((item, index) => (
        <div key={keyExtractor(item)}>
          {renderItem(item, index)}
        </div>
      ))}
    </div>
  );
}
```

### 类型安全

#### 避免any类型
```typescript
// ❌ 避免使用any
const processData = (data: any) => {
  return data.map((item: any) => item.name);
};

// ✅ 使用具体类型
interface DataItem {
  id: string;
  name: string;
  value: number;
}

const processData = (data: DataItem[]) => {
  return data.map(item => item.name);
};
```

#### 类型守卫
```typescript
// ✅ 使用类型守卫
function isMatrixCell(value: unknown): value is MatrixCell {
  return (
    typeof value === 'object' &&
    value !== null &&
    'row' in value &&
    'col' in value &&
    typeof (value as any).row === 'number' &&
    typeof (value as any).col === 'number'
  );
}

const handleCellClick = (cell: unknown) => {
  if (isMatrixCell(cell)) {
    // TypeScript知道cell是MatrixCell类型
    processCellClick(cell.row, cell.col);
  }
};
```

## 测试规范

### 组件测试

```typescript
// GameBoard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import GameBoard from './GameBoard';

describe('GameBoard', () => {
  it('renders correct number of cells', () => {
    const board = [
      [0, 1, 0],
      [1, 0, 1],
      [0, 1, 0]
    ];

    render(<GameBoard board={board} onCellClick={jest.fn()} />);

    const cells = screen.getAllByRole('button');
    expect(cells).toHaveLength(9);
  });

  it('calls onCellClick when cell is clicked', () => {
    const mockOnClick = jest.fn();
    const board = [[0]];

    render(<GameBoard board={board} onCellClick={mockOnClick} />);

    fireEvent.click(screen.getByRole('button'));
    expect(mockOnClick).toHaveBeenCalledWith(0, 0);
  });
});
```

### Hook测试

```typescript
// useGameState.test.ts
import { renderHook, act } from '@testing-library/react';
import { useGameState } from './useGameState';

describe('useGameState', () => {
  it('initializes with empty board', () => {
    const { result } = renderHook(() => useGameState([]));

    expect(result.current.board).toEqual([]);
    expect(result.current.isSolved).toBe(false);
  });

  it('updates board correctly', () => {
    const { result } = renderHook(() => useGameState([]));

    act(() => {
      result.current.updateCell(0, 0);
    });

    expect(result.current.board).toEqual([[1]]);
  });
});
```

## Git工作流

### 分支命名
```
main                    # 主分支
develop                 # 开发分支
feature/game-board      # 功能分支
feature/performance     # 功能分支
bugfix/click-issue      # 修复分支
hotfix/critical-bug     # 热修复分支
```

### 提交信息规范
```
<type>(<scope>): <subject>

<body>

<footer>
```

#### 类型
- `feat`: 新功能
- `fix`: 修复bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动

#### 示例
```
feat(game): add 1000fps performance mode

- Implement HyperPerformanceMatrixCell component
- Add Web Worker for matrix calculations
- Optimize rendering with GPU acceleration

Closes #123
```

## 部署规范

### 构建配置

#### 环境变量
```typescript
// .env.development
VITE_API_URL=http://localhost:3001
VITE_ENABLE_DEVTOOLS=true

// .env.production
VITE_API_URL=https://api.lightsmatrix.com
VITE_ENABLE_DEVTOOLS=false
```

#### 构建优化
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          framer: ['framer-motion'],
          utils: ['lodash-es']
        }
      }
    },
    minify: 'terser',
    sourcemap: true
  }
});
```

### 性能监控

```typescript
// 性能监控
const performanceMonitor = {
  trackRender: (componentName: string) => {
    const start = performance.now();

    return () => {
      const duration = performance.now() - start;
      console.log(`${componentName} render time: ${duration}ms`);

      // 发送到监控服务
      if (duration > 16) { // 超过60fps阈值
        analytics.track('slow-render', {
          component: componentName,
          duration
        });
      }
    };
  }
};

// 在组件中使用
const GameBoard = () => {
  useEffect(() => {
    return performanceMonitor.trackRender('GameBoard');
  });

  return <div>...</div>;
};
```

## 📝 检查清单

### 代码提交前检查
- [ ] 代码符合ESLint规范
- [ ] 所有TypeScript类型正确
- [ ] 没有console.log或debugger
- [ ] 组件有displayName（使用memo时）
- [ ] 事件监听器已清理
- [ ] 内存泄漏检查
- [ ] 性能测试通过

### 组件发布检查
- [ ] 组件文档完整
- [ ] Props接口文档
- [ ] 示例代码
- [ ] 单元测试覆盖率>80%
- [ ] 可访问性测试通过
- [ ] 响应式设计测试

### 性能优化检查
- [ ] 大列表虚拟化
- [ ] 图片懒加载
- [ ] GPU加速应用
- [ ] Bundle分析
- [ ] 首屏加载时间<3s
- [ ] 交互响应时间<100ms

---

本规范文档会持续更新，请定期查看最新版本。如有疑问或建议，请联系开发团队。