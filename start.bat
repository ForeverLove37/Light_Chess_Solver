@echo off
chcp 65001 >nul
title 光影矩阵项目启动器

echo 🚀 启动光影矩阵项目
echo ================================

REM 检查Node.js是否安装
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js 未安装，请先安装 Node.js
    pause
    exit /b 1
)

REM 检查npm是否安装
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm 未安装，请先安装 npm
    pause
    exit /b 1
)

echo 📦 检查依赖...

REM 安装后端依赖
if not exist "backend\node_modules" (
    echo 📥 安装后端依赖...
    cd backend && npm install && cd ..
)

REM 安装前端依赖
if not exist "frontend\node_modules" (
    echo 📥 安装前端依赖...
    cd frontend && npm install && cd ..
)

echo 🔧 启动服务器...

REM 启动后端服务器
echo 📍 启动后端服务器 (端口 8686)...
cd backend
start "光影矩阵后端" cmd /k "npm start"
cd ..

REM 等待后端服务器启动
timeout /t 3 /nobreak >nul

REM 启动前端开发服务器
echo 🎨 启动前端开发服务器 (端口 3000)...
cd frontend
start "光影矩阵前端" cmd /k "npm run dev"
cd ..

echo.
echo 🎉 光影矩阵项目启动成功！
echo ================================
echo 📍 前端地址: http://localhost:3000
echo 📍 后端地址: http://127.0.0.1:8686
echo.
echo 💡 提示：
echo    - 关闭此窗口不会停止服务器
echo    - 查看 integration-test.sh 进行集成测试
echo    - 查看 docs/ 目录了解项目文档
echo.
pause