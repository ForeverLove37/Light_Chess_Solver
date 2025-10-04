import { CellPosition, SolveResponse } from '../types';

export interface ExportData {
  board: number[][];
  solution: CellPosition[];
  solveTimeMs: string;
  timestamp: string;
  boardSize: { rows: number; cols: number };
}

export class ExportManager {
  /**
   * 导出解法为CSV格式
   */
  static exportToCSV(data: ExportData, filename?: string): void {
    const csvContent = this.generateCSV(data);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename || `matrix_solution_${Date.now()}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  }

  /**
   * 生成CSV内容
   */
  private static generateCSV(data: ExportData): string {
    const headers = ['Step', 'Row', 'Column', 'Description', 'Board State'];
    const rows: string[][] = [headers];

    // 添加解法步骤
    data.solution.forEach((step, index) => {
      const description = `Step ${index + 1}: Toggle cell at row ${step.x}, column ${step.y}`;
      rows.push([
        (index + 1).toString(),
        step.x.toString(),
        step.y.toString(),
        description,
        this.getBoardStateRepresentation(data.board, step.x, step.y)
      ]);
    });

    // 添加统计信息
    rows.push([]);
    rows.push(['Statistics', '', '', '', '']);
    rows.push(['Board Size', `${data.boardSize.rows}×${data.boardSize.cols}`, '', '', '']);
    rows.push(['Total Steps', data.solution.length.toString(), '', '', '']);
    rows.push(['Solve Time', `${data.solveTimeMs}ms`, '', '', '']);
    rows.push(['Timestamp', data.timestamp, '', '', '']);

    return rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  }

  /**
   * 获取棋盘状态的文本表示
   */
  private static getBoardStateRepresentation(board: number[][], row: number, col: number): string {
    return board.map((r, i) =>
      r.map((cell, j) => {
        if (i === row && j === col) return '★';
        return cell ? '●' : '○';
      }).join(' ')
    ).join(' | ');
  }

  /**
   * 导出为JSON格式
   */
  static exportToJSON(data: ExportData, filename?: string): void {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const link = document.createElement('a');

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename || `matrix_solution_${Date.now()}.json`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  }

  /**
   * 导出为文本格式
   */
  static exportToText(data: ExportData, filename?: string): void {
    let textContent = `光影矩阵解法报告\n`;
    textContent += `${'='.repeat(50)}\n\n`;
    textContent += `棋盘大小: ${data.boardSize.rows}×${data.boardSize.cols}\n`;
    textContent += `总步数: ${data.solution.length}\n`;
    textContent += `求解时间: ${data.solveTimeMs}ms\n`;
    textContent += `时间戳: ${data.timestamp}\n\n`;

    textContent += `初始棋盘:\n`;
    data.board.forEach((row, i) => {
      textContent += `第${i + 1}行: ${row.map(cell => cell ? '●' : '○').join(' ')}\n`;
    });

    textContent += `\n解法步骤:\n`;
    data.solution.forEach((step, index) => {
      textContent += `步骤 ${index + 1}: 点击位置 (${step.x}, ${step.y})\n`;
    });

    const blob = new Blob([textContent], { type: 'text/plain' });
    const link = document.createElement('a');

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename || `matrix_solution_${Date.now()}.txt`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  }

  /**
   * 创建解法数据的ExportData对象
   */
  static createExportData(
    board: number[][],
    solveResponse: SolveResponse,
    solveTimeMs: string
  ): ExportData {
    return {
      board,
      solution: solveResponse.solution || [],
      solveTimeMs,
      timestamp: solveResponse.timestamp || new Date().toISOString(),
      boardSize: {
        rows: board.length,
        cols: board[0]?.length || 0
      }
    };
  }
}