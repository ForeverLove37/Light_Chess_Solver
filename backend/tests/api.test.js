const request = require('supertest');
const app = require('../src/index');

describe('API Endpoints', () => {
  describe('GET /', () => {
    test('应该返回服务器信息', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.body).toHaveProperty('message', '光影矩阵 (Lights Matrix) API Server');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('status', 'running');
    });
  });

  describe('POST /api/solve', () => {
    test('应该解决3x3棋盘', async () => {
      const boardData = {
        rows: 3,
        cols: 3,
        board: [
          [0, 0, 0],
          [0, 0, 0],
          [0, 0, 0]
        ]
      };

      const response = await request(app)
        .post('/api/solve')
        .send(boardData)
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(['solvable', 'unsolvable']).toContain(response.body.status);
      
      if (response.body.status === 'solvable') {
        expect(response.body).toHaveProperty('solution');
        expect(Array.isArray(response.body.solution)).toBe(true);
        expect(response.body).toHaveProperty('solveTimeMs');
        expect(response.body).toHaveProperty('timestamp');
      }
    });

    test('应该拒绝无效的棋盘数据', async () => {
      const invalidBoard = {
        rows: 3,
        cols: 3,
        board: [
          [0, 1, 2], // 无效值2
          [0, 0, 0],
          [0, 0, 0]
        ]
      };

      const response = await request(app)
        .post('/api/solve')
        .send(invalidBoard)
        .expect(400);

      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('message');
    });

    test('应该拒绝缺失的参数', async () => {
      const incompleteData = {
        rows: 3,
        // 缺少 cols 和 board
      };

      const response = await request(app)
        .post('/api/solve')
        .send(incompleteData)
        .expect(400);

      expect(response.body).toHaveProperty('status', 'error');
    });

    test('应该拒绝过大的棋盘', async () => {
      const largeBoard = {
        rows: 25, // 超过限制
        cols: 25,
        board: Array(25).fill().map(() => Array(25).fill(0))
      };

      const response = await request(app)
        .post('/api/solve')
        .send(largeBoard)
        .expect(400);

      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body.message).toContain('too large');
    });
  });

  describe('POST /api/verify', () => {
    test('应该验证正确的解', async () => {
      const boardData = {
        rows: 2,
        cols: 2,
        board: [
          [0, 0],
          [0, 0]
        ],
        solution: [
          { x: 0, y: 0 },
          { x: 0, y: 1 },
          { x: 1, y: 0 },
          { x: 1, y: 1 }
        ]
      };

      const response = await request(app)
        .post('/api/verify')
        .send(boardData)
        .expect(200);

      expect(response.body).toHaveProperty('status', 'valid');
      expect(response.body).toHaveProperty('isValid', true);
    });

    test('应该检测错误的解', async () => {
      const boardData = {
        rows: 2,
        cols: 2,
        board: [
          [0, 1],
          [1, 1]
        ],
        solution: [] // 空解法
      };

      const response = await request(app)
        .post('/api/verify')
        .send(boardData)
        .expect(200);

      expect(response.body).toHaveProperty('status', 'valid');
      expect(response.body).toHaveProperty('isValid', false);
    });
  });

  describe('GET /api/board/random', () => {
    test('应该生成随机棋盘', async () => {
      const response = await request(app)
        .get('/api/board/random')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('rows');
      expect(response.body).toHaveProperty('cols');
      expect(response.body).toHaveProperty('board');
      expect(response.body).toHaveProperty('hasSolution', true);
    });

    test('应该支持自定义棋盘大小', async () => {
      const response = await request(app)
        .get('/api/board/random?rows=4&cols=6')
        .expect(200);

      expect(response.body.rows).toBe(4);
      expect(response.body.cols).toBe(6);
      expect(response.body.board).toHaveLength(4);
      response.body.board.forEach(row => {
        expect(row).toHaveLength(6);
      });
    });
  });

  describe('404处理', () => {
    test('应该返回404对于未知端点', async () => {
      const response = await request(app)
        .get('/unknown/endpoint')
        .expect(404);

      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('message', 'Endpoint not found');
    });
  });
});