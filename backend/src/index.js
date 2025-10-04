const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const LightsSolver = require('./solver');
const logger = require('./logger');

const app = express();
const PORT = process.env.PORT || 8686;

// 中间件
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 日志中间件
app.use((req, res, next) => {
  const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  logger.logApiRequest(req.method, req.path, req.body, clientIp);

  const startTime = Date.now();

  // 记录响应时间
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    logger.logApiResponse(req.method, req.path, res.statusCode, responseTime);
  });

  next();
});

// 根路径
app.get('/', (req, res) => {
  res.json({
    message: '光影矩阵 (Lights Matrix) API Server',
    version: '1.0.0',
    status: 'running'
  });
});

// 验证棋盘数据的中间件
const validateBoard = (req, res, next) => {
  try {
    let rows, cols, board;

    // 支持两种格式: {rows, cols, board} 或直接 [board]
    if (req.body.board && req.body.rows && req.body.cols) {
      // 格式1: {rows, cols, board}
      rows = req.body.rows;
      cols = req.body.cols;
      board = req.body.board;
    } else if (Array.isArray(req.body) && req.body.length > 0) {
      // 格式2: 直接的board数组
      board = req.body;
      rows = board.length;
      cols = board[0] ? board[0].length : 0;
    } else {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid board format. Expected {rows, cols, board} or board array'
      });
    }

    // 检查数据类型
    if (!Number.isInteger(rows) || !Number.isInteger(cols)) {
      return res.status(400).json({
        status: 'error',
        message: 'Rows and cols must be integers'
      });
    }

    if (rows <= 0 || cols <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Rows and cols must be positive integers'
      });
    }

    // 增加矩阵大小限制到30×30
    if (rows > 30 || cols > 30) {
      return res.status(400).json({
        status: 'error',
        message: 'Board size too large (maximum 30x30)'
      });
    }

    // 检查棋盘数据结构
    if (!Array.isArray(board) || board.length !== rows) {
      return res.status(400).json({
        status: 'error',
        message: 'Board must be an array with correct number of rows'
      });
    }

    for (let i = 0; i < board.length; i++) {
      if (!Array.isArray(board[i]) || board[i].length !== cols) {
        return res.status(400).json({
          status: 'error',
          message: `Row ${i} must be an array with ${cols} elements`
        });
      }

      for (let j = 0; j < board[i].length; j++) {
        if (board[i][j] !== 0 && board[i][j] !== 1) {
          return res.status(400).json({
            status: 'error',
            message: `Board cells must be 0 or 1, found ${board[i][j]} at position [${i}][${j}]`
          });
        }
      }
    }

    req.validatedBoard = board;
    next();
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Internal server error during validation'
    });
  }
};

// 主要的求解API端点
app.post('/api/solve', validateBoard, (req, res) => {
  try {
    logger.info('开始处理求解请求', {
      matrixSize: `${req.validatedBoard.length}×${req.validatedBoard[0].length}`,
      userAgent: req.headers['user-agent']
    });

    const startTime = process.hrtime.bigint();
    const result = LightsSolver.solve(req.validatedBoard);
    const endTime = process.hrtime.bigint();
    const solveTime = Number(endTime - startTime) / 1000000; // 转换为毫秒

    // 添加求解时间信息
    result.solveTimeMs = solveTime.toFixed(2);
    result.timestamp = new Date().toISOString();

    logger.info('求解请求处理完成', {
      status: result.status,
      solveTime: `${solveTime.toFixed(2)}ms`,
      solutionSteps: result.solution ? result.solution.length : 0
    });

    res.json(result);
  } catch (error) {
    logger.logError(error, {
      endpoint: '/api/solve',
      matrixSize: req.validatedBoard ? `${req.validatedBoard.length}×${req.validatedBoard[0]?.length}` : 'unknown'
    });

    res.status(500).json({
      status: 'error',
      message: 'Failed to solve the board',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// 验证解法的API端点
app.post('/api/verify', validateBoard, (req, res) => {
  try {
    const { solution } = req.body;
    
    if (!Array.isArray(solution)) {
      return res.status(400).json({
        status: 'error',
        message: 'Solution must be an array of coordinates'
      });
    }

    const isValid = LightsSolver.verifySolution(req.validatedBoard, solution);

    res.json({
      status: 'valid',
      isValid,
      message: isValid ? 'Solution is correct' : 'Solution is incorrect'
    });
  } catch (error) {
    console.error('Verify error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to verify the solution',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// 获取随机有解棋盘的API端点
app.get('/api/board/random', (req, res) => {
  try {
    const rows = parseInt(req.query.rows) || 5;
    const cols = parseInt(req.query.cols) || 5;
    const difficulty = req.query.difficulty || 'medium';

    if (rows <= 0 || cols <= 0 || rows > 20 || cols > 20) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid board size'
      });
    }

    // 生成一个随机棋盘
    const board = Array(rows).fill().map(() => 
      Array(cols).fill().map(() => Math.random() > 0.5 ? 1 : 0)
    );

    // 确保棋盘有解
    const result = LightsSolver.solve(board);
    
    if (result.status === 'solvable') {
      res.json({
        status: 'success',
        rows,
        cols,
        board,
        hasSolution: true,
        solutionSteps: result.solution.length
      });
    } else {
      // 如果无解，返回空棋盘
      const emptyBoard = Array(rows).fill().map(() => Array(cols).fill(0));
      const emptyResult = LightsSolver.solve(emptyBoard);
      
      res.json({
        status: 'success',
        rows,
        cols,
        board: emptyBoard,
        hasSolution: true,
        solutionSteps: emptyResult.solution.length,
        note: 'Generated board was unsolvable, returned empty board instead'
      });
    }
  } catch (error) {
    console.error('Random board error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate random board',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error'
  });
});

// 404处理
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Endpoint not found'
  });
});

// 只在非测试环境下启动服务器
if (require.main === module) {
  const server = app.listen(PORT, '127.0.0.1', () => {
    console.log(`🚀 光影矩阵 API Server 正在运行`);
    console.log(`📍 地址: http://127.0.0.1:${PORT}`);
    console.log(`🎮 游戏API: http://127.0.0.1:${PORT}/api/solve`);
    console.log(`🎲 随机棋盘: http://127.0.0.1:${PORT}/api/board/random`);
    console.log(`⏰ 启动时间: ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}`);
  });

  // 优雅关闭
  process.on('SIGTERM', () => {
    console.log('收到 SIGTERM 信号，正在关闭服务器...');
    server.close(() => {
      console.log('服务器已关闭');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('收到 SIGINT 信号，正在关闭服务器...');
    server.close(() => {
      console.log('服务器已关闭');
      process.exit(0);
    });
  });
}

module.exports = app;