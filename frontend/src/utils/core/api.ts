import axios from 'axios';
import { BoardState, SolveResponse, VerifyResponse, RandomBoardResponse } from '../types';

const API_BASE_URL = 'http://127.0.0.1:8686/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    console.log(`🚀 API请求: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ API请求错误:', error);
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ API响应: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ API响应错误:', error);
    return Promise.reject(error);
  }
);

export const lightsMatrixAPI = {
  solve: async (boardState: BoardState): Promise<SolveResponse> => {
    const response = await apiClient.post<SolveResponse>('/solve', boardState);
    return response.data;
  },

  verify: async (boardState: BoardState, solution: any[]): Promise<VerifyResponse> => {
    const response = await apiClient.post<VerifyResponse>('/verify', {
      ...boardState,
      solution
    });
    return response.data;
  },

  getRandomBoard: async (rows: number = 5, cols: number = 5): Promise<RandomBoardResponse> => {
    const response = await apiClient.get<RandomBoardResponse>(`/board/random?rows=${rows}&cols=${cols}`);
    return response.data;
  },

  checkServerHealth: async (): Promise<{ status: string }> => {
    // 直接访问根路径进行健康检查
    const response = await fetch('http://127.0.0.1:8686/');
    const data = await response.json();
    return data;
  }
};

export default lightsMatrixAPI;