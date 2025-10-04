#!/usr/bin/env node

const LightsSolver = require('./src/solver');

console.log('🧪 开始性能测试...\n');

// 测试不同大小的矩阵
const testSizes = [
  { rows: 10, cols: 10, name: '10×10' },
  { rows: 15, cols: 15, name: '15×15' },
  { rows: 20, cols: 20, name: '20×20' },
  { rows: 25, cols: 25, name: '25×25' },
  { rows: 30, cols: 30, name: '30×30' }
];

// 生成随机棋盘
function generateRandomBoard(rows, cols) {
  const board = [];
  for (let i = 0; i < rows; i++) {
    const row = [];
    for (let j = 0; j < cols; j++) {
      row.push(Math.random() > 0.5 ? 1 : 0);
    }
    board.push(row);
  }
  return board;
}

async function runPerformanceTest() {
  const results = [];

  for (const size of testSizes) {
    console.log(`📊 测试 ${size.name} 矩阵...`);

    // 生成测试棋盘
    const board = generateRandomBoard(size.rows, size.cols);

    // 执行求解
    const startTime = process.hrtime.bigint();
    const result = LightsSolver.solve(board);
    const endTime = process.hrtime.bigint();

    const solvingTime = Number(endTime - startTime) / 1000000; // 转换为毫秒

    if (result.status === 'solvable') {
      results.push({
        size: size.name,
        matrixSize: size.rows * size.cols,
        solvingTime: solvingTime,
        solutionSteps: result.solution.length,
        hasSolution: true
      });

      console.log(`  ✅ 求解成功: ${solvingTime.toFixed(2)}ms`);
      console.log(`  📈 解法步数: ${result.solution.length}`);
    } else if (result.status === 'error') {
      results.push({
        size: size.name,
        matrixSize: size.rows * size.cols,
        solvingTime: solvingTime,
        solutionSteps: 0,
        hasSolution: false,
        error: result.message
      });

      console.log(`  ❌ ${result.message}`);
    } else {
      results.push({
        size: size.name,
        matrixSize: size.rows * size.cols,
        solvingTime: solvingTime,
        solutionSteps: 0,
        hasSolution: false
      });

      console.log(`  ⚠️  无解: ${solvingTime.toFixed(2)}ms`);
    }

    console.log('');
  }

  // 输出性能报告
  console.log('📋 性能测试报告:');
  console.log('=' .repeat(60));
  console.log('矩阵大小 | 总格子数 | 求解时间(ms) | 解法步数 | 状态');
  console.log('-'.repeat(60));

  results.forEach(result => {
    const status = result.hasSolution ? '✅ 可解' : result.error ? '❌ 超限' : '⚠️ 无解';
    const time = result.solvingTime.toFixed(2);
    const steps = (result.solutionSteps || '-').toString();

    console.log(`${result.size.padEnd(8)} | ${(result.matrixSize + '').padEnd(8)} | ${time.padEnd(10)} | ${steps.padEnd(8)} | ${status}`);
  });

  console.log('=' .repeat(60));

  // 分析性能
  const validResults = results.filter(r => r.hasSolution);
  if (validResults.length > 0) {
    const avgTimePerCell = validResults.reduce((sum, r) => sum + r.solvingTime / r.matrixSize, 0) / validResults.length;
    console.log(`📊 平均每格子求解时间: ${avgTimePerCell.toFixed(4)}ms`);

    const maxSolvableSize = Math.max(...validResults.map(r => r.matrixSize));
    console.log(`🎯 最大可求解矩阵: ${Math.sqrt(maxSolvableSize)}×${Math.sqrt(maxSolvableSize)} (${maxSolvableSize}格子)`);
  }

  console.log('\n🎉 性能测试完成!');
}

// 运行测试
runPerformanceTest().catch(console.error);