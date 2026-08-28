// ==================== 社会融资规模看板专用类型 ====================

/** 社融概览（KPI 卡片） */
export interface SfOverview {
  date: string
  sfStock: number           // 社融存量（万亿元）
  sfYoy: number             // 社融存量同比（%）
  sfYoyChange: number       // 社融同比月变动
  m2Yoy: number             // M2同比（%）
  scissors: number          // M2-社融剪刀差
  loanYoy: number           // 贷款存量同比（%）
  loanYoyChange: number
  govtBondYoy: number       // 政府债券存量同比（%）
  govtBondYoyChange: number
  sfNew: number             // 当月新增（万亿元）
}

/** 社融趋势（双轴图 + 信用脉冲 + 8分项存量） */
export interface SfTrend {
  dates: string[]
  sfStock: number[]         // 社融存量
  sfYoy: number[]           // 社融同比
  m2Yoy: number[]           // M2同比
  sfNew: number[]           // 社融增量
  loanNew: number[]         // 贷款增量
  govtBondNew: number[]     // 政府债券增量
  corpBondNew: number[]     // 企业债券增量
  creditImpulse: number[]
  // 8分项存量序列（供堆叠面积图）
  sfStockRmbLoan: number[]
  sfStockGovtBond: number[]
  sfStockCorpBond: number[]
  sfStockEquity: number[]
  sfStockTrustLoan: number[]
  sfStockEntrustedLoan: number[]
  sfStockForeignLoan: number[]
  sfStockOther: number[]
}

/** 社融结构贡献（8个分项增量） */
export interface SfStructure {
  dates: string[]
  rmblOan: number[]         // 人民币贷款增量
  govtBond: number[]        // 政府债券增量
  corpBond: number[]        // 企业债券增量
  equity: number[]          // 股票融资增量
  trustLoan: number[]       // 信托贷款增量
  entrustedLoan: number[]   // 委托贷款增量
  foreignLoan: number[]     // 外币贷款增量
  other: number[]           // ABS+核销+承兑等
}