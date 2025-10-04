# 光影矩阵 (Lights Matrix Solver)

<div align="center">

![光影矩阵](https://img.shields.io/badge/🎮-光影矩阵-00d4ff?style=for-the-badge&logo=react&logoColor=white)

**一个优雅、有趣且富有启发性的互动数字艺术品**

[![技术栈](https://img.shields.io/badge/React-18+-blue?style=for-the-badge)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?style=for-the-badge)](https://www.typescriptlang.org/)
[![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge)](https://vitejs.dev/)

</div>

---

## 🎮 游戏特色

### 核心玩法
- **点击切换**: 点击格子切换自身及相邻格子的状态
- **目标明确**: 点亮所有格子即可获胜
- **智能求解**: 内置求解算法，提供最优解法
- **多种模式**: 自由模式、挑战模式、极速模式

### 高级功能
- **🎨 主题切换**: 深色、浅色、高对比度主题
- **⚡ 1000fps模式**: 极致性能体验，支持大型矩阵
- **🏆 挑战模式**: 预设挑战关卡，测试解谜技巧
- **↶ 撤销重做**: 完整的历史记录管理
- **🎯 自动播放**: 逐步演示解法过程

### 用户体验
- **响应式设计**: 完美适配各种屏幕尺寸
- **流畅动画**: 现代化的视觉效果和过渡
- **实时反馈**: Toast通知和状态指示器
- **智能提示**: 上下文相关的帮助信息

## 🚀 快速开始

### 环境要求
- Node.js 16+
- npm 或 yarn

### 安装和运行

1. **克隆项目**
```bash
git clone <repository-url>
cd Light_chess_solver
```

2. **安装依赖**
```bash
cd frontend
npm install
```

3. **启动开发服务器**
```bash
npm run dev
```

4. **访问应用**
打开浏览器访问 `http://localhost:3007`

## 🎯 游戏模式

### 自由模式
- 可自定义棋盘大小 (3×3 到 20×20)
- 支持随机棋盘生成
- 无时间限制，轻松享受游戏

### 挑战模式
- 预设的精心设计关卡
- 时间限制和提示系统
- 难度分级：简单、中等、困难、专家
- 实时计分和评级系统

### 1000fps极速模式
- Web Worker加速计算
- GPU渲染优化
- 支持超大型矩阵 (30×30+)
- 实时FPS监控显示

## 🛠️ 技术栈

### 前端
- **React 18** - 现代化UI框架
- **TypeScript** - 类型安全的JavaScript
- **Tailwind CSS** - 实用优先的CSS框架
- **Framer Motion** - 流畅的动画库
- **Vite** - 快速的构建工具

### 核心特性
- **Web Workers** - 后台计算优化
- **GPU加速** - CSS transforms和containment
- **响应式设计** - 移动端友好
- **主题系统** - 动态主题切换

## 📁 项目结构

```
frontend/
├── src/
│   ├── components/          # React组件
│   │   ├── game/           # 游戏相关组件
│   │   └── ui/             # UI组件
│   ├── hooks/              # React Hooks
│   │   ├── game/           # 游戏逻辑hooks
│   │   └── utils/          # 工具hooks
│   ├── utils/              # 工具函数
│   │   ├── game/           # 游戏工具
│   │   └── core/           # 核心工具
│   ├── styles/             # 样式文件
│   │   ├── core/           # 核心样式
│   │   └── components/     # 组件样式
│   └── types/              # TypeScript类型定义
├── docs/                   # 项目文档
│   └── history/            # 历史文档
└── README.md
```

## 🎨 界面预览

### 主界面
- 优雅的渐变背景
- 清晰的游戏状态显示
- 直观的控制面板
- 多模式选择界面

### 游戏界面
- 紧密排列的矩阵格子
- 实时状态更新
- 流畅的交互动画
- 智能提示系统

## 🔧 开发指南

### 代码规范
- 使用TypeScript进行类型检查
- 遵循React Hooks最佳实践
- 组件保持单一职责原则
- 优先考虑代码可读性

### 性能优化
- 使用React.memo减少重渲染
- Web Workers处理复杂计算
- CSS containment优化渲染
- GPU加速关键动画

### 测试策略
- 组件单元测试
- 集成测试覆盖
- 性能基准测试
- 跨浏览器兼容性测试

## 🚀 部署指南

### 构建生产版本
```bash
npm run build
```

### 预览生产版本
```bash
npm run preview
```

### 环境变量配置
```bash
# .env.production
VITE_API_URL=https://your-api-server.com
VITE_APP_TITLE=光影矩阵
```

## 📈 性能指标

### 基准性能
- **首次加载**: < 2秒
- **交互响应**: < 100ms
- **动画帧率**: 60fps (普通模式)
- **极速模式**: 1000fps+ (大型矩阵)

### 优化技术
- 代码分割和懒加载
- 资源预加载
- 缓存策略优化
- 图片和字体优化

## 🎮 功能特色

### 已实现功能 ✅
- 基础游戏玩法 (点击切换格子)
- 撤销/重做功能
- 求解算法集成
- 随机棋盘生成
- 主题切换 (深色/浅色/高对比度)
- 1000fps极速模式
- 挑战模式
- Toast通知系统
- 响应式设计

### 开发中功能 🚧
- 创作分享模式
- 高级性能测试
- 数据导出功能
- 更多QoL功能

## 🤝 贡献指南

### 开发流程
1. Fork项目
2. 创建功能分支
3. 提交更改
4. 创建Pull Request

### 提交规范
- 使用清晰的提交信息
- 遵循代码风格指南
- 添加必要的测试
- 更新相关文档

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 📚 历史文档

关于项目历史、bug修复和重构过程的详细信息，请查看 [docs/history](docs/history/) 目录。

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者和用户。

---

**享受游戏时光！** 🎮✨

<div align="center">

Made with ❤️ by the Light Matrix Team

</div>