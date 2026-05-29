import { exchangeFmt } from './shared'

/** 表格操作列的回调接口 */
export interface ColumnHandlers {
  onEdit: (row: any) => void
  onDelete?: (row: any) => void
  onToggle?: (row: any) => void
}

/** 核心监控大盘表格列 */
export function createDashboardColumns() {
  return [
    { label: '股票代码', prop: 'stockCode', minWidth: '110px' },
    { label: '股票名称', prop: 'stockName', minWidth: '130px' },
    { label: '交易所', prop: 'exchange', minWidth: '70px', formatter: exchangeFmt },
    { label: '行业', prop: 'industry', minWidth: '80px' },
    { label: '最新价', prop: 'currentPrice', minWidth: '100px', align: 'right' },
    /* 涨跌幅使用 slotName 插槽渲染，颜色区分涨跌 */
    { label: '涨跌幅', prop: 'changePct', minWidth: '90px', align: 'right', slotName: 'changePct' },
    { label: '每股股息', prop: 'cashPerShare', minWidth: '100px', align: 'right' },
    /* 动态股息率使用 slotName 插槽渲染，按数值分色 */
    { label: '动态股息率', prop: 'calculatedYield', minWidth: '110px', align: 'right', slotName: 'calculatedYield' },
    { label: '分红年份', prop: 'year', minWidth: '80px', align: 'center' },
    /* 触发状态使用 slotName 插槽渲染，已触发红色/正常绿色 */
    { label: '触发状态', prop: 'triggered', minWidth: '100px', align: 'center', slotName: 'triggered' },
    { label: '触发次数', prop: 'triggerCount', minWidth: '80px', align: 'center' },
  ]
}

/** 股票池管理表格列 */
export function createStockPoolColumns(handlers: ColumnHandlers) {
  return [
    { label: '股票代码', prop: 'stockCode', minWidth: '120px' },
    { label: '股票名称', prop: 'stockName', minWidth: '160px' },
    { label: '交易所', prop: 'exchange', minWidth: '80px', formatter: exchangeFmt },
    { label: '所属行业', prop: 'industry', minWidth: '100px' },
    { label: '创建时间', prop: 'createdAt', minWidth: '170px' },
    /* 操作列：编辑 + 删除，删除需二次确认 */
    {
      columnType: 'operate', label: '操作', width: '130px', fixed: 'right',
      buttons: [
        { type: 'primary', label: '编辑', size: 'small', renderType: 'link', click: ({ row }: any) => handlers.onEdit(row) },
        { type: 'danger', label: '删除', size: 'small', renderType: 'link', popconFirm: { title: '确认删除该股票吗？' }, click: ({ row }: any) => handlers.onDelete?.(row) },
      ],
    },
  ]
}

/** 分红数据维护表格列 */
export function createDividendColumns(handlers: ColumnHandlers) {
  return [
    { label: '股票名称', prop: 'stockName', minWidth: '120px' },
    { label: '分红年度', prop: 'year', minWidth: '90px', align: 'center' },
    /* 分红类型使用 slotName 插槽，el-tag 渲染 */
    { label: '分红类型', prop: 'dividendType', minWidth: '100px', align: 'center', slotName: 'dividendType' },
    { label: '每股派息(元)', prop: 'cashPerShare', minWidth: '120px', align: 'right' },
    { label: '分红方案', prop: 'planText', minWidth: '120px' },
    { label: '公告日期', prop: 'announcementDate', minWidth: '110px', align: 'center' },
    { label: '除权除息日', prop: 'exDividendDate', minWidth: '110px', align: 'center' },
    /* 实施状态使用 slotName 插槽，颜色区分：已实施绿色/已批准蓝色/预案黄色 */
    { label: '实施状态', prop: 'status', minWidth: '90px', align: 'center', slotName: 'status' },
    { label: '创建时间', prop: 'createdAt', minWidth: '160px' },
    {
      columnType: 'operate', label: '操作', width: '130px', fixed: 'right',
      buttons: [
        { type: 'primary', label: '编辑', size: 'small', renderType: 'link', click: ({ row }: any) => handlers.onEdit(row) },
        { type: 'danger', label: '删除', size: 'small', renderType: 'link', popconFirm: { title: '确认删除该记录吗？' }, click: ({ row }: any) => handlers.onDelete?.(row) },
      ],
    },
  ]
}

/** 监控规则配置表格列 */
export function createAlertRuleColumns(handlers: ColumnHandlers) {
  return [
    { label: '股票名称', prop: 'stockName', minWidth: '120px' },
    { label: '监控阈值(%)', prop: 'thresholdRate', minWidth: '120px', align: 'right' },
    { label: '通知渠道', prop: 'notifyChannels', minWidth: '140px' },
    { label: '接收人', prop: 'contacts', minWidth: '200px', showOverflowTooltip: true },
    { label: '创建时间', prop: 'createdAt', minWidth: '160px' },
    /* 启用状态使用 slotName 插槽，启用绿色/停用灰色 */
    { label: '状态', prop: 'isActive', minWidth: '80px', align: 'center', slotName: 'isActive' },
    /* 操作列：编辑 + 启停切换 + 删除 */
    {
      columnType: 'operate', label: '操作', width: '180px', fixed: 'right',
      buttons: [
        { type: 'primary', label: '编辑', size: 'small', renderType: 'link', click: ({ row }: any) => handlers.onEdit(row) },
        { type: 'primary', label: '启/停', size: 'small', renderType: 'link', click: ({ row }: any) => handlers.onToggle?.(row) },
        { type: 'danger', label: '删除', size: 'small', renderType: 'link', popconFirm: { title: '确认删除该规则吗？' }, click: ({ row }: any) => handlers.onDelete?.(row) },
      ],
    },
  ]
}

/** 告警历史记录表格列（只读，无需操作） */
export function createAlertHistoryColumns() {
  return [
    { label: '触发时间', prop: 'sentTime', minWidth: '160px' },
    { label: '股票名称', prop: 'stockName', minWidth: '120px' },
    { label: '触发股息率(%)', prop: 'triggeredRate', minWidth: '130px', align: 'right' },
    { label: '触发时股价', prop: 'triggeredPrice', minWidth: '120px', align: 'right' },
    { label: '触发规则', prop: 'ruleDesc', minWidth: '200px', showOverflowTooltip: true },
    { label: '通知渠道', prop: 'notifyChannels', minWidth: '120px', align: 'center' },
    { label: '接收人', prop: 'contacts', minWidth: '200px', showOverflowTooltip: true },
  ]
}
