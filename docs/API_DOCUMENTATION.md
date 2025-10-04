# 光影矩阵 API 文档

## 概述

光影矩阵后端API提供RESTful接口，支持游戏求解、验证和随机棋盘生成等功能。所有API都返回JSON格式的响应。

## 基础信息

- **Base URL**: `http://127.0.0.1:7676/api`
- **Content-Type**: `application/json`
- **字符编码**: `UTF-8`
- **响应格式**: JSON

## 认证

当前版本的所有API都是公开的，无需认证。

## 端点详情

### 1. 服务器健康检查

检查API服务器是否正常运行。

**端点**: `GET /`

**请求示例**:
```http
GET / HTTP/1.1
Host: 127.0.0.1:7676
```

**成功响应** (200 OK):
```json
{
  "message": "光影矩阵 (Lights Matrix) API Server",
  "version": "1.0.0",
  "status": "running"
}
```

### 2. 求解棋盘

对给定的棋盘状态进行求解，返回最优解法步骤。

**端点**: `POST /api/solve`

**请求参数**:
```json
{
  "rows": 5,
  "cols": 5,
  "board": [
    [0, 0, 0, 0, 0],
    [0, 1, 0, 1, 0],
    [0, 0, 0, 0, 0],
    [0, 1, 0, 1, 0],
    [0, 0, 0, 0, 0]
  ]
}
```

**参数说明**:
- `rows` (integer, required): 棋盘行数 (1-20)
- `cols` (integer, required): 棋盘列数 (1-20)
- `board` (array, required): 二维数组，0表示未点亮，1表示已点亮

**成功响应** (200 OK):
```json
{
  "status": "solvable",
  "solution": [
    {"x": 1, "y": 1},
    {"x": 1, "y": 3},
    {"x": 3, "y": 1},
    {"x": 3, "y": 3}
  ],
  "solveTimeMs": "12.34",
  "timestamp": "2025-10-02T17:08:09.123Z"
}
```

**无解响应** (200 OK):
```json
{
  "status": "unsolvable",
  "message": "This configuration has no solution.",
  "solveTimeMs": "8.76",
  "timestamp": "2025-10-02T17:08:09.123Z"
}
```

**错误响应** (400 Bad Request):
```json
{
  "status": "error",
  "message": "Board cells must be 0 or 1, found 2 at position [0][2]"
}
```

### 3. 验证解法

验证给定的解法是否能正确解决棋盘。

**端点**: `POST /api/verify`

**请求参数**:
```json
{
  "rows": 3,
  "cols": 3,
  "board": [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0]
  ],
  "solution": [
    {"x": 0, "y": 0},
    {"x": 0, "y": 1},
    {"x": 1, "y": 0}
  ]
}
```

**成功响应** (200 OK):
```json
{
  "status": "valid",
  "isValid": true,
  "message": "Solution is correct"
}
```

**验证失败响应** (200 OK):
```json
{
  "status": "valid",
  "isValid": false,
  "message": "Solution is incorrect"
}
```

### 4. 生成随机棋盘

生成一个有解的随机棋盘。

**端点**: `GET /api/board/random`

**查询参数**:
- `rows` (integer, optional): 行数，默认5 (1-20)
- `cols` (integer, optional): 列数，默认5 (1-20)
- `difficulty` (string, optional): 难度级别，可选值：'easy', 'medium', 'hard'，默认'medium'

**请求示例**:
```http
GET /api/board/random?rows=4&cols=6&difficulty=medium HTTP/1.1
Host: 127.0.0.1:7676
```

**成功响应** (200 OK):
```json
{
  "status": "success",
  "rows": 4,
  "cols": 6,
  "board": [
    [0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0],
    [0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0]
  ],
  "hasSolution": true,
  "solutionSteps": 8
}
```

**回退响应** (当生成的棋盘无解时):
```json
{
  "status": "success",
  "rows": 4,
  "cols": 6,
  "board": [
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0]
  ],
  "hasSolution": true,
  "solutionSteps": 24,
  "note": "Generated board was unsolvable, returned empty board instead"
}
```

**错误响应** (400 Bad Request):
```json
{
  "status": "error",
  "message": "Invalid board size"
}
```

## 错误处理

### 错误响应格式

所有错误响应都遵循以下格式：

```json
{
  "status": "error",
  "message": "错误描述信息",
  "error": "详细错误信息 (仅在开发环境显示)"
}
```

### 常见错误码

| HTTP状态码 | 错误类型 | 说明 |
|-----------|----------|------|
| 400 | Bad Request | 请求参数错误或格式不正确 |
| 404 | Not Found | 端点不存在 |
| 500 | Internal Server Error | 服务器内部错误 |
| 503 | Service Unavailable | 服务器过载或维护 |

### 错误类型

#### 参数验证错误
```json
{
  "status": "error",
  "message": "Missing required parameters: rows, cols, board"
}
```

#### 数据格式错误
```json
{
  "status": "error",
  "message": "Board must be an array with correct number of rows"
}
```

#### 数值范围错误
```json
{
  "status": "error",
  "message": "Rows and cols must be positive integers"
}
```

#### 棋盘大小超限
```json
{
  "status": "error",
  "message": "Board size too large (maximum 20x20)"
}
```

## 性能限制

### 请求限制
- **最大棋盘大小**: 20×20
- **单次请求超时**: 30秒
- **并发请求限制**: 无特定限制

### 性能基准

#### 求解时间基准 (基于中等配置服务器)
| 棋盘大小 | 平均求解时间 | 最大求解时间 |
|----------|-------------|-------------|
| 3×3 | < 5ms | < 10ms |
| 5×5 | < 20ms | < 50ms |
| 10×10 | < 200ms | < 500ms |
| 15×15 | < 1s | < 3s |
| 20×20 | < 5s | < 15s |

#### 内存使用
- **20×20棋盘**: 约 50MB 峰值内存
- **10×10棋盘**: 约 10MB 峰值内存
- **5×5棋盘**: 约 2MB 峰值内存

## 使用示例

### JavaScript/TypeScript

```typescript
import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:7676/api';

// 求解棋盘
async function solveBoard(board: number[][], rows: number, cols: number) {
  try {
    const response = await axios.post(`${API_BASE_URL}/solve`, {
      rows,
      cols,
      board
    });
    
    if (response.data.status === 'solvable') {
      console.log(`找到解法，需要 ${response.data.solution.length} 步`);
      return response.data.solution;
    } else {
      console.log('此棋盘无解');
      return null;
    }
  } catch (error) {
    console.error('求解失败:', error);
    return null;
  }
}

// 生成随机棋盘
async function getRandomBoard(rows: number = 5, cols: number = 5) {
  try {
    const response = await axios.get(`${API_BASE_URL}/board/random`, {
      params: { rows, cols }
    });
    
    return response.data.board;
  } catch (error) {
    console.error('生成随机棋盘失败:', error);
    return null;
  }
}
```

### Python

```python
import requests
import json

API_BASE_URL = 'http://127.0.0.1:7676/api'

def solve_board(board, rows, cols):
    """求解棋盘"""
    try:
        response = requests.post(f"{API_BASE_URL}/solve", json={
            'rows': rows,
            'cols': cols,
            'board': board
        })
        
        result = response.json()
        if result['status'] == 'solvable':
            print(f"找到解法，需要 {len(result['solution'])} 步")
            return result['solution']
        else:
            print("此棋盘无解")
            return None
    except Exception as e:
        print(f"求解失败: {e}")
        return None

def get_random_board(rows=5, cols=5):
    """生成随机棋盘"""
    try:
        response = requests.get(f"{API_BASE_URL}/board/random", params={
            'rows': rows,
            'cols': cols
        })
        
        result = response.json()
        return result['board']
    except Exception as e:
        print(f"生成随机棋盘失败: {e}")
        return None

# 使用示例
if __name__ == "__main__":
    # 生成5x5随机棋盘
    board = get_random_board(5, 5)
    
    if board:
        print("生成的棋盘:")
        for row in board:
            print(row)
        
        # 求解棋盘
        solution = solve_board(board, 5, 5)
        if solution:
            print("解法步骤:", solution)
```

### cURL

```bash
# 求解棋盘
curl -X POST http://127.0.0.1:7676/api/solve \
  -H "Content-Type: application/json" \
  -d '{
    "rows": 3,
    "cols": 3,
    "board": [
      [0, 0, 0],
      [0, 1, 0],
      [0, 0, 0]
    ]
  }'

# 生成随机棋盘
curl "http://127.0.0.1:7676/api/board/random?rows=4&cols=4"

# 验证解法
curl -X POST http://127.0.0.1:7676/api/verify \
  -H "Content-Type: application/json" \
  -d '{
    "rows": 3,
    "cols": 3,
    "board": [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0]
    ],
    "solution": [
      {"x": 0, "y": 0},
      {"x": 1, "y": 1},
      {"x": 2, "y": 2}
    ]
  }'
```

## 监控和日志

### 请求日志

服务器会记录所有API请求：

```
2025-10-02T17:08:09.123Z - POST /api/solve
2025-10-02T17:08:09.456Z - GET /api/board/random?rows=5&cols=5
2025-10-02T17:08:10.789Z - POST /api/verify
```

### 性能监控

响应时间会记录在日志中：

```
2025-10-02T17:08:09.123Z - POST /api/solve - 12.34ms
2025-10-02T17:08:09.456Z - GET /api/board/random - 2.11ms
```

### 错误监控

错误会被记录并可以追踪：

```
2025-10-02T17:08:09.123Z - POST /api/solve - Error: Invalid board data
2025-10-02T17:08:09.456Z - GET /api/board/random - Error: Board size too large
```

## 测试

### 自动化测试

API包含完整的测试套件：

```bash
# 运行所有测试
cd backend && npm test

# 运行特定测试文件
cd backend && npm test -- solver.test.js

# 运行API测试
cd backend && npm test -- api.test.js
```

### 手动测试

#### 健康检查测试
```bash
curl -I http://127.0.0.1:7676/
```

#### 求解功能测试
```bash
# 测试有解棋盘
curl -X POST http://127.0.0.1:7676/api/solve \
  -H "Content-Type: application/json" \
  -d '{"rows": 3, "cols": 3, "board": [[0,0,0],[0,0,0],[0,0,0]]}'

# 测试无解棋盘
curl -X POST http://127.0.0.1:7676/api/solve \
  -H "Content-Type: application/json" \
  -d '{"rows": 3, "cols": 3, "board": [[1,1,0],[1,1,0],[0,0,0]]}'
```

#### 错误处理测试
```bash
# 测试无效参数
curl -X POST http://127.0.0.1:7676/api/solve \
  -H "Content-Type: application/json" \
  -d '{"rows": -1, "cols": 5, "board": [[0,0,0]]}'

# 测试缺失参数
curl -X POST http://127.0.0.1:7676/api/solve \
  -H "Content-Type: application/json" \
  -d '{"rows": 5}'
```

## 部署

### 开发环境

```bash
# 启动开发服务器
cd backend && npm run dev

# 服务器运行在 http://127.0.0.1:7676
```

### 生产环境

```bash
# 构建生产版本
cd backend && npm run build

# 启动生产服务器
cd backend && npm start
```

### Docker部署

```bash
# 构建镜像
docker build -t lights-matrix-api .

# 运行容器
docker run -p 7676:7676 lights-matrix-api
```

## 版本历史

### v1.0.0 (2025-10-02)
- 初始版本发布
- 支持基本求解功能
- 支持随机棋盘生成
- 支持解法验证

### 计划中的功能
- WebSocket支持实时对战
- 用户认证和会话管理
- 游戏统计和排行榜
- 批量求解接口

---

*API文档最后更新: 2025-10-02*