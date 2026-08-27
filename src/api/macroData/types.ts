/**
 * 宏观数据模块 — 类型定义
 * 对接后端三表合一查询接口（macro_monthly / macro_daily / macro_weekly）
 */

/** 指标元数据 */
export interface MacroIndicatorMeta {
  id: number
  indicatorCode: string
  indicatorName: string
  frequency: string
  unit: string
  chartType: string
  chartColor: string | null
  parentCode: string | null
  sortOrder: number
  status: number
}

/** 后端 pivot 查询返回结构 */
export interface MacroPivotResult {
  /** 日期序列，如 ["2024-01", "2024-02", ...] */
  dates: string[]
  /** 指标数据，如 { M0: [13.22, ...], M1: [110.88, ...] } */
  series: Record<string, number[]>
}

/** 后端导入接口入参 */
export interface MacroDataItem {
  statDate: string
  indicatorCode: string
  metricValue: number
  metricValue2?: number
  momChange?: number
  dataVersion?: number
  source?: string
  extra?: string
}

// ==================== 前端页面兼容类型 ====================
// 以下类型保留给现有页面使用，数据由 composable pivot 生成

export interface MoneySupplyRecord {
  date: string
  m0: number
  m1: number
  m2: number
  m0Yoy: number
  m1Yoy: number
  m2Yoy: number
}

export interface SocialFinanceRecord {
  date: string
  newAmount: number
  stockAmount: number
  yoyGrowth: number
}

export interface PmiRecord {
  date: string
  manufacturing: number
  nonManufacturing: number
  composite: number
}

export interface PriceIndexRecord {
  date: string
  cpi: number
  ppi: number
  cpiMom: number
  ppiMom: number
}

export interface LprRecord {
  date: string
  lpr1y: number
  lpr5y: number
}

export interface OfficialReserveRecord {
  date: string
  forexUsd: number
  forexSdr: number
  forexChange: number
  imfUsd: number
  sdrUsd: number
  goldUsd: number
  goldSdr: number
  goldOz: number
  goldChange: number
  otherUsd: number
  totalUsd: number
  totalSdr: number
}

export interface NewLoansRecord {
  date: string
  newAmount: number
  yoyChange: number
}

export interface ShiborRecord {
  date: string
  overnight: number
  w1: number
  m1: number
  y1: number
}

export interface AccountOpeningsRecord {
  date: string
  newInvestors: number
  totalInvestors: number
}

export interface MarginTradingRecord {
  date: string
  marginBuy: number
  shortSell: number
  total: number
}

export interface MacroKpiSummary {
  label: string
  value: string
  change: number
  unit: string
  icon: string
  color: string
}

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
