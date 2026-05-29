import { exchangeFormatter } from './utils'

/** 表格操作列回调接口 */
export interface ColumnHandlers {
  /** 编辑按钮点击回调 */
  onEdit: (row: any) => void
  /** 删除按钮点击回调 */
  onDelete: (row: any) => void
}

/** 创建股票综合信息表的列配置 */
export function createOverviewColumns(handlers: ColumnHandlers) {
  return [
    { label: '股票代码', prop: 'stockCode', minWidth: '110px' },
    { label: '股票名称', prop: 'stockName', minWidth: '130px' },
    { label: '交易所', prop: 'exchange', minWidth: '70px', formatter: exchangeFormatter },
    { label: '最新价', prop: 'currentPrice', minWidth: '100px', align: 'right' },
    { label: '每股股息', prop: 'dividendPerShare', minWidth: '100px', align: 'right' },
    // 股息率使用插槽自定义渲染（颜色分级在 index.vue 中通过 yieldLevelClass 控制）
    { label: '股息率', prop: 'calculatedYield', minWidth: '90px', align: 'right', slotName: 'calculatedYield' },
    { label: '触发股息率', prop: 'triggerRate', minWidth: '100px', align: 'right' },
    { label: '通知邮箱', prop: 'emailNotify', minWidth: '150px', showOverflowTooltip: true },
    // 监控状态使用插槽渲染（开启/关闭颜色区分在 index.vue 中控制）
    { label: '监控状态', prop: 'isActive', minWidth: '80px', align: 'center', slotName: 'isActive' },
    { label: '数据时间', prop: 'dataTime', minWidth: '160px' },
    {
      // 操作列：固定在表格右侧
      columnType: 'operate', label: '操作', width: '110px', fixed: 'right',
      buttons: [
        { type: 'primary', label: '编辑', size: 'small', renderType: 'link', click: ({ row }: any) => handlers.onEdit(row) },
        { type: 'danger', label: '删除', size: 'small', renderType: 'link', popconFirm: { title: '确认删除该股票记录吗？' }, click: ({ row }: any) => handlers.onDelete(row) },
      ],
    },
  ]
}
