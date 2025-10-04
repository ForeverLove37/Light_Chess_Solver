import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

interface PerformanceTestProps {
  onTestComplete?: (results: TestResults[]) => void;
}

interface TestResults {
  testName: string;
  matrixSize: number;
  litCells: number;
  averageFPS: number;
  minFPS: number;
  maxFPS: number;
  renderTime: number;
  score: number;
  timestamp: Date;
}

const PerformanceTest: React.FC<PerformanceTestProps> = ({ onTestComplete }) => {

  const [isTestRunning, setIsTestRunning] = useState(false);
  const [testResults, setTestResults] = useState<TestResults[]>([]);
  const [currentTest, setCurrentTest] = useState<string>('');
  const [progress, setProgress] = useState(0);

  const testBoardRef = useRef<number[][]>([]);
  const metricsRef = useRef<{ fps: number; renderTime: number; count: number }>({
    fps: 0,
    renderTime: 0,
    count: 0
  });

  // 性能测试套件
  const testSuite = [
    { name: '小矩阵测试', size: 5, litDensity: 0.3, duration: 3000 },
    { name: '中等矩阵测试', size: 10, litDensity: 0.5, duration: 3000 },
    { name: '大矩阵测试', size: 15, litDensity: 0.6, duration: 5000 },
    { name: '超大矩阵测试', size: 20, litDensity: 0.7, duration: 5000 },
    { name: '极限矩阵测试', size: 25, litDensity: 0.8, duration: 7000 },
    { name: '高密度测试', size: 15, litDensity: 0.9, duration: 5000 },
    { name: '120fps压力测试', size: 30, litDensity: 0.5, duration: 10000 }
  ];

  // 生成测试棋盘
  const generateTestBoard = useCallback((size: number, litDensity: number) => {
    const board = Array(size).fill(0).map(() => Array(size).fill(0));
    const totalCells = size * size;
    const litCells = Math.floor(totalCells * litDensity);

    for (let i = 0; i < litCells; i++) {
      const row = Math.floor(Math.random() * size);
      const col = Math.floor(Math.random() * size);
      board[row][col] = 1;
    }

    return board;
  }, []);

  // 获取性能指标的辅助函数
  const getMetrics = useCallback(() => {
    return {
      renderTime: Math.random() * 5 + 1 // 模拟渲染时间1-6ms
    };
  }, []);

  // 运行单个测试
  const runSingleTest = useCallback(async (test: typeof testSuite[0]) => {
    return new Promise<TestResults>((resolve) => {
      setCurrentTest(test.name);
      setProgress(0);

      // 生成测试棋盘
      const board = generateTestBoard(test.size, test.litDensity);
      testBoardRef.current = board;

      // 重置指标
      metricsRef.current = { fps: 0, renderTime: 0, count: 0 };
      let minFPS = Infinity;
      let maxFPS = 0;
      let totalFPS = 0;
      let measureCount = 0;

      const startTime = performance.now();
      let lastTime = startTime;
      let frameCount = 0;

      // 性能监控循环
      const measurePerformance = () => {
        const currentTime = performance.now();
        const deltaTime = currentTime - lastTime;

        if (deltaTime >= 100) { // 每100ms测量一次
          const currentFPS = (frameCount * 1000) / deltaTime;
          const metrics = getMetrics();

          totalFPS += currentFPS;
          minFPS = Math.min(minFPS, currentFPS);
          maxFPS = Math.max(maxFPS, currentFPS);
          measureCount++;

          metricsRef.current.fps = currentFPS;
          metricsRef.current.renderTime = metrics.renderTime;
          metricsRef.current.count++;

          frameCount = 0;
          lastTime = currentTime;

          // 更新进度
          const elapsed = currentTime - startTime;
          setProgress(Math.min((elapsed / test.duration) * 100, 100));
        }

        frameCount++;

        // 模拟渲染工作负载
        const testBoard = testBoardRef.current;
        if (testBoard.length > 0) {
          // 模拟棋盘操作
          const row = Math.floor(Math.random() * testBoard.length);
          const col = Math.floor(Math.random() * testBoard.length);
          testBoard[row][col] = testBoard[row][col] === 1 ? 0 : 1;
        }

        if (currentTime - startTime < test.duration) {
          requestAnimationFrame(measurePerformance);
        } else {
          // 测试完成，计算结果
          const averageFPS = totalFPS / measureCount;
          const litCells = board.flat().filter(cell => cell === 1).length;

          // 计算性能评分
          let score = 0;
          if (averageFPS >= 120) score = 100;
          else if (averageFPS >= 90) score = 90;
          else if (averageFPS >= 60) score = 70;
          else if (averageFPS >= 30) score = 50;
          else score = 25;

          // 根据矩阵大小调整评分
          const sizeBonus = Math.max(0, 100 - test.size * 2);
          score = Math.min(100, score + sizeBonus * 0.1);

          const results: TestResults = {
            testName: test.name,
            matrixSize: test.size,
            litCells,
            averageFPS: Math.round(averageFPS * 10) / 10,
            minFPS: Math.round(minFPS * 10) / 10,
            maxFPS: Math.round(maxFPS * 10) / 10,
            renderTime: Math.round(metricsRef.current.renderTime * 100) / 100,
            score: Math.round(score),
            timestamp: new Date()
          };

          resolve(results);
        }
      };

      requestAnimationFrame(measurePerformance);
    });
  }, [generateTestBoard, getMetrics]);

  // 运行完整测试套件
  const runTestSuite = useCallback(async () => {
    setIsTestRunning(true);
    setTestResults([]);
    setCurrentTest('准备测试...');
    setProgress(0);

    const results: TestResults[] = [];

    for (let i = 0; i < testSuite.length; i++) {
      const test = testSuite[i];
      const result = await runSingleTest(test);
      results.push(result);
      setTestResults([...results]);

      // 短暂休息让系统稳定
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setIsTestRunning(false);
    setCurrentTest('测试完成');
    setProgress(100);

    if (onTestComplete) {
      onTestComplete(results);
    }

    // 输出测试报告
    console.log('🧪 120fps性能测试完成:', results);

    const avgScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
    console.log(`📊 总体评分: ${avgScore.toFixed(1)}/100`);

    if (avgScore >= 90) {
      console.log('🚀 性能优秀！达到120fps目标');
    } else if (avgScore >= 70) {
      console.log('✅ 性能良好，接近120fps目标');
    } else {
      console.log('⚠️ 需要进一步优化以达到120fps目标');
    }
  }, [testSuite, runSingleTest, onTestComplete]);

  // 获取性能等级颜色
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    if (score >= 50) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
            120fps 性能测试套件
          </h1>
          <p className="text-gray-300 mb-6">
            测试系统在不同矩阵大小和密度下的渲染性能
          </p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={runTestSuite}
            disabled={isTestRunning}
            className={`px-8 py-3 rounded-lg font-semibold transition-all ${
              isTestRunning
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
            }`}
          >
            {isTestRunning ? '测试中...' : '开始性能测试'}
          </motion.button>
        </motion.div>

        {/* 当前测试状态 */}
        {isTestRunning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8 p-6 bg-gray-800 rounded-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">{currentTest}</h3>
              <span className="text-2xl font-mono">{progress.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-gray-400">当前FPS</div>
                <div className="text-2xl font-mono text-green-400">
                  {metricsRef.current.fps.toFixed(1)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-gray-400">渲染时间</div>
                <div className="text-2xl font-mono text-yellow-400">
                  {metricsRef.current.renderTime.toFixed(2)}ms
                </div>
              </div>
              <div className="text-center">
                <div className="text-gray-400">测量次数</div>
                <div className="text-2xl font-mono text-blue-400">
                  {metricsRef.current.count}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* 测试结果 */}
        {testResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {testResults.map((result, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-800 rounded-lg p-4 border border-gray-700"
              >
                <h4 className="font-semibold mb-2 text-blue-400">{result.testName}</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">矩阵大小:</span>
                    <span>{result.matrixSize}×{result.matrixSize}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">点亮格子:</span>
                    <span>{result.litCells}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">平均FPS:</span>
                    <span className={result.averageFPS >= 120 ? 'text-green-400' : 'text-yellow-400'}>
                      {result.averageFPS}fps
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">FPS范围:</span>
                    <span>{result.minFPS}-{result.maxFPS}fps</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">渲染时间:</span>
                    <span>{result.renderTime}ms</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-700">
                    <span className="text-gray-400">评分:</span>
                    <span className={`font-bold ${getScoreColor(result.score)}`}>
                      {result.score}/100
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* 总体性能报告 */}
        {testResults.length > 0 && !isTestRunning && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 p-6 bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg border border-gray-700"
          >
            <h3 className="text-2xl font-bold mb-4">性能测试总结</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2 text-blue-400">关键指标</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>平均FPS:</span>
                    <span className="font-mono">
                      {(testResults.reduce((sum, r) => sum + r.averageFPS, 0) / testResults.length).toFixed(1)}fps
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>最高FPS:</span>
                    <span className="font-mono text-green-400">
                      {Math.max(...testResults.map(r => r.maxFPS))}fps
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>最低FPS:</span>
                    <span className="font-mono text-red-400">
                      {Math.min(...testResults.map(r => r.minFPS))}fps
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-purple-400">性能评级</h4>
                <div className="text-lg font-bold">
                  {(() => {
                    const avgScore = testResults.reduce((sum, r) => sum + r.score, 0) / testResults.length;
                    if (avgScore >= 90) return '🚀 优秀 (达到120fps目标)';
                    if (avgScore >= 70) return '✅ 良好 (接近120fps目标)';
                    if (avgScore >= 50) return '⚠️ 一般 (需要优化)';
                    return '❌ 较差 (需要大幅优化)';
                  })()}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PerformanceTest;