export interface CellPosition {
  x: number;
  y: number;
}

export interface BoardState {
  rows: number;
  cols: number;
  board: number[][];
}

export interface SolveResponse {
  status: 'solvable' | 'unsolvable';
  solution?: CellPosition[];
  message?: string;
  solveTimeMs?: string;
  timestamp?: string;
}

export interface VerifyResponse {
  status: 'valid';
  isValid: boolean;
  message: string;
}

export interface RandomBoardResponse {
  status: 'success';
  rows: number;
  cols: number;
  board: number[][];
  hasSolution: boolean;
  solutionSteps: number;
  note?: string;
}

export interface GameState {
  board: number[][];
  isPlaying: boolean;
  isSolved: boolean;
  moveCount: number;
  startTime?: number;
  endTime?: number;
}

export interface GameHistory {
  board: number[][];
  moves: CellPosition[];
  timestamp: number;
}