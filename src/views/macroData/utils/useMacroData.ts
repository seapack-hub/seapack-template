/**
 * useMacroData — 宏观数据模块 composable
 * 对接后端统一查询接口，pivot 转换后供页面直接使用
 */
import { ref } from 'vue'
import type {
  MoneySupplyRecord,
  SocialFinanceRecord,
  PmiRecord,
  PriceIndexRecord,
  LprRecord,
  OfficialReserveRecord,
  NewLoansRecord,
  ShiborRecord,
  AccountOpeningsRecord,
  MarginTradingRecord,
  MacroKpiSummary,
} from '@/api/macroData/types'
import { MacroDataAPI } from '@/api/macroData'

// ==================== 日期工具 ====================

function recentMonths(n: number): string[] {
  const result: string[] = []
  const now = new Date()
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    result.push(`${y}-${m}-01`)
  }
  return result
}

function formatDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}-01`
}

/** 通用工具：取数组最后 N 项 */
function tail<T>(arr: T[], n = 1): T[] {
  return arr.slice(-n)
}

// ==================== Mock 兜底 ====================

function fluctuate(base: number, pct: number): number {
  return +(base * (1 + (Math.random() * 2 - 1) * pct)).toFixed(2)
}

function generateMockMoneySupply(): MoneySupplyRecord[] {
  const months = recentMonths(24)
  let m2Base = 280
  return months.map((date) => {
    m2Base = fluctuate(m2Base, 0.008)
    const m1Base = m2Base * 0.35
    const m0Base = m2Base * 0.08
    return {
      date: date.slice(0, 7),
      m0: +m0Base.toFixed(2),
      m1: +m1Base.toFixed(2),
      m2: +m2Base.toFixed(2),
      m0Yoy: fluctuate(8, 0.3),
      m1Yoy: fluctuate(1.5, 0.8),
      m2Yoy: fluctuate(9.5, 0.15),
    }
  })
}

function generateMockSocialFinance(): SocialFinanceRecord[] {
  const months = recentMonths(24)
  let stock = 370
  return months.map((date) => {
    const newAmt = fluctuate(3.2, 0.3)
    stock = +(stock + newAmt * 0.03).toFixed(2)
    return { date: date.slice(0, 7), newAmount: +newAmt.toFixed(2), stockAmount: stock, yoyGrowth: fluctuate(9.5, 0.12) }
  })
}

function generateMockPmi(): PmiRecord[] {
  return recentMonths(24).map((date) => ({
    date: date.slice(0, 7),
    manufacturing: fluctuate(50.2, 0.02),
    nonManufacturing: fluctuate(53.5, 0.025),
    composite: fluctuate(52.0, 0.02),
  }))
}

function generateMockPriceIndex(): PriceIndexRecord[] {
  return recentMonths(24).map((date) => ({
    date: date.slice(0, 7),
    cpi: fluctuate(0.3, 0.8),
    ppi: fluctuate(-2.5, 0.15),
    cpiMom: fluctuate(0.1, 0.6),
    ppiMom: fluctuate(-0.1, 0.5),
  }))
}

function generateMockLpr(): LprRecord[] {
  const steps = [3.65, 3.55, 3.45, 3.45, 3.35, 3.35, 3.35, 3.35]
  const steps5y = [4.30, 4.20, 4.00, 3.95, 3.85, 3.85, 3.85, 3.85]
  return recentMonths(24).map((date, i) => {
    const step = Math.min(Math.floor(i / 3), steps.length - 1)
    return { date: date.slice(0, 7), lpr1y: steps[step], lpr5y: steps5y[step] }
  })
}

function generateMockOfficialReserves(): OfficialReserveRecord[] {
  const months = recentMonths(24)
  let forexBase = 32000, goldOz = 6200
  return months.map((date) => {
    const prevForex = forexBase
    forexBase = fluctuate(forexBase, 0.005)
    const prevGoldOz = goldOz
    goldOz = +(goldOz * 1.003).toFixed(0)
    const forexUsd = +forexBase.toFixed(0)
    const imfUsd = fluctuate(110, 0.03)
    const sdrUsd = fluctuate(560, 0.02)
    const goldUsd = fluctuate(3600, 0.06)
    const totalUsd = +(forexUsd + imfUsd + sdrUsd + goldUsd + 0.5).toFixed(2)
    return {
      date: date.slice(0, 7),
      forexUsd, forexSdr: +(forexUsd * 0.73).toFixed(2), forexChange: +(forexBase - prevForex).toFixed(0),
      imfUsd, sdrUsd, goldUsd, goldSdr: +(goldUsd * 0.73).toFixed(2),
      goldOz: goldOz, goldChange: +(goldOz - prevGoldOz).toFixed(0),
      otherUsd: fluctuate(0.5, 2.0), totalUsd, totalSdr: +(totalUsd * 0.73).toFixed(2),
    }
  })
}

function generateMockNewLoans(): NewLoansRecord[] {
  return recentMonths(24).map((date) => ({
    date: date.slice(0, 7),
    newAmount: fluctuate(12000, 0.3),
    yoyChange: fluctuate(500, 0.8),
  }))
}

function generateMockShibor(): ShiborRecord[] {
  const days: string[] = []
  const now = new Date()
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)
    days.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`)
  }
  return days.map((date) => ({
    date,
    overnight: fluctuate(1.5, 0.2),
    w1: fluctuate(1.8, 0.15),
    m1: fluctuate(2.0, 0.1),
    y1: fluctuate(2.3, 0.05),
  }))
}

function generateMockAccountOpenings(): AccountOpeningsRecord[] {
  const weeks: string[] = []
  const now = new Date()
  for (let i = 23; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000)
    weeks.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`)
  }
  let total = 22000
  return weeks.map((date) => {
    const newInv = fluctuate(150, 0.5)
    total = +(total + newInv).toFixed(0)
    return { date, newInvestors: +newInv.toFixed(1), totalInvestors: total }
  })
}

function generateMockMarginTrading(): MarginTradingRecord[] {
  const days: string[] = []
  const now = new Date()
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)
    if (d.getDay() === 0 || d.getDay() === 6) continue
    days.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`)
  }
  let base = 15000
  return days.map((date) => {
    base = fluctuate(base, 0.015)
    const shortSell = fluctuate(base * 0.04, 0.1)
    return {
      date,
      marginBuy: +base.toFixed(0),
      shortSell: +shortSell.toFixed(0),
      total: +(base + shortSell).toFixed(0),
    }
  })
}

// ==================== Composable ====================

export function useMacroData() {
  const loading = ref(false)

  // ===== 数据 ref =====
  const kpiList = ref<MacroKpiSummary[]>([])
  const moneySupply = ref<MoneySupplyRecord[]>([])
  const socialFinance = ref<SocialFinanceRecord[]>([])
  const pmi = ref<PmiRecord[]>([])
  const priceIndex = ref<PriceIndexRecord[]>([])
  const lpr = ref<LprRecord[]>([])
  const officialReserves = ref<OfficialReserveRecord[]>([])
  const newLoans = ref<NewLoansRecord[]>([])
  const shibor = ref<ShiborRecord[]>([])
  const accountOpenings = ref<AccountOpeningsRecord[]>([])
  const marginTrading = ref<MarginTradingRecord[]>([])

  // ===== pivot 辅助 =====
  function pivotMonthly(dates: string[], series: Record<string, number[]>, keys: string[]): any[] {
    return dates.map((date, i) => {
      const item: any = { date: date.slice(0, 7) }
      for (const key of keys) {
        item[key] = series[key]?.[i] ?? 0
      }
      return item
    })
  }

  // ===== 获取数据 =====
  async function fetchMoneySupply(opts?: { frequency?: string; startDate?: string; endDate?: string }) {
    const frequency = opts?.frequency ?? 'monthly'
    const startDate = opts?.startDate ?? recentMonths(24)[0]
    const endDate = opts?.endDate
    try {
      const result = await MacroDataAPI.queryPivot(frequency, ['M0', 'M1', 'M2', 'M0_YOY', 'M1_YOY', 'M2_YOY'], startDate, endDate)
      moneySupply.value = pivotMonthly(result.dates, result.series, ['M0', 'M1', 'M2', 'M0_YOY', 'M1_YOY', 'M2_YOY'])
        .map((d: any) => ({ date: d.date, m0: d.M0, m1: d.M1, m2: d.M2, m0Yoy: d.M0_YOY, m1Yoy: d.M1_YOY, m2Yoy: d.M2_YOY }))
    } catch { moneySupply.value = generateMockMoneySupply() }
  }

  async function fetchSocialFinance() {
    try {
      const startDate = recentMonths(24)[0]
      const result = await MacroDataAPI.queryPivot('monthly', ['SF_NEW', 'SF_STOCK', 'SF_YOY'], startDate)
      socialFinance.value = pivotMonthly(result.dates, result.series, ['SF_NEW', 'SF_STOCK', 'SF_YOY'])
        .map((d: any) => ({ date: d.date, newAmount: d.SF_NEW, stockAmount: d.SF_STOCK, yoyGrowth: d.SF_YOY }))
    } catch { socialFinance.value = generateMockSocialFinance() }
  }

  async function fetchPmi() {
    try {
      const startDate = recentMonths(24)[0]
      const result = await MacroDataAPI.queryPivot('monthly', ['PMI_MFG', 'PMI_NONMFG', 'PMI_COMP'], startDate)
      pmi.value = pivotMonthly(result.dates, result.series, ['PMI_MFG', 'PMI_NONMFG', 'PMI_COMP'])
        .map((d: any) => ({ date: d.date, manufacturing: d.PMI_MFG, nonManufacturing: d.PMI_NONMFG, composite: d.PMI_COMP }))
    } catch { pmi.value = generateMockPmi() }
  }

  async function fetchPriceIndex() {
    try {
      const startDate = recentMonths(24)[0]
      const result = await MacroDataAPI.queryPivot('monthly', ['CPI_YOY', 'PPI_YOY', 'CPI_MOM', 'PPI_MOM'], startDate)
      priceIndex.value = pivotMonthly(result.dates, result.series, ['CPI_YOY', 'PPI_YOY', 'CPI_MOM', 'PPI_MOM'])
        .map((d: any) => ({ date: d.date, cpi: d.CPI_YOY, ppi: d.PPI_YOY, cpiMom: d.CPI_MOM, ppiMom: d.PPI_MOM }))
    } catch { priceIndex.value = generateMockPriceIndex() }
  }

  async function fetchLpr() {
    try {
      const startDate = recentMonths(24)[0]
      const result = await MacroDataAPI.queryPivot('monthly', ['LPR_1Y', 'LPR_5Y'], startDate)
      lpr.value = pivotMonthly(result.dates, result.series, ['LPR_1Y', 'LPR_5Y'])
        .map((d: any) => ({ date: d.date, lpr1y: d.LPR_1Y, lpr5y: d.LPR_5Y }))
    } catch { lpr.value = generateMockLpr() }
  }

  async function fetchOfficialReserves() {
    try {
      const startDate = recentMonths(24)[0]
      const codes = ['FOREX_USD', 'FOREX_SDR', 'FOREX_CHG', 'IMF_USD', 'SDR_USD', 'GOLD_USD', 'GOLD_SDR', 'GOLD_OZ', 'GOLD_CHG', 'TOTAL_USD', 'TOTAL_SDR']
      const result = await MacroDataAPI.queryPivot('monthly', codes, startDate)
      officialReserves.value = pivotMonthly(result.dates, result.series, codes)
        .map((d: any) => ({
          date: d.date, forexUsd: d.FOREX_USD, forexSdr: d.FOREX_SDR, forexChange: d.FOREX_CHG,
          imfUsd: d.IMF_USD, sdrUsd: d.SDR_USD, goldUsd: d.GOLD_USD, goldSdr: d.GOLD_SDR,
          goldOz: d.GOLD_OZ, goldChange: d.GOLD_CHG, otherUsd: 0, totalUsd: d.TOTAL_USD, totalSdr: d.TOTAL_SDR,
        }))
    } catch { officialReserves.value = generateMockOfficialReserves() }
  }

  async function fetchNewLoans() {
    try {
      const startDate = recentMonths(24)[0]
      const result = await MacroDataAPI.queryPivot('monthly', ['LOAN_NEW', 'LOAN_YOY'], startDate)
      newLoans.value = pivotMonthly(result.dates, result.series, ['LOAN_NEW', 'LOAN_YOY'])
        .map((d: any) => ({ date: d.date, newAmount: d.LOAN_NEW, yoyChange: d.LOAN_YOY }))
    } catch { newLoans.value = generateMockNewLoans() }
  }

  async function fetchShibor() {
    try {
      const now = new Date()
      const startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const result = await MacroDataAPI.queryPivot('daily', ['SHIBOR_ON', 'SHIBOR_1W', 'SHIBOR_1M', 'SHIBOR_1Y'], formatDate(startDate))
      shibor.value = pivotMonthly(result.dates, result.series, ['SHIBOR_ON', 'SHIBOR_1W', 'SHIBOR_1M', 'SHIBOR_1Y'])
        .map((d: any) => ({ date: d.date, overnight: d.SHIBOR_ON, w1: d.SHIBOR_1W, m1: d.SHIBOR_1M, y1: d.SHIBOR_1Y }))
    } catch { shibor.value = generateMockShibor() }
  }

  async function fetchAccountOpenings() {
    try {
      const now = new Date()
      const startDate = new Date(now.getTime() - 24 * 7 * 24 * 60 * 60 * 1000)
      const result = await MacroDataAPI.queryPivot('weekly', ['NEW_INVEST', 'TOTAL_INVEST'], formatDate(startDate))
      accountOpenings.value = pivotMonthly(result.dates, result.series, ['NEW_INVEST', 'TOTAL_INVEST'])
        .map((d: any) => ({ date: d.date, newInvestors: d.NEW_INVEST, totalInvestors: d.TOTAL_INVEST }))
    } catch { accountOpenings.value = generateMockAccountOpenings() }
  }

  async function fetchMarginTrading() {
    try {
      const now = new Date()
      const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30)
      const result = await MacroDataAPI.queryPivot('daily', ['MARGIN_BUY', 'SHORT_SELL', 'MARGIN_TOTAL'], formatDate(startDate))
      marginTrading.value = pivotMonthly(result.dates, result.series, ['MARGIN_BUY', 'SHORT_SELL', 'MARGIN_TOTAL'])
        .map((d: any) => ({ date: d.date, marginBuy: d.MARGIN_BUY, shortSell: d.SHORT_SELL, total: d.MARGIN_TOTAL }))
    } catch { marginTrading.value = generateMockMarginTrading() }
  }

  async function fetchKpi() {
    try {
      const startDate = recentMonths(3)[0]
      const result = await MacroDataAPI.queryPivot('monthly', ['M2_YOY', 'SF_YOY', 'PMI_MFG', 'CPI_YOY', 'LPR_1Y', 'FOREX_USD', 'GOLD_OZ'], startDate)
      const dates = result.dates
      const s = result.series
      const latestIdx = dates.length - 1
      const prevIdx = Math.max(0, latestIdx - 1)
      kpiList.value = [
        { label: 'M2 同比增速', value: (s.M2_YOY?.[latestIdx] ?? 0) + '%', change: +((s.M2_YOY?.[latestIdx] ?? 0) - (s.M2_YOY?.[prevIdx] ?? 0)).toFixed(1), unit: '%', icon: 'Money', color: '#409EFF' },
        { label: '社融存量增速', value: (s.SF_YOY?.[latestIdx] ?? 0) + '%', change: +((s.SF_YOY?.[latestIdx] ?? 0) - (s.SF_YOY?.[prevIdx] ?? 0)).toFixed(1), unit: '%', icon: 'Coin', color: '#67C23A' },
        { label: '制造业 PMI', value: String(s.PMI_MFG?.[latestIdx] ?? 0), change: +((s.PMI_MFG?.[latestIdx] ?? 0) - (s.PMI_MFG?.[prevIdx] ?? 0)).toFixed(1), unit: '', icon: 'TrendCharts', color: (s.PMI_MFG?.[latestIdx] ?? 0) >= 50 ? '#67C23A' : '#F56C6C' },
        { label: 'CPI 同比', value: (s.CPI_YOY?.[latestIdx] ?? 0) + '%', change: +((s.CPI_YOY?.[latestIdx] ?? 0) - (s.CPI_YOY?.[prevIdx] ?? 0)).toFixed(1), unit: '%', icon: 'DataLine', color: '#E6A23C' },
        { label: '1年期 LPR', value: (s.LPR_1Y?.[latestIdx] ?? 0) + '%', change: +((s.LPR_1Y?.[latestIdx] ?? 0) - (s.LPR_1Y?.[prevIdx] ?? 0)).toFixed(2), unit: '%', icon: 'Histogram', color: '#F56C6C' },
        { label: '外汇储备', value: ((s.FOREX_USD?.[latestIdx] ?? 0) / 10000).toFixed(2) + '万亿', change: 0, unit: '亿美元', icon: 'Wallet', color: '#909399' },
        { label: '黄金储备', value: (s.GOLD_OZ?.[latestIdx] ?? 0) + '万盎司', change: 0, unit: '万盎司', icon: 'FirstAidKit', color: '#E6A23C' },
        { label: '月度新开户', value: '—', change: 0, unit: '万人', icon: 'User', color: '#9C27B0' },
      ]
    } catch { /* 保持默认空列表 */ }
  }

  // ===== 工作台全量加载 =====
  async function loadAll() {
    loading.value = true
    await Promise.all([
      fetchKpi(),
      fetchMoneySupply(),
      fetchSocialFinance(),
      fetchPmi(),
      fetchPriceIndex(),
      fetchLpr(),
      fetchOfficialReserves(),
      fetchAccountOpenings(),
      fetchMarginTrading(),
    ])
    loading.value = false
  }

  /** 取最新一条 & 上一条 */
  const latest = <T extends { date: string }>(arr: T[]) => tail(arr)[0]
  const prev = <T extends { date: string }>(arr: T[]) => tail(arr, 2)[0]
  const diff = (cur: number | undefined, prv: number | undefined) =>
    cur != null && prv != null ? +(cur - prv).toFixed(1) : 0

  return {
    loading,
    // 数据
    kpiList, moneySupply, socialFinance, pmi, priceIndex, lpr,
    officialReserves, newLoans, shibor, accountOpenings, marginTrading,
    // 方法
    fetchKpi, 
    fetchMoneySupply, 
    fetchSocialFinance, 
    fetchPmi, 
    fetchPriceIndex, 
    fetchLpr, 
    fetchOfficialReserves, 
    fetchNewLoans, 
    fetchShibor, 
    fetchAccountOpenings, 
    fetchMarginTrading, 
    loadAll,
    // 工具
    latest, prev, diff,
  }
}
