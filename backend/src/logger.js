const fs = require('fs');
const path = require('path');

class Logger {
  constructor() {
    this.logDir = path.join(__dirname, '..', 'logs');
    this.ensureLogDir();
    this.logFile = path.join(this.logDir, `matrix-solver-${this.getDateString()}.log`);
  }

  ensureLogDir() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  getDateString() {
    const now = new Date();
    return now.toISOString().split('T')[0]; // YYYY-MM-DD format
  }

  getTimestamp() {
    const now = new Date();
    return now.toISOString(); // ISO 8601 format
  }

  formatMessage(level, message, data = null) {
    const timestamp = this.getTimestamp();
    const logEntry = {
      timestamp,
      level,
      message,
      ...(data && { data })
    };
    return JSON.stringify(logEntry);
  }

  writeLog(level, message, data = null) {
    const timestamp = this.getTimestamp();
    const formattedMessage = this.formatMessage(level, message, data);

    // 写入文件
    fs.appendFileSync(this.logFile, formattedMessage + '\n');

    // 同时输出到控制台
    const consoleMessage = `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    switch(level) {
      case 'error':
        console.error(consoleMessage, data || '');
        break;
      case 'warn':
        console.warn(consoleMessage, data || '');
        break;
      case 'info':
        console.info(consoleMessage, data || '');
        break;
      default:
        console.log(consoleMessage, data || '');
    }
  }

  info(message, data = null) {
    this.writeLog('info', message, data);
  }

  warn(message, data = null) {
    this.writeLog('warn', message, data);
  }

  error(message, data = null) {
    this.writeLog('error', message, data);
  }

  debug(message, data = null) {
    this.writeLog('debug', message, data);
  }

  // 专门用于矩阵求解的日志方法
  logMatrixSolve(board, requestInfo = {}) {
    const rows = board.length;
    const cols = board[0].length;
    const totalCells = rows * cols;

    this.info('开始矩阵求解', {
      matrixSize: `${rows}×${cols}`,
      totalCells,
      ...requestInfo
    });

    // 记录棋盘统计信息
    const litCells = board.flat().filter(cell => cell === 1).length;
    const darkness = litCells / totalCells;

    this.debug('棋盘统计信息', {
      litCells,
      darkness: `${(darkness * 100).toFixed(1)}%`,
      boardPattern: this.analyzePattern(board)
    });
  }

  logAlgorithmChoice(algorithm, reason) {
    this.info('算法选择', {
      algorithm,
      reason
    });
  }

  logSolvingProgress(stage, details = {}) {
    this.debug('求解进度', {
      stage,
      ...details
    });
  }

  logSolvingResult(result, solvingTime) {
    this.info('求解完成', {
      status: result.status,
      solvingTime: `${solvingTime}ms`,
      solutionSteps: result.solution ? result.solution.length : 0,
      ...(result.status === 'error' && { error: result.message }),
      ...(result.status === 'unsolvable' && { reason: '无解配置' })
    });
  }

  analyzePattern(board) {
    const rows = board.length;
    const cols = board[0].length;

    // 简单的模式分析
    let patterns = [];

    // 检查是否为空棋盘
    if (board.flat().every(cell => cell === 0)) {
      patterns.push('empty');
    }

    // 检查是否为全亮棋盘
    if (board.flat().every(cell => cell === 1)) {
      patterns.push('full');
    }

    // 检查对称性
    const isSymmetric = board.every((row, i) =>
      row.every((cell, j) => cell === board[rows - 1 - i][cols - 1 - j])
    );
    if (isSymmetric) {
      patterns.push('symmetric');
    }

    return patterns.length > 0 ? patterns : 'random';
  }

  // 记录API请求详情
  logApiRequest(method, endpoint, body = null, ip = 'unknown') {
    this.info('API请求', {
      method,
      endpoint,
      ip,
      ...(body && { requestBody: body })
    });
  }

  // 记录API响应详情
  logApiResponse(method, endpoint, statusCode, responseTime, responseData = null) {
    this.info('API响应', {
      method,
      endpoint,
      statusCode,
      responseTime: `${responseTime}ms`,
      ...(responseData && { responseData })
    });
  }

  // 记录错误详情
  logError(error, context = {}) {
    this.error('发生错误', {
      message: error.message,
      stack: error.stack,
      ...context
    });
  }
}

// 创建全局日志实例
const logger = new Logger();

module.exports = logger;