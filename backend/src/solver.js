const logger = require('./logger');

class LightsSolver {
  /**
   * 解决 Lights Out 谜题的核心算法
   * 使用模2高斯消元法求解线性方程组
   * @param {number[][]} board - 棋盘状态矩阵 (0=关, 1=开)
   * @returns {Object} 求解结果 {status: string, solution: Array|Object}
   */
  static solve(board) {
    const rows = board.length;
    const cols = board[0].length;
    const n = rows * cols; // 总格子数

    // 记录矩阵求解开始
    logger.logMatrixSolve(board);

    // 性能限制检查
    if (n > 1000) { // 超过32x32的矩阵可能会很慢
      logger.error('矩阵尺寸超出限制', { totalCells: n, maxSize: 1000 });
      return {
        status: 'error',
        message: 'Matrix too large for practical solving. Maximum size is 32x32.',
        maxSize: 32
      };
    }

    const startTime = process.hrtime.bigint();

    // 构建系数矩阵和常数向量 - 优化内存分配
    const matrix = new Array(n);
    const constants = new Array(n);

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const equationIndex = i * cols + j;
        const equation = new Uint8Array(n); // 使用Uint8Array节省内存

        // 为每个位置创建一个方程
        const idx = equationIndex; // 当前位置的线性索引

        // 点击(i,j)会影响自身及上下左右相邻格子
        equation[idx] = 1; // 对自身的影响

        // 上方相邻格子
        if (i > 0) {
          equation[(i - 1) * cols + j] = 1;
        }

        // 下方相邻格子
        if (i < rows - 1) {
          equation[(i + 1) * cols + j] = 1;
        }

        // 左方相邻格子
        if (j > 0) {
          equation[i * cols + (j - 1)] = 1;
        }

        // 右方相邻格子
        if (j < cols - 1) {
          equation[i * cols + (j + 1)] = 1;
        }

        matrix[equationIndex] = Array.from(equation); // 转换为普通数组
        constants[equationIndex] = board[i][j] === 0 ? 1 : 0;
      }
    }

    console.log('矩阵构建完成，开始高斯消元');
    // 根据矩阵大小选择合适的算法
    let result;
    if (n <= 400) { // 20×20以下使用优化算法
      logger.logAlgorithmChoice('gaussianEliminationMod2Optimized', `小矩阵 (${n} ≤ 400)`);
      result = this.gaussianEliminationMod2Optimized(matrix, constants);
    } else { // 大矩阵使用稳定的标准算法
      logger.logAlgorithmChoice('gaussianEliminationMod2', `大矩阵 (${n} > 400)`);
      result = this.gaussianEliminationMod2(matrix, constants);
    }

    if (!result.hasSolution) {
      logger.logSolvingResult({ status: 'unsolvable', message: 'This configuration has no solution.' },
        Number(process.hrtime.bigint() - startTime) / 1000000);
      return {
        status: 'unsolvable',
        message: 'This configuration has no solution.'
      };
    }

    // 将解转换为坐标格式 - 优化循环
    const solution = [];
    for (let i = 0; i < result.solution.length; i++) {
      if (result.solution[i] === 1) {
        solution.push({
          x: Math.floor(i / cols),
          y: i % cols
        });
      }
    }

    const endTime = process.hrtime.bigint();
    const solvingTime = Number(endTime - startTime) / 1000000; // 转换为毫秒

    const finalResult = {
      status: 'solvable',
      solution: solution,
      solvingTime: solvingTime,
      matrixSize: `${rows}x${cols}`,
      algorithm: n <= 400 ? 'optimized' : 'standard'
    };

    logger.logSolvingResult(finalResult, solvingTime);

    return finalResult;
  }

  /**
   * 优化的模2高斯消元法 - 针对大矩阵性能优化
   * @param {number[][]} matrix - 系数矩阵
   * @param {number[]} constants - 常数向量
   * @returns {Object} {hasSolution: boolean, solution: Array|null}
   */
  static gaussianEliminationMod2Optimized(matrix, constants) {
    const rows = matrix.length;
    const cols = matrix[0].length;

    console.log(`开始高斯消元：${rows}行 x ${cols}列`);
    const startTime = process.hrtime.bigint();

    // 使用位向量优化 - 将每行转换为BigInt
    const augmented = new Array(rows);
    const rowMasks = new Array(rows); // 用于快速查找主元的掩码

    for (let i = 0; i < rows; i++) {
      let rowBits = 0n;
      for (let j = 0; j < cols; j++) {
        if (matrix[i][j] === 1) {
          rowBits |= 1n << BigInt(j);
        }
      }
      augmented[i] = {
        bits: rowBits,
        constant: constants[i],
        leadingBit: -1
      };
    }

    let rank = 0;

    // 前向消元 - 优化版本
    for (let col = 0; col < cols && rank < rows; col++) {
      const colMask = 1n << BigInt(col);

      // 寻找主元行
      let pivotRow = -1;
      for (let i = rank; i < rows; i++) {
        if (augmented[i].bits & colMask) {
          pivotRow = i;
          break;
        }
      }

      // 如果当前列没有1，跳过
      if (pivotRow === -1) {
        continue;
      }

      // 交换行使主元在正确位置
      if (pivotRow !== rank) {
        [augmented[rank], augmented[pivotRow]] = [augmented[pivotRow], augmented[rank]];
      }

      // 设置主元位置
      augmented[rank].leadingBit = col;

      // 使用当前行消去下面行的当前列 - 位运算优化
      const pivotBits = augmented[rank].bits;
      for (let i = rank + 1; i < rows; i++) {
        if (augmented[i].bits & colMask) {
          augmented[i].bits ^= pivotBits;
          augmented[i].constant ^= augmented[rank].constant;
        }
      }

      rank++;

      // 进度报告（每100列）
      if (col % 100 === 0) {
        console.log(`消元进度: ${col}/${cols} (${Math.round(col/cols*100)}%)`);
      }
    }

    console.log('前向消元完成，开始回代');

    // 检查是否有解
    for (let i = rank; i < rows; i++) {
      if (augmented[i].constant === 1) {
        return { hasSolution: false, solution: null };
      }
    }

    // 回代求解 - 优化版本
    const solution = new Uint8Array(cols);

    for (let i = rank - 1; i >= 0; i--) {
      const pivotCol = augmented[i].leadingBit;
      if (pivotCol === -1) continue;

      // 计算主元变量的值
      let sum = 0;
      const rowBits = augmented[i].bits;

      // 使用位运算快速计算
      for (let j = pivotCol + 1; j < cols; j++) {
        if ((rowBits >> BigInt(j)) & 1n) {
          sum ^= solution[j];
        }
      }

      solution[pivotCol] = augmented[i].constant ^ sum;
    }

    const endTime = process.hrtime.bigint();
    const solvingTime = Number(endTime - startTime) / 1000000;
    console.log(`高斯消元完成，用时: ${solvingTime.toFixed(2)}ms`);

    return {
      hasSolution: true,
      solution: Array.from(solution),
      rank: rank
    };
  }

  /**
   * 原始模2高斯消元法 - 保留用于兼容性
   * @param {number[][]} matrix - 系数矩阵
   * @param {number[]} constants - 常数向量
   * @returns {Object} {hasSolution: boolean, solution: Array|null}
   */
  static gaussianEliminationMod2(matrix, constants) {
    const rows = matrix.length;
    const cols = matrix[0].length;

    // 复制矩阵以避免修改原矩阵
    const augmented = matrix.map((row, i) => [...row, constants[i]]);

    let rank = 0;

    // 前向消元
    for (let col = 0; col < cols && rank < rows; col++) {
      // 寻找主元行
      let pivotRow = rank;
      for (let i = rank + 1; i < rows; i++) {
        if (augmented[i][col] === 1) {
          pivotRow = i;
          break;
        }
      }

      // 如果当前列没有1，跳过
      if (augmented[pivotRow][col] === 0) {
        continue;
      }

      // 交换行使主元在正确位置
      if (pivotRow !== rank) {
        [augmented[rank], augmented[pivotRow]] = [augmented[pivotRow], augmented[rank]];
      }

      // 使用当前行消去下面行的当前列
      for (let i = rank + 1; i < rows; i++) {
        if (augmented[i][col] === 1) {
          for (let j = col; j <= cols; j++) {
            augmented[i][j] = (augmented[i][j] + augmented[rank][j]) % 2;
          }
        }
      }

      rank++;
    }

    // 检查是否有解
    for (let i = rank; i < rows; i++) {
      if (augmented[i][cols] === 1) {
        return { hasSolution: false, solution: null };
      }
    }

    // 回代求解
    const solution = new Array(cols).fill(0);

    for (let i = rank - 1; i >= 0; i--) {
      // 找到主元列
      let pivotCol = -1;
      for (let j = 0; j < cols; j++) {
        if (augmented[i][j] === 1) {
          pivotCol = j;
          break;
        }
      }

      if (pivotCol === -1) continue;

      // 计算主元变量的值
      let sum = 0;
      for (let j = pivotCol + 1; j < cols; j++) {
        sum = (sum + augmented[i][j] * solution[j]) % 2;
      }

      solution[pivotCol] = (augmented[i][cols] + sum) % 2;
    }

    return { hasSolution: true, solution };
  }

  /**
   * 验证解的正确性
   * @param {number[][]} board - 初始棋盘状态
   * @param {Array} solution - 解法步骤
   * @returns {boolean} 解是否正确
   */
  static verifySolution(board, solution) {
    const rows = board.length;
    const cols = board[0].length;
    
    // 复制棋盘并应用解法
    const result = board.map(row => [...row]);
    
    for (const step of solution) {
      const { x, y } = step;
      
      // 翻转自身
      result[x][y] = (result[x][y] + 1) % 2;
      
      // 翻转上下左右相邻格子
      if (x > 0) result[x - 1][y] = (result[x - 1][y] + 1) % 2;
      if (x < rows - 1) result[x + 1][y] = (result[x + 1][y] + 1) % 2;
      if (y > 0) result[x][y - 1] = (result[x][y - 1] + 1) % 2;
      if (y < cols - 1) result[x][y + 1] = (result[x][y + 1] + 1) % 2;
    }
    
    // 检查是否所有格子都为1
    return result.every(row => row.every(cell => cell === 1));
  }
}

module.exports = LightsSolver;