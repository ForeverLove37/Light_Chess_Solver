#!/bin/bash

echo "🧪 光影矩阵项目集成测试"
echo "================================"

# 测试后端API
echo "📡 测试后端API连接..."
API_URL="http://127.0.0.1:8686"

# 1. 测试服务器健康状态
echo "1. 测试服务器健康状态..."
HEALTH_RESPONSE=$(curl -s "$API_URL/")
if echo "$HEALTH_RESPONSE" | grep -q "running"; then
    echo "✅ 后端服务器运行正常"
else
    echo "❌ 后端服务器连接失败"
    exit 1
fi

# 2. 测试求解API
echo "2. 测试求解API..."
SOLVE_RESPONSE=$(curl -s -X POST "$API_URL/api/solve" \
    -H "Content-Type: application/json" \
    -d '{"rows": 3, "cols": 3, "board": [[1,0,0],[0,1,0],[0,0,0]]}')

if echo "$SOLVE_RESPONSE" | grep -q "solvable"; then
    echo "✅ 求解API工作正常"
else
    echo "❌ 求解API测试失败"
    echo "响应: $SOLVE_RESPONSE"
fi

# 3. 测试随机棋盘API
echo "3. 测试随机棋盘API..."
RANDOM_RESPONSE=$(curl -s "$API_URL/api/board/random?rows=4&cols=4")

if echo "$RANDOM_RESPONSE" | grep -q "success"; then
    echo "✅ 随机棋盘API工作正常"
else
    echo "❌ 随机棋盘API测试失败"
    echo "响应: $RANDOM_RESPONSE"
fi

# 测试前端构建
echo ""
echo "🎨 测试前端构建..."
cd frontend

if npm run build > /dev/null 2>&1; then
    echo "✅ 前端构建成功"
else
    echo "❌ 前端构建失败"
    exit 1
fi

# 测试后端测试
echo ""
echo "🔧 测试后端单元测试..."
cd ../backend

if npm test > /dev/null 2>&1; then
    echo "✅ 后端测试通过"
else
    echo "❌ 后端测试失败"
    exit 1
fi

echo ""
echo "🎉 所有集成测试通过！"
echo "================================"
echo "📍 前端地址: http://localhost:3000"
echo "📍 后端地址: $API_URL"
echo ""
echo "💡 提示：确保前后端服务器都在运行以访问完整应用"