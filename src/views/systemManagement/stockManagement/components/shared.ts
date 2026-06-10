/** 行业筛选下拉选项（所有模块共用） */
export const industryOptions = [
  { label: '银行', value: '银行' }, { label: '煤炭', value: '煤炭' }, { label: '电力', value: '电力' },
  { label: '钢铁', value: '钢铁' }, { label: '化工', value: '化工' }, { label: '食品饮料', value: '食品饮料' },
  { label: '医药', value: '医药' }, { label: '科技', value: '科技' }, { label: '金融', value: '金融' },
  { label: '地产', value: '地产' }, { label: '新能源', value: '新能源' }, { label: '消费', value: '消费' },
  { label: '制造', value: '制造' },
]

/** 交易所筛选下拉选项 */
export const exchangeOptions = [
  { label: '沪市', value: 'SH' },
  { label: '深市', value: 'SZ' },
]

/** 交易所代码 → 中文名（SpTable column formatter） */
export const exchangeFmt = (_r: any, _c: any, v: string) => ({ SH: '沪市', SZ: '深市' }[v] || v)

/** 分红类型代码 → 中文名（SpTable column formatter） */
export const dividendTypeFmt = (_r: any, _c: any, v: string) => ({ INTERIM: '中期', FINAL: '末期' }[v] || v)

/** 实施状态代码 → 中文名（SpTable column formatter） */
export const statusFmt = (_r: any, _c: any, v: string) => ({ PROPOSED: '预案', APPROVED: '已批准', IMPLEMENTED: '已实施' }[v] || v)

/** 规则启用状态代码 → 中文名（SpTable column formatter） */
export const activeFmt = (_r: any, _c: any, v: number) => v === 1 ? '启用' : '停用'

/**
 * 股息率颜色分级
 * >= 5% → 绿色    高股息
 * >= 4% → 蓝色    较高
 * >= 3% → 黄色    中等
 * < 3%  → 灰色    较低
 */
export const yieldLevelClass = (val: number) => {
  if (val >= 5) return 'yield-green'
  if (val >= 4) return 'yield-blue'
  if (val >= 3) return 'yield-yellow'
  return 'yield-gray'
}

/** 分红类型下拉选项（用于新建/编辑弹框） */
export const dividendTypeOptions = [
  { label: '中期分红', value: 'INTERIM' },
  { label: '末期/年度分红', value: 'FINAL' },
]

/** 分红实施状态下拉选项 */
export const dividendStatusOptions = [
  { label: '预案', value: 'PROPOSED' },
  { label: '已批准', value: 'APPROVED' },
  { label: '已实施', value: 'IMPLEMENTED' },
]

/** 分红类型 → Element Plus tag 类型映射 */
export const dividendTypeTagMap: Record<string, string> = { FINAL: 'primary', INTERIM: 'warning' }

/** 实施状态 → 徽章 class 映射 */
export const dividendStatusClassMap: Record<string, string> = {
  IMPLEMENTED: 'badge-green', APPROVED: 'badge-blue', PROPOSED: 'badge-yellow',
}

/** 实施状态中文（短格式，适合表格） */
export const statusShortFmt = (_r: any, _c: any, v: string) =>
  ({ PROPOSED: '预案', APPROVED: '已批', IMPLEMENTED: '实施' }[v] || v)

/** 每10股送转文本格式化 */
export const sharesFmt = (bonus?: number, transfer?: number) => {
  const parts: string[] = []
  if (bonus) parts.push(`送${bonus}`)
  if (transfer) parts.push(`转${transfer}`)
  return parts.join('') || '-'
}

/** 通知渠道下拉选项 */
export const channelOptions = [
  { label: '邮件', value: 'EMAIL' },
  { label: '短信', value: 'SMS' },
]

/** 行业树节点类型 */
export interface IndustryNode {
  id: string
  label: string
  count: number
  children?: IndustryNode[]
}

/** 行业板块树形数据（股票池左侧树） */
export const industryTree: IndustryNode[] = [
  {
    id: 'all', label: '全部分类', count: 10,
    children: [
      { id: '银行', label: '银行', count: 2 },
      { id: '煤炭', label: '煤炭', count: 1 },
      { id: '电力', label: '电力', count: 1 },
      { id: '钢铁', label: '钢铁', count: 1 },
      { id: '化工', label: '化工', count: 2 },
      { id: '食品饮料', label: '食品饮料', count: 2 },
      { id: '地产', label: '地产', count: 1 },
    ],
  },
]

/** 简单股票候选池（供分红/规则弹框下拉选择） */
export const stockCandidates = [
  { stockId: 1, stockCode: '600519', stockName: '贵州茅台' },
  { stockId: 2, stockCode: '601398', stockName: '工商银行' },
  { stockId: 3, stockCode: '600036', stockName: '招商银行' },
  { stockId: 4, stockCode: '000858', stockName: '五粮液' },
  { stockId: 5, stockCode: '600585', stockName: '海螺水泥' },
  { stockId: 6, stockCode: '601088', stockName: '中国神华' },
  { stockId: 7, stockCode: '000002', stockName: '万科A' },
  { stockId: 8, stockCode: '600900', stockName: '长江电力' },
  { stockId: 9, stockCode: '601857', stockName: '中国石油' },
  { stockId: 10, stockCode: '600028', stockName: '中国石化' },
]
