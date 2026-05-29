/** 股票表单弹框状态类型 */
export interface StockFormState {
  /** 弹框是否可见 */
  visible: boolean
  /** 是否为编辑模式（false 表示新增模式） */
  isEdit: boolean
  /** 表单数据 */
  form: {
    /** 股票 ID（编辑时必填，新增时为空） */
    id?: number
    /** 股票代码，如 600519 */
    stockCode: string
    /** 股票名称，如 贵州茅台 */
    stockName: string
    /** 交易所：SH / SZ / BJ */
    exchange: string
  }
}

/** 创建默认的弹框状态 */
export function createStockFormState(): StockFormState {
  return {
    visible: false,
    isEdit: false,
    form: { stockCode: '', stockName: '', exchange: '' },
  }
}
