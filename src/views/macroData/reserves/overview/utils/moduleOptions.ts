/**
 * 储备资产看板 — 模块选项
 */

export const MONTHS_OPTIONS = [
  { label: '近1年', value: 12 },
  { label: '近3年', value: 36 },
  { label: '近5年', value: 60 },
  { label: '近10年', value: 120 },
]

/** KPI 卡片配置 */
export const KPI_CARDS = [
  { key: 'fxUsd',   label: '外汇储备',      unit: '亿美元', icon: 'Wallet',      color: '#409EFF', status: '稳定' },
  { key: 'fxSdr',   label: '外汇储备(SDR)', unit: '亿SDR',  icon: 'Coin',        color: '#67C23A', status: '稳定' },
  { key: 'imfUsd',  label: 'IMF头寸',       unit: '亿美元', icon: 'OfficeBuilding', color: '#67C23A', status: '正常' },
  { key: 'sdrUsd',  label: '特别提款权',     unit: '亿美元', icon: 'Document',    color: '#E6A23C', status: '正常' },
  { key: 'goldUsd', label: '黄金价值',       unit: '亿美元', icon: 'Coin',        color: '#E6A23C', status: '关注' },
  { key: 'goldOz',  label: '黄金储备',       unit: '万盎司', icon: 'FirstAidKit', color: '#E6A23C', status: '增持中' },
]

/** 明细表列配置 */
export const DETAIL_COLUMNS = [
  { prop: 'date',     label: '月份',           width: 100 },
  { prop: 'forexUsd', label: '外汇储备(亿美元)', align: 'center' as const },
  { prop: 'forexSdr', label: '外汇储备(亿SDR)',  align: 'center' as const },
  { prop: 'imfUsd',   label: 'IMF头寸(亿美元)',  align: 'center' as const },
  { prop: 'sdrUsd',   label: 'SDR(亿美元)',      align: 'center' as const },
  { prop: 'goldUsd',  label: '黄金价值(亿美元)',  align: 'center' as const },
  { prop: 'goldOz',   label: '黄金(万盎司)',     align: 'center' as const },
]
