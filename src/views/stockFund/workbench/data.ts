export interface FeatureItem {
  name: string
  title: string
  desc: string
  icon: string
  route: string
  color: string
  stat?: string
}

export const marketData = [
  { label: '上证指数', value: '3,215.68', change: 0.82 },
  { label: '深证成指', value: '10,234.56', change: 1.23 },
  { label: '创业板指', value: '2,156.42', change: -0.35 },
  { label: '科创50', value: '968.25', change: 1.67 },
]

export const features: FeatureItem[] = [
  {
    name: 'stockQuote',
    title: '股票实时行情',
    desc: '大盘指数面板 · 行业树筛选 · 实时行情分页',
    icon: 'TrendCharts',
    route: '/stockFund/stock/stockQuote',
    color: '#F44336',
    stat: '实时',
  },
  {
    name: 'aiStockAnalysis',
    title: 'AI 个股诊断',
    desc: '输入股票代码 · AI 自动调用行情/分红/K线工具 · 生成个股分析报告',
    icon: 'Cpu',
    route: '/stockFund/aiStockAnalysis',
    color: '#9C27B0',
    stat: 'AI',
  },
  {
    name: 'stockPool',
    title: '股票池管理',
    desc: '自选股票池增删改查 · 关联行业/交易所',
    icon: 'List',
    route: '/stockFund/stock/stockPool',
    color: '#FF9800',
    stat: '管理',
  },
  {
    name: 'dividendData',
    title: '分红数据维护',
    desc: '分红记录 CRUD · 股息率分析 · 历史分红查询',
    icon: 'Wallet',
    route: '/stockFund/stock/dividendData',
    color: '#4CAF50',
  },
  {
    name: 'dashboardView',
    title: '股票监控池',
    desc: '可配置阈值规则 · 实时监控面板 · 多维度筛选',
    icon: 'Monitor',
    route: '/stockFund/stock/dashboardView',
    color: '#2196F3',
    stat: '监控',
  },
  {
    name: 'alertHistory',
    title: '告警历史记录',
    desc: '告警日志查询 · 级别筛选 · 时间范围过滤',
    icon: 'Bell',
    route: '/stockFund/stock/alertHistory',
    color: '#E91E63',
  },
  {
    name: 'fundBaseInfo',
    title: '基金信息',
    desc: '基金数据查询 · 基金详情 · 行业树浏览',
    icon: 'Coin',
    route: '/stockFund/fund/fundBaseInfo',
    color: '#00BCD4',
    stat: '基金',
  },
]
