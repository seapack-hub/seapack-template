/**
 * AI 个股诊断 API
 *
 * 后端接口：POST /api/ai/stock/analyze
 */
import { request } from '@/utils/axios';
import type {
  StockAnalyzeRequest,
  StockAnalyzeResponse,
} from './types/stockAnalysis';

export type {
  StockAnalyzeRequest,
  StockAnalyzeResponse,
}

const BASE_URL = '/api';

export const StockAnalysisAPI = {
  /** 个股诊断：同步返回完整分析报告 */
  analyze(data: StockAnalyzeRequest) {
    return request<any, StockAnalyzeResponse>({
      url: `${BASE_URL}/ai/stock/analyze`,
      method: 'post',
      data,
    });
  },
};
