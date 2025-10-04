# Lights Matrix - Frontend

一个高性能的灯光矩阵游戏前端应用，支持普通模式和1000fps极致性能模式。

## 🚀 特性

### 核心功能
- **灯光矩阵游戏**: 经典的点击切换灯光状态游戏
- **多种游戏模式**: 普通模式、挑战模式、创作分享模式
- **智能求解器**: 自动求解算法，支持任意状态求解
- **性能监控**: 实时FPS监控和性能分析

### 性能优化
- **1000fps模式**: 极致性能渲染，支持大型矩阵
- **Web Worker**: 异步计算，避免阻塞主线程
- **GPU加速**: CSS transforms和硬件加速
- **虚拟化渲染**: 大矩阵的优化渲染策略

### 用户体验
- **主题切换**: 支持明暗主题
- **响应式设计**: 适配各种屏幕尺寸
- **流畅动画**: 使用Framer Motion实现流畅交互动画
- **本地存储**: 自动保存游戏进度

## 🛠️ 技术栈

- **框架**: React 18 + TypeScript
- **构建工具**: Vite
- **样式**: Tailwind CSS + CSS Modules
- **动画**: Framer Motion
- **状态管理**: React Hooks
- **性能优化**: Web Workers + GPU加速

## 📁 项目结构

```
src/
├── components/           # 组件目录
│   ├── game/            # 游戏核心组件
│   │   ├── GameBoard.tsx           # 普通模式棋盘
│   │   ├── HyperPerformanceGameBoard.tsx  # 1000fps模式棋盘
│   │   ├── HyperPerformanceMatrixCell.tsx  # 高性能矩阵单元格
│   │   └── GameBoard.css           # 棋盘样式
│   ├── ui/              # UI组件
│   │   ├── ChallengeMode.tsx       # 挑战模式
│   │   ├── CreationShareMode.tsx   # 创作分享模式
│   │   ├── PerformanceTest.tsx     # 性能测试
│   │   ├── QoLPanel.tsx            # 生活质量面板
│   │   └── ThemeSwitcher.tsx       # 主题切换器
│   └── layout/           # 布局组件
├── hooks/               # React Hooks
│   ├── game/            # 游戏相关hooks
│   │   ├── useGameState.tsx        # 游戏状态管理
│   │   ├── useHint.tsx             # 提示功能
│   │   └── useHyperPerformanceMatrix.tsx  # 高性能矩阵hook
│   └── utils/           # 工具hooks
│       ├── useLocalStorage.ts      # 本地存储
│       └── useTheme.ts             # 主题管理
├── utils/               # 工具函数
│   ├── game/            # 游戏工具
│   │   ├── board.ts                # 棋盘操作
│   │   └── export.ts               # 导出功能
│   └── core/            # 核心工具
│       └── api.ts                  # API接口
├── styles/              # 样式文件
│   ├── core/            # 核心样式
│   │   └── globals.css              # 全局样式
│   └── components/      # 组件样式
│       └── gpu-acceleration.css    # GPU加速样式
├── workers/             # Web Workers
│   └── matrixWorker.ts  # 矩阵计算Worker
├── types/               # TypeScript类型定义
│   └── index.ts         # 类型导出
├── App.tsx              # 主应用组件
└── main.tsx             # 应用入口
```

## 🚀 快速开始

### 环境要求
- Node.js >= 16
- npm 或 yarn

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

### 预览生产版本
```bash
npm run preview
```

## 🎮 游戏模式

### 普通模式
- 标准的灯光矩阵游戏体验
- 适合各种屏幕尺寸
- 流畅的动画效果

### 1000fps模式
- 极致性能渲染
- 支持超大矩阵(如50x50)
- 完全无动画，专注于性能
- Web Worker异步计算

### 挑战模式
- 预设的关卡挑战
- 难度递增
- 计时功能

### 创作分享模式
- 自定义矩阵布局
- 导出/导入功能
- 分享你的创作

## 🔧 性能优化

### GPU加速
- 使用CSS `transform: translateZ(0)` 强制GPU加速
- `will-change` 属性优化
- `contain` 属性隔离渲染

### Web Worker
- 异步矩阵计算
- 避免主线程阻塞
- 支持大型矩阵操作

### 渲染优化
- React.memo 避免不必要的重渲染
- useMemo 缓存计算结果
- useCallback 缓存函数引用

### 内存管理
- 及时清理事件监听器
- 优化大数组操作
- 避免内存泄漏

## 🎨 主题系统

支持明暗两种主题：
- **明亮主题**: 清新明亮的设计
- **暗黑主题**: 护眼的深色设计

主题切换会自动保存到本地存储。

## 📱 响应式设计

- **移动端**: 触摸优化，适配小屏幕
- **平板端**: 中等屏幕优化布局
- **桌面端**: 大屏幕完整功能

## 🔍 开发工具

### 代码质量
- ESLint: 代码规范检查
- TypeScript: 类型安全
- Prettier: 代码格式化

### 性能分析
- 内置FPS监控器
- React DevTools
- Chrome DevTools Performance

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📝 开发规范

详细的开发规范请参考 [DEVELOPMENT.md](./DEVELOPMENT.md)

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

- React 团队
- Vite 构建工具
- Framer Motion 动画库
- Tailwind CSS 样式框架