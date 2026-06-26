import { exchangeFmt } from './shared'

/** 表格操作列的回调接口 */
export interface ColumnHandlers {
  onEdit: (row: any) => void
  onDelete?: (row: any) => void
  onToggle?: (row: any) => void
  onDetail?: (row: any) => void
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
    { label: '股票名称', prop: 'stockName', minWidth: '140px', slotName: 'stockName' },
    { label: '交易所', prop: 'exchangeName', minWidth: '100px'},
    { label: '所属行业', prop: 'industryName', minWidth: '100px' },
    { label: '创建时间', prop: 'createdAt', minWidth: '170px' },
    /* 操作列：详情 + 编辑 + 删除 */
    {
      columnType: 'operate', label: '操作', width: '150px', fixed: 'right',
      buttons: [
        { type: 'primary', label: '详情', size: 'small', renderType: 'link', click: ({ row }: any) => handlers.onDetail?.(row) },
        { type: 'primary', label: '编辑', size: 'small', renderType: 'link', click: ({ row }: any) => handlers.onEdit(row) },
        { type: 'danger', label: '删除', size: 'small', renderType: 'link', popconFirm: { title: '确认删除该股票吗？' }, click: ({ row }: any) => handlers.onDelete?.(row) },
      ],
    },
  ]
}

/** 分红数据维护表格列 */
export function createDividendColumns(handlers: ColumnHandlers) {
  return [
    { label: '股票代码', prop: 'stockCode', minWidth: '100px' },
    { label: '股票名称', prop: 'stockName', minWidth: '100px' },
    { label: '分红年度', prop: 'year', minWidth: '110px' },
    { label: '分红类型', prop: 'dividendType', minWidth: '100px',slotName: 'dividendType' },
    { label: '每股派息(元)', prop: 'cashPerShare', minWidth: '120px'},
    { label: '送股(每10股)', prop: 'bonusSharesPer10', minWidth: '120px'},
    { label: '转增(每10股)', prop: 'transferSharesPer10', minWidth: '120px'},
    { label: '分红方案', prop: 'planText', minWidth: '160px'},
    { label: '公告日期', prop: 'announcementDate', minWidth: '140px'},
    { label: '除权除息日', prop: 'exDividendDate', minWidth: '140px' },
    { label: '实施状态', prop: 'status', minWidth: '130px', slotName: 'status' },
    { label: '创建时间', prop: 'createdAt', minWidth: '170px' },
    {
      columnType: 'operate',
      label: '操作',
      width: '110px',
      fixed: 'right',
      buttons: [
        { type: 'primary', label: '编辑', size: 'small', renderType: 'link', click: ({ row }: any) => handlers.onEdit(row) },
        { type: 'danger', label: '删除', size: 'small', renderType: 'link', popconFirm: { title: '确认删除该记录吗？' }, click: ({ row }: any) => handlers.onDelete?.(row) },
      ],
    },
  ]
}

/** 分红明细表格列（股票详情页用，只读，不分页） */
export function createDividendDetailColumns() {
  return [
    { label: '年度', prop: 'year', minWidth: '60px', align: 'center' },
    { label: '分红类型', prop: 'dividendType', minWidth: '90px', align: 'center', slotName: 'dividendType' },
    { label: '每股派息(元)', prop: 'cashPerShare', minWidth: '120px', align: 'right' },
    { label: '送转', prop: 'sharesText', minWidth: '90px', align: 'center' },
    { label: '状态', prop: 'status', minWidth: '80px', align: 'center', slotName: 'status' },
    { label: '除权除息日', prop: 'exDividendDate', minWidth: '110px', align: 'center' },
    { label: '公告日期', prop: 'announcementDate', minWidth: '110px', align: 'center' },
  ]
}

/** 实时行情表格列（只读，无操作） */
export function createStockQuoteColumns() {
  return [
    { label: '股票代码', prop: 'stockCode', minWidth: '100px' },
    { label: '股票名称', prop: 'stockName', minWidth: '100px' },
    { label: '交易所', prop: 'exchangeName', minWidth: '130px' },
    { label: '行业', prop: 'industryName', minWidth: '120px' },
    { label: '最新价', prop: 'currentPrice', minWidth: '90px', align: 'right' },
    { label: '涨跌幅', prop: 'changePercent', minWidth: '90px', align: 'right', slotName: 'changePercent' },
    { label: '每股分红', prop: 'dividendPerShare', minWidth: '90px', align: 'right' },
    { label: '股息率', prop: 'dividendYield', minWidth: '90px', align: 'right', slotName: 'dividendYield' },
    { label: '动态股息率', prop: 'dynamicYield', minWidth: '100px', align: 'right', slotName: 'dynamicYield' },
    { label: '交易日期', prop: 'tradeDate', minWidth: '120px', align: 'center' },
    { label: '开盘价', prop: 'openPrice', minWidth: '90px', align: 'right', slotName: 'openPrice' },
    { label: '最高价', prop: 'highPrice', minWidth: '90px', align: 'right', slotName: 'highPrice' },
    { label: '最低价', prop: 'lowPrice', minWidth: '90px', align: 'right', slotName: 'lowPrice' },
    { label: '更新', prop: 'quoteUpdateTime', minWidth: '180px', align: 'center' },
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
