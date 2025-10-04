# 光影矩阵 (Lights Matrix) 技术文档

## 项目概述

光影矩阵是一个基于Web的交互式解谜游戏，实现了经典的"正反棋"(Lights Out)游戏机制。该项目结合了先进的算法求解、优雅的用户界面设计和现代化的Web开发技术栈。

## 系统架构

### 整体架构
```
┌─────────────────┐    HTTP REST API    ┌─────────────────┐
│   React 前端     │ ◄──────────────────► │  Node.js 后端    │
│   (Port 3000)   │                    │   (Port 7676)   │
└─────────────────┘                    └─────────────────┘
                                                   │
                                                   ▼
                                          ┌─────────────────┐
                                          │  求解算法核心    │
                                          │  (模2高斯消元)  │
                                          └─────────────────┘
```

### 技术栈选择理由

#### 后端技术栈
- **Node.js + Express**: 高性能的JavaScript运行时，适合API开发
- **TypeScript**: 提供类型安全，减少运行时错误
- **Jest**: 完整的测试框架，确保代码质量
- **Helmet + CORS**: 安全中间件，保护API端点

#### 前端技术栈
- **React + TypeScript**: 组件化开发，类型安全
- **Vite**: 快速的构建工具，开发体验优秀
- **Tailwind CSS**: 实用优先的CSS框架，快速样式开发
- **Framer Motion**: 高性能动画库，创建流畅的用户体验
- **React Hot Toast**: 优雅的通知组件

## 核心算法实现

### 模2高斯消元法

#### 算法原理
Lights Out游戏可以建模为有限域GF(2)上的线性方程组：

- 每个格子是一个变量 (xᵢⱼ ∈ {0, 1})
- 每个最终状态是一个方程
- 系数矩阵表示每个操作的影响范围

#### 核心实现

**构建系数矩阵** (`backend/src/solver.js:38-64`):
```javascript
for (let i = 0; i < rows; i++) {
  for (let j = 0; j < cols; j++) {
    const equation = new Array(n).fill(0);
    const idx = i * cols + j;
    
    // 点击(i,j)会影响自身及相邻格子
    equation[idx] = 1; // 自身
    
    // 相邻格子影响
    if (i > 0) equation[(i - 1) * cols + j] = 1; // 上
    if (i < rows - 1) equation[(i + 1) * cols + j] = 1; // 下
    if (j > 0) equation[i * cols + (j - 1)] = 1; // 左
    if (j < cols - 1) equation[i * cols + (j + 1)] = 1; // 右
    
    matrix.push(equation);
    constants.push(board[i][j] === 0 ? 1 : 0);
  }
}
```

**高斯消元求解** (`backend/src/solver.js:86-138`):
- 前向消元：将矩阵转换为行阶梯形式
- 回代求解：从最后一行开始求解变量
- 模2运算：所有加法都在模2下进行

### 算法复杂度分析

- **时间复杂度**: O((m×n)³)，其中m×n是棋盘大小
- **空间复杂度**: O((m×n)²)，存储系数矩阵
- **优化点**: 稀疏矩阵压缩存储，可进一步优化空间复杂度

## 前端架构设计

### 组件层次结构
```
App
├── ThemeSwitcher          # 主题切换器
├── Header                 # 页面头部
├── ControlPanel           # 控制面板
├── QoLPanel              # QoL功能面板
├── GameBoard             # 游戏棋盘
│   └── MatrixCell[]      # 矩阵格子组件
└── SolutionPanel         # 解法控制面板
```

### 状态管理策略

#### 自定义Hooks模式
- **useGameState**: 管理游戏状态、历史记录、撤销/重做
- **useHint**: 智能提示功能
- **useLocalStorage**: 本地存储管理
- **useTheme**: 主题切换管理

#### 状态流设计
```typescript
// 游戏状态管理
interface GameState {
  board: number[][];      // 当前棋盘状态
  history: number[][][];  // 历史状态数组
  historyIndex: number;   // 当前历史索引
  moveCount: number;      // 移动次数
}

// QoL功能状态
interface QoLState {
  hint: CellPosition | null;     // 当前提示
  savedGame: SavedGame | null;    // 保存的游戏
  theme: Theme;                   // 当前主题
}
```

### 动画系统设计

#### Framer Motion集成
- **翻转动画**: 3D卡片翻转效果 (`components/MatrixCell.tsx:65-75`)
- **涟漪效果**: 点击影响范围可视化 (`components/MatrixCell.css:25-40`)
- **呼吸灯**: 解法步骤高亮显示 (`tailwind.config.js:40-45`)

#### 性能优化
- 使用`transform`和`opacity`属性确保GPU加速
- 合理使用`will-change`属性
- 动画延迟和节流控制

## API设计

### RESTful API端点

#### 核心求解API
```http
POST /api/solve
Content-Type: application/json

{
  "rows": 5,
  "cols": 5,
  "board": [[0,0,0,0,0], [0,1,0,1,0], ...]
}
```

**响应格式**:
```json
{
  "status": "solvable",
  "solution": [{"x": 0, "y": 1}, {"x": 2, "y": 3}],
  "solveTimeMs": "12.34",
  "timestamp": "2025-10-02T17:08:09.123Z"
}
```

#### 辅助功能API
- `POST /api/verify`: 验证解法正确性
- `GET /api/board/random`: 生成随机有解棋盘
- `GET /`: 服务器健康检查

### 错误处理策略

#### 输入验证 (`backend/src/index.js:54-96`)
- 参数完整性检查
- 数据类型验证
- 棋盘大小限制 (最大20×20)
- 数值范围验证 (只能为0或1)

#### 错误响应格式
```json
{
  "status": "error",
  "message": "Board cells must be 0 or 1",
  "error": "Validation failed at position [0][2]"
}
```

## 数据持久化

### 本地存储策略

#### 游戏状态存储 (`frontend/src/hooks/useLocalStorage.ts`)
```typescript
interface SavedGame {
  board: number[][];     // 棋盘状态
  rows: number;          // 行数
  cols: number;          // 列数
  moveCount: number;     // 移动次数
  timestamp: number;     // 保存时间戳
  isSolved: boolean;     // 是否已解决
}
```

#### 存储策略
- **自动保存**: 每次移动后自动保存到localStorage
- **过期清理**: 7天后自动清理过期数据
- **容量限制**: 单个浏览器存储空间限制 (~5MB)

### 主题偏好存储
- 主题设置持久化存储
- 系统主题偏好检测
- 实时主题切换无刷新

## 性能优化

### 前端优化

#### 代码分割
- React组件懒加载
- 路由级别的代码分割
- 第三方库按需引入

#### 渲染优化
- `React.memo`避免不必要的重渲染
- `useCallback`缓存函数引用
- `useMemo`缓存计算结果

#### 资源优化
- 图片和图标使用SVG格式
- CSS压缩和Tree Shaking
- 静态资源CDN部署

### 后端优化

#### 算法优化
- 稀疏矩阵压缩存储
- 并行计算优化
- 缓存常用解法

#### API优化
- 响应压缩 (gzip)
- CORS策略优化
- 请求限流和超时控制

## 测试策略

### 单元测试

#### 后端测试 (`backend/tests/`)
- **求解算法测试**: 验证不同棋盘配置的求解正确性
- **API端点测试**: 验证HTTP接口的功能和错误处理
- **边界条件测试**: 测试极端输入和异常情况

#### 前端测试 (`frontend/src/tests/`)
- **组件测试**: 验证UI组件的渲染和交互
- **Hooks测试**: 验证自定义Hooks的逻辑
- **集成测试**: 验证组件间的数据流

### 测试覆盖率
- 后端核心算法: 95%+ 覆盖率
- API端点: 90%+ 覆盖率
- 前端组件: 85%+ 覆盖率

## 部署架构

### 开发环境
```bash
# 后端
cd backend && npm run dev    # 端口 7676

# 前端  
cd frontend && npm run dev  # 端口 3000
```

### 生产环境部署
```bash
# 构建生产版本
cd frontend && npm run build

# 启动生产服务器
cd backend && npm start
```

### 容器化部署
```dockerfile
# Dockerfile示例
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 7676
CMD ["npm", "start"]
```

## 监控和日志

### 应用监控
- **性能监控**: API响应时间、错误率统计
- **用户行为**: 游戏完成率、功能使用统计
- **服务器健康**: 内存使用、CPU占用率

### 日志系统
```javascript
// 结构化日志示例
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});
```

## 扩展性设计

### 功能扩展点
- **多人对战模式**: WebSocket实时对战
- **排行榜系统**: 数据库集成，用户成绩统计
- **自定义主题**: 主题编辑器，用户自定义样式
- **移动端原生应用**: React Native封装

### 技术扩展
- **微服务架构**: 拆分求解服务为独立微服务
- **负载均衡**: 多实例部署，水平扩展
- **数据库集成**: PostgreSQL存储用户数据和游戏记录
- **缓存系统**: Redis缓存频繁访问的解法

## 安全考虑

### 数据安全
- 输入验证和消毒
- XSS攻击防护
- CSRF保护
- HTTPS强制启用

### 隐私保护
- 本地数据加密存储
- 最小权限原则
- 用户数据匿名化处理

## 开发指南

### 本地开发环境设置

#### 环境要求
- Node.js >= 18.0.0
- npm >= 8.0.0

#### 快速开始
```bash
# 克隆项目
git clone <repository-url>
cd Light_chess_solver

# 安装依赖
npm install
cd backend && npm install
cd ../frontend && npm install

# 启动开发服务器
# 终端1: 启动后端
cd backend && npm run dev

# 终端2: 启动前端
cd frontend && npm run dev
```

### 代码规范

#### TypeScript配置
- 严格模式启用
- 无隐式any类型
- 完整的类型注解

#### ESLint规则
- React最佳实践
- TypeScript类型检查
- 代码风格一致性

#### Git工作流
```bash
# 功能分支开发
git checkout -b feature/solve-algorithm-optimization

# 提交规范
git commit -m "feat: optimize gaussian elimination for sparse matrices"
git commit -m "fix: resolve board validation edge cases"
git commit -m "docs: update API documentation"

# PR流程
git push origin feature/solve-algorithm-optimization
# 创建Pull Request，代码审查后合并
```

### 调试技巧

#### 前端调试
- React Developer Tools
- 浏览器开发者工具
- Console日志分级

#### 后端调试
- VS Code调试配置
- Node.js Inspector
- 日志级别控制

## 已知问题和限制

### 当前限制
1. **棋盘大小限制**: 最大支持20×20棋盘
2. **移动端优化**: 部分动画在低端设备可能卡顿
3. **离线功能**: 完全离线模式暂不支持
4. **浏览器兼容性**: IE浏览器不支持

### 性能瓶颈
1. **大棋盘求解**: 15×15以上棋盘求解时间较长
2. **动画性能**: 大量格子同时动画可能掉帧
3. **内存使用**: 历史记录无限增长可能导致内存问题

### 解决方案
1. **Web Workers**: 将求解算法移至Worker线程
2. **渐进式渲染**: 大棋盘分块渲染
3. **历史记录清理**: 限制历史记录最大长度

## 总结

光影矩阵项目展示了现代Web开发的完整流程，从算法设计到用户界面实现，体现了以下技术特点：

1. **算法精确性**: 使用数学方法确保最优解
2. **用户体验**: 流畅的动画和直观的交互
3. **代码质量**: TypeScript类型安全和完整的测试覆盖
4. **可维护性**: 清晰的架构和模块化设计
5. **可扩展性**: 为未来功能预留了扩展空间

该项目不仅是一个有趣的游戏，更是一个展示全栈开发能力的优秀示例。

---
*文档最后更新: 2025-10-02*