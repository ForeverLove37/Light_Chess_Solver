// Web Worker用于处理矩阵计算，避免阻塞主线程
interface MatrixOperation {
  type: 'toggle' | 'calculate';
  board: number[][];
  row?: number;
  col?: number;
}

interface MatrixResult {
  board: number[][];
  litCount: number;
  isSolved: boolean;
}

// 存储当前状态
let currentBoard: number[][] = [];

self.onmessage = (event: MessageEvent<MatrixOperation>) => {
  const { type, board, row, col } = event.data;

  // 更新当前状态
  if (board) {
    currentBoard = board.map(row => [...row]);
  }

  if (type === 'toggle' && row !== undefined && col !== undefined) {
    // 在Worker中执行矩阵切换操作
    const newBoard = toggleCellInWorker(currentBoard, row, col);
    const litCount = countLitCells(newBoard);
    const isSolved = checkIfSolved(newBoard);

    // 更新当前状态
    currentBoard = newBoard;

    const result: MatrixResult = {
      board: newBoard,
      litCount,
      isSolved
    };

    self.postMessage(result);
  } else if (type === 'calculate') {
    // 计算矩阵状态
    const litCount = countLitCells(currentBoard);
    const isSolved = checkIfSolved(currentBoard);

    const result: MatrixResult = {
      board: currentBoard,
      litCount,
      isSolved
    };

    self.postMessage(result);
  }
};

function toggleCellInWorker(board: number[][], row: number, col: number): number[][] {
  const newBoard = board.map(row => [...row]);
  const rows = newBoard.length;
  const cols = newBoard[0].length;

  // 切换点击的单元格
  newBoard[row][col] = 1 - newBoard[row][col];

  // 切换上下左右相邻的单元格
  const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];

  for (const [dr, dc] of directions) {
    const newRow = row + dr;
    const newCol = col + dc;

    if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
      newBoard[newRow][newCol] = 1 - newBoard[newRow][newCol];
    }
  }

  return newBoard;
}

function countLitCells(board: number[][]): number {
  let count = 0;
  for (const row of board) {
    for (const cell of row) {
      if (cell === 1) count++;
    }
  }
  return count;
}

function checkIfSolved(board: number[][]): boolean {
  for (const row of board) {
    for (const cell of row) {
      if (cell === 0) return false;
    }
  }
  return true;
}