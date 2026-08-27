// ==================== 货币供应量看板专用类型 ====================

/** 货币供应量总览（KPI 卡片） */
export interface MoneySupplyOverview {
  date: string
  m0: number
  m1: number
  m2: number
  m0Yoy: number
  m1Yoy: number
  m2Yoy: number
  prevM0Yoy: number
  prevM1Yoy: number
  prevM2Yoy: number
}

/** 货币供应量趋势（双Y轴：余额 + 同比增速） */
export interface MoneySupplyTrend {
  dates: string[]
  m0: number[]
  m1: number[]
  m2: number[]
  m0Yoy: number[]
  m1Yoy: number[]
  m2Yoy: number[]
}

/** M1-M2 剪刀差走势 */
export interface MoneySupplyScissors {
  dates: string[]
  m1Yoy: number[]
  m2Yoy: number[]
  scissors: number[]
}

/** 货币结构占比（环形图） */
export interface MoneySupplyStructure {
  date: string
  m0: number
  m1: number
  m2: number
  quasiM2: number
  m0Pct: number
  m1Pct: number
  quasiPct: number
}

/** 剪刀差 vs 上证指数（跨市场关联） */
export interface ScissorsVsStock {
  dates: string[]
  scissors: number[]
  stockIndex: number[]
}

/** M2 增速 vs CPI/PPI */
export interface M2VsCpi {
  dates: string[]
  m2Yoy: number[]
  cpiYoy: number[]
  ppiYoy: number[]
}

/** 社融增量 vs M2 增速 */
export interface SocialFinanceVsM2 {
  dates: string[]
  sfYoy: number[]
  m2Yoy: number[]
}

// ==================== LPR 利率看板专用类型 ====================

/** LPR 概览（KPI 卡片） */
export interface LprOverview {
  date: string
  lpr1y: number
  lpr5y: number
  spread: number
  prevLpr1y: number
  prevLpr5y: number
  change1y: number
  change5y: number
}

/** LPR 走势（阶梯折线图） */
export interface LprTrend {
  dates: string[]
  lpr1y: number[]
  lpr5y: number[]
}
