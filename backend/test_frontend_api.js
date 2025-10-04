#!/usr/bin/env node

const http = require('http');

console.log('🔍 测试前端API通信...\n');

function makeRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(body);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (error) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testFrontendAPI() {
  const API_BASE_URL = 'http://127.0.0.1:8686/api';

  try {
    // 测试1: 25×25空矩阵
    console.log('📊 测试1: 25×25空矩阵');
    const emptyBoard = Array(25).fill().map(() => Array(25).fill(0));

    try {
      const response = await makeRequest({
        hostname: '127.0.0.1',
        port: 8686,
        path: '/api/solve',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(JSON.stringify(emptyBoard))
        }
      }, emptyBoard);

      console.log('✅ API响应成功');
      console.log('状态码:', response.status);
      console.log('响应数据:', {
        status: response.data.status,
        solutionSteps: response.data.solution ? response.data.solution.length : 0,
        solvingTime: response.data.solveTimeMs,
        matrixSize: response.data.matrixSize
      });

      if (response.data.status === 'solvable') {
        console.log('✅ 25×25矩阵求解成功！');
      } else {
        console.log('❌ 矩阵无解:', response.data.message);
      }

    } catch (error) {
      console.error('❌ API请求失败:', error.message);
    }

    console.log('---');

    // 测试2: 25×25随机矩阵
    console.log('📊 测试2: 25×25随机矩阵');
    const randomBoard = Array(25).fill().map(() =>
      Array(25).fill().map(() => Math.random() > 0.5 ? 1 : 0)
    );

    try {
      const response = await makeRequest({
        hostname: '127.0.0.1',
        port: 8686,
        path: '/api/solve',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(JSON.stringify(randomBoard))
        }
      }, randomBoard);

      console.log('✅ API响应成功');
      console.log('状态码:', response.status);
      console.log('响应数据:', {
        status: response.data.status,
        solutionSteps: response.data.solution ? response.data.solution.length : 0,
        solvingTime: response.data.solveTimeMs,
        matrixSize: response.data.matrixSize
      });

      if (response.data.status === 'solvable') {
        console.log('✅ 25×25随机矩阵求解成功！');
      } else {
        console.log('❌ 矩阵无解:', response.data.message);
      }

    } catch (error) {
      console.error('❌ API请求失败:', error.message);
    }

    console.log('---');

    // 测试3: 服务器健康检查
    console.log('📊 测试3: 服务器健康检查');
    try {
      const healthResponse = await makeRequest({
        hostname: '127.0.0.1',
        port: 8686,
        path: '/',
        method: 'GET'
      });

      console.log('✅ 服务器健康检查通过');
      console.log('服务器信息:', healthResponse.data);

    } catch (error) {
      console.error('❌ 服务器健康检查失败:', error.message);
    }

  } catch (error) {
    console.error('❌ 测试过程出错:', error.message);
  }
}

// 运行测试
testFrontendAPI().catch(console.error);