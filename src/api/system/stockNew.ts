import { request } from '@/utils/axios'

// ==================== 表1: stock_basic (股票基础信息) ====================
export interface StockBasic {
  stockId?: number
  stockCode: string
  stockName: string
  exchange: string
  industry: string
  createdAt?: string
  updatedAt?: string
}

/** 股票池分页查询参数 */
export interface StockPoolPageQuery extends PageQuery {
  keywords?: string
  exchange?: string
  industry?: string
}

export const StockBasicAPI = {
  getList(query: StockPoolPageQuery) {
    const { pageNum, pageSize, ...rest } = query
    return request<any, PageResult<StockBasic[]>>({
      url: '/api/stockBasic/page', method: 'post', params: { pageNum, pageSize }, data: rest,
    })
  },
  insert(data: StockBasic) {
    return request<any, any>({ url: '/api/stockBasic/insert', method: 'post', data })
  },
  update(data: StockBasic) {
    return request<any, any>({ url: '/api/stockBasic/update', method: 'post', data })
  },
  delete(stockId: number) {
    return request<any, any>({ url: `/api/stockBasic/delete/${stockId}`, method: 'delete' })
  },
  batchImport(codes: string[]) {
    return request<any, any>({ url: '/api/stockBasic/batchImport', method: 'post', data: { codes } })
  },
}

// ==================== 表2: stock_dividend (分红明细) ====================
export interface StockDividend {
  id?: number
  stockId: number
  year: number
  dividendType: string
  planText: string
  cashPerShare: number
  announcementDate: string
  exDividendDate: string
  status: string
  createdAt?: string
}

// ==================== 表3: stock_realtime_quote (实时行情) ====================
export interface StockRealtimeQuote {
  stockId: number
  currentPrice: number
  changePct: number
  volume: number
  updateTime: string
}

// ==================== 表4: dividend_monitor_rule (监控阈值) ====================
export interface MonitorRule {
  id?: number
  stockId: number
  thresholdRate: number
  notifyChannels: string
  contacts: string
  isActive: number
  createdAt?: string
}

/** 监控规则查询参数 */
export interface MonitorRulePageQuery extends PageQuery {
  stockId?: number
  isActive?: number
}

export const MonitorRuleAPI = {
  getList(query: MonitorRulePageQuery) {
    const { pageNum, pageSize, ...rest } = query
    return request<any, PageResult<MonitorRule[]>>({
      url: '/api/monitorRule/page', method: 'post', params: { pageNum, pageSize }, data: rest,
    })
  },
  insert(data: MonitorRule) {
    return request<any, any>({ url: '/api/monitorRule/insert', method: 'post', data })
  },
  update(data: MonitorRule) {
    return request<any, any>({ url: '/api/monitorRule/update', method: 'post', data })
  },
  delete(id: number) {
    return request<any, any>({ url: `/api/monitorRule/delete/${id}`, method: 'delete' })
  },
}

// ==================== 表5: alert_log (告警日志) ====================
export interface AlertLog {
  id?: number
  ruleId: number
  triggeredRate: number
  triggeredPrice: number
  sentTime: string
}

// ==================== 大盘看板 DTO（多表 JOIN） ====================
export interface DashboardStock {
  stockId: number
  stockCode: string
  stockName: string
  exchange: string
  industry: string
  currentPrice: number
  changePct: number
  volume: number
  cashPerShare: number
  year: number
  dividendType: string
  calculatedYield: number
  triggered: boolean
  triggerCount: number
}

/** 大盘看板查询参数 */
export interface DashboardPageQuery extends PageQuery {
  keywords?: string
  industry?: string
  onlyTriggered?: boolean
}

export const DashboardAPI = {
  /** 获取看板列表（股票+行情+最新分红+触发状态） */
  getList(query: DashboardPageQuery) {
    const { pageNum, pageSize, ...rest } = query
    return request<any, PageResult<DashboardStock[]>>({
      url: '/api/dashboard/page', method: 'post', params: { pageNum, pageSize }, data: rest,
    })
  },
  /** 一键刷新实时行情 */
  refreshQuotes() {
    return request<any, any>({ url: '/api/dashboard/refreshQuotes', method: 'post' })
  },
  /** 看板顶部统计 */
  getStats() {
    return request<any, { totalStocks: number; activeAlerts: number; avgYield: number }>({
      url: '/api/dashboard/stats', method: 'get',
    })
  },
}
