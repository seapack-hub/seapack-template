/**
 * 个股诊断逻辑 Composable
 *
 * 封装 AI 个股诊断的状态管理、接口调用、错误处理，
 * 可被多个页面或组件复用。
 */

import { StockAnalysisAPI, type StockAnalyzeRequest, type StockAnalyzeResponse } from '@/api/ai/stockAnalysis';

export function useStockAnalysis() {
  /** 股票代码 */
  const stockCode = ref('');
  /** 交易所 */
  const exchange = ref('');
  /** 分析维度 */
  const dimension = ref('all');
  /** 额外问题 */
  const extraQuestion = ref('');
  /** 加载状态 */
  const loading = ref(false);
  /** 分析报告 */
  const report = ref<StockAnalyzeResponse | null>(null);
  /** 错误信息 */
  const error = ref('');

  /**
   * 执行个股诊断
   * @param code 股票代码（可选，默认使用 stockCode）
   */
  async function analyze(code?: string) {
    const targetCode = code?.trim() || stockCode.value.trim();

    if (!targetCode) {
      ElMessage.warning('请输入股票代码');
      return;
    }
    if (!/^\d{6}$/.test(targetCode)) {
      ElMessage.warning('股票代码应为 6 位数字');
      return;
    }

    loading.value = true;
    error.value = '';
    report.value = null;

    try {
      const params: StockAnalyzeRequest = {
        stockCode: targetCode,
        dimension: dimension.value,
      };
      if (extraQuestion.value.trim()) {
        params.question = extraQuestion.value.trim();
      }

      const res = await StockAnalysisAPI.analyze(params);
      report.value = res;
      stockCode.value = targetCode;
    } catch (err: any) {
      error.value = err?.message || '分析失败，请稍后重试';
      ElMessage.error(error.value);
    } finally {
      loading.value = false;
    }
  }

  /**
   * 重置状态
   */
  function reset() {
    stockCode.value = '';
    exchange.value = '';
    dimension.value = 'all';
    extraQuestion.value = '';
    report.value = null;
    error.value = '';
  }

  /**
   * 重新分析当前股票
   */
  function reanalyze() {
    analyze(stockCode.value);
  }

  return {
    stockCode,
    exchange,
    dimension,
    extraQuestion,
    loading,
    report,
    error,
    analyze,
    reset,
    reanalyze,
  };
}
