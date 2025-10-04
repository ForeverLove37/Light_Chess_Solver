#!/usr/bin/env node

const LightsSolver = require('./src/solver');

console.log('🔍 调试25×25矩阵求解问题...\n');

// 测试多种不同的25×25矩阵配置
const testCases = [
  {
    name: '全空矩阵',
    generate: () => Array(25).fill().map(() => Array(25).fill(0))
  },
  {
    name: '全亮矩阵',
    generate: () => Array(25).fill().map(() => Array(25).fill(1))
  },
  {
    name: '随机矩阵1',
    generate: () => Array(25).fill().map(() => Array(25).fill().map(() => Math.random() > 0.5 ? 1 : 0))
  },
  {
    name: '对角矩阵',
    generate: () => {
      const board = Array(25).fill().map(() => Array(25).fill(0));
      for (let i = 0; i < 25; i++) {
        board[i][i] = 1;
      }
      return board;
    }
  },
  {
    name: '棋盘矩阵',
    generate: () => {
      const board = Array(25).fill().map(() => Array(25).fill(0));
      for (let i = 0; i < 25; i++) {
        for (let j = 0; j < 25; j++) {
          board[i][j] = (i + j) % 2;
        }
      }
      return board;
    }
  }
];

async function runDebugTests() {
  const results = [];

  for (const testCase of testCases) {
    console.log(`📊 测试: ${testCase.name}`);

    try {
      const board = testCase.generate();

      // 验证棋盘格式
      if (!board || board.length !== 25 || !board[0] || board[0].length !== 25) {
        console.error(`❌ 棋盘格式错误: ${board.length}×${board[0]?.length || 0}`);
        continue;
      }

      // 检查棋盘内容
      const invalidCells = board.flat().filter(cell => cell !== 0 && cell !== 1);
      if (invalidCells.length > 0) {
        console.error(`❌ 棋盘包含无效值: ${invalidCells.join(', ')}`);
        continue;
      }

      console.log(`✅ 棋盘格式正确: 25×25, 有效内容`);

      // 执行求解
      const startTime = process.hrtime.bigint();
      const result = LightsSolver.solve(board);
      const endTime = process.hrtime.bigint();

      const solvingTime = Number(endTime - startTime) / 1000000;

      console.log(`🎯 求解结果:`);
      console.log(`   状态: ${result.status}`);
      console.log(`   用时: ${solvingTime.toFixed(2)}ms`);

      if (result.status === 'solvable') {
        console.log(`   解法步数: ${result.solution.length}`);
        console.log(`   算法: ${result.algorithm || 'unknown'}`);

        // 验证解法
        try {
          const isValid = LightsSolver.verifySolution(board, result.solution);
          console.log(`   解法验证: ${isValid ? '✅ 正确' : '❌ 错误'}`);
        } catch (verifyError) {
          console.error(`   解法验证错误: ${verifyError.message}`);
        }
      } else if (result.status === 'error') {
        console.error(`   错误信息: ${result.message}`);
      } else {
        console.log(`   无解配置`);
      }

      results.push({
        name: testCase.name,
        status: result.status,
        solvingTime,
        solutionSteps: result.solution ? result.solution.length : 0,
        error: result.error || result.message
      });

    } catch (error) {
      console.error(`❌ 测试失败: ${error.message}`);
      console.error(`   堆栈: ${error.stack}`);

      results.push({
        name: testCase.name,
        status: 'error',
        error: error.message,
        stack: error.stack
      });
    }

    console.log('---');
  }

  // 输出总结
  console.log('\n📋 调试总结:');
  console.log('=' .repeat(60));
  console.log('测试名称        | 状态      | 求解时间 | 步数 | 错误');
  console.log('-'.repeat(60));

  results.forEach(result => {
    const name = result.name.padEnd(14);
    const status = result.status.padEnd(8);
    const time = result.solvingTime ? `${result.solvingTime.toFixed(2)}ms`.padEnd(8) : 'N/A     ';
    const steps = result.solutionSteps ? result.solutionSteps.toString().padEnd(4) : 'N/A ';
    const error = result.error ? result.error.substring(0, 30) : '';

    console.log(`${name} | ${status} | ${time} | ${steps} | ${error}`);
  });

  console.log('=' .repeat(60));

  // 分析结果
  const successful = results.filter(r => r.status === 'solvable');
  const failed = results.filter(r => r.status === 'error' || r.status === 'unsolvable');

  console.log(`\n📊 统计:`);
  console.log(`成功求解: ${successful.length}/${results.length}`);
  console.log(`失败: ${failed.length}/${results.length}`);

  if (successful.length > 0) {
    const avgTime = successful.reduce((sum, r) => sum + r.solvingTime, 0) / successful.length;
    console.log(`平均求解时间: ${avgTime.toFixed(2)}ms`);
  }

  if (failed.length > 0) {
    console.log(`\n❌ 失败原因:`);
    failed.forEach(r => {
      console.log(`- ${r.name}: ${r.error}`);
    });
  }

  console.log('\n🎯 建议检查日志文件: ./logs/matrix-solver-' + new Date().toISOString().split('T')[0] + '.log');
}

// 运行调试测试
runDebugTests().catch(console.error);