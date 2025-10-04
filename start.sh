#!/bin/bash

echo "🚀 启动光影矩阵项目"
echo "================================"

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js"
    exit 1
fi

# 检查npm是否安装
if ! command -v npm &> /dev/null; then
    echo "❌ npm 未安装，请先安装 npm"
    exit 1
fi

echo "📦 检查依赖..."

# 安装后端依赖
if [ ! -d "backend/node_modules" ]; then
    echo "📥 安装后端依赖..."
    cd backend && npm install && cd ..
fi

# 安装前端依赖
if [ ! -d "frontend/node_modules" ]; then
    echo "📥 安装前端依赖..."
    cd frontend && npm install && cd ..
fi

echo "🔧 启动服务器..."

# 启动后端服务器
echo "📍 启动后端服务器 (端口 8686)..."
cd backend
npm start &
BACKEND_PID=$!
cd ..

# 等待后端服务器启动
sleep 3

# 启动前端开发服务器
echo "🎨 启动前端开发服务器 (端口 3000)..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "🎉 光影矩阵项目启动成功！"
echo "================================"
echo "📍 前端地址: http://localhost:3000"
echo "📍 后端地址: http://127.0.0.1:8686"
echo ""
echo "💡 提示："
echo "   - 按 Ctrl+C 停止服务器"
echo "   - 查看 integration-test.sh 进行集成测试"
echo "   - 查看 docs/ 目录了解项目文档"
echo ""

# 等待用户中断
trap "echo ''; echo '🛑 正在停止服务器...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" INT

# 保持脚本运行
wait