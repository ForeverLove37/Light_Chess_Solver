import { CellPosition } from '../types';

export const createEmptyBoard = (rows: number, cols: number): number[][] => {
  return Array(rows).fill(null).map(() => Array(cols).fill(0));
};

export const cloneBoard = (board: number[][]): number[][] => {
  return board.map(row => [...row]);
};

export const toggleCell = (board: number[][], row: number, col: number): number[][] => {
  const rows = board.length;
  const cols = board[0].length;

  // 性能优化：只修改受影响的行，而不是克隆整个棋盘
  const affectedRows = new Set<number>();
  affectedRows.add(row);

  // 计算受影响的格子
  const directions = [
    [-1, 0], // 上
    [1, 0],  // 下
    [0, -1], // 左
    [0, 1]   // 右
  ];

  directions.forEach(([dx, dy]) => {
    const newRow = row + dx;
    const newCol = col + dy;

    if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
      affectedRows.add(newRow);
    }
  });

  // 只克隆受影响的行
  const newBoard = board.map((row, index) =>
    affectedRows.has(index) ? [...row] : row
  );

  // 翻转点击的格子
  newBoard[row][col] = (newBoard[row][col] + 1) % 2;

  // 翻转上下左右相邻的格子
  directions.forEach(([dx, dy]) => {
    const newRow = row + dx;
    const newCol = col + dy;

    if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
      newBoard[newRow][newCol] = (newBoard[newRow][newCol] + 1) % 2;
    }
  });

  return newBoard;
};

export const getAffectedCells = (row: number, col: number, rows: number, cols: number): CellPosition[] => {
  const affected: CellPosition[] = [{ x: row, y: col }];
  
  const directions = [
    [-1, 0], // 上
    [1, 0],  // 下
    [0, -1], // 左
    [0, 1]   // 右
  ];

  directions.forEach(([dx, dy]) => {
    const newRow = row + dx;
    const newCol = col + dy;
    
    if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
      affected.push({ x: newRow, y: newCol });
    }
  });

  return affected;
};

export const isBoardSolved = (board: number[][]): boolean => {
  return board.every(row => row.every(cell => cell === 1));
};

export const boardToString = (board: number[][]): string => {
  return board.map(row => row.join('')).join('');
};

export const stringToBoard = (str: string, cols: number): number[][] => {
  const rows = Math.ceil(str.length / cols);
  const board = createEmptyBoard(rows, cols);
  
  for (let i = 0; i < str.length; i++) {
    const row = Math.floor(i / cols);
    const col = i % cols;
    board[row][col] = parseInt(str[i]);
  }
  
  return board;
};

export const calculateDifficulty = (board: number[][]): 'easy' | 'medium' | 'hard' => {
  const totalCells = board.length * board[0].length;
  const litCells = board.flat().filter(cell => cell === 1).length;
  const ratio = litCells / totalCells;
  
  if (ratio <= 0.3) return 'easy';
  if (ratio <= 0.6) return 'medium';
  return 'hard';
};