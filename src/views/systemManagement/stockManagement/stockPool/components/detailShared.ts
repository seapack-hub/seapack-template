import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'

/**
 * 金额格式化（SpTable column formatter）
 * >= 1亿 → "X.XX 亿"  >= 1万 → "X.XX 万"  否则 → "X.XX"
 */
export function fmtMoney(_: any, __: any, val: any) {
  if (val == null) return '-'
  const n = Number(val)
  if (Math.abs(n) >= 1e8) return `${(n / 1e8).toFixed(2)} 亿`
  if (Math.abs(n) >= 1e4) return `${(n / 1e4).toFixed(2)} 万`
  return n.toFixed(2)
}

/* ========== Mock 数据生成（API 不可用时的降级数据） ========== */

/** 生成本地模拟的历年每股股息数据 */
export function generateMockDividend() {
  const years = ['2024', '2023', '2022', '2021', '2020', '2019', '2018']
  return years.map(y => ({ year: y, dividendPerShare: +(0.5 + Math.random() * 2).toFixed(3) }))
}

/** 生成约 12 个均匀间隔的模拟股价数据点（避免横坐标过密） */
export function generateMockPrice() {
  const startPrice = 30 + Math.random() * 40
  const dates: string[] = []
  const prices: number[] = []
  let p = startPrice
  for (let i = 55; i >= 0; i -= 5) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    dates.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`)
    p = p * (1 + (Math.random() - 0.48) * 0.06)
    prices.push(+p.toFixed(2))
  }
  return dates.map((d, i) => ({ dataTime: d, currentPrice: prices[i] }))
}

/** 生成近 5 年三大财务报表的模拟数据，返回 { balance, income, cashflow } */
export function generateMockFinance(stockId: number) {
  const years = ['2023-12-31', '2022-12-31', '2021-12-31', '2020-12-31', '2019-12-31']
  return {
    balance: years.map(d => ({
      reportDate: d, stockId,
      totalAssets: 100 + Math.random() * 200,
      totalLiabilities: 30 + Math.random() * 80,
      totalEquity: 50 + Math.random() * 100,
      currentAssets: 40 + Math.random() * 100,
      nonCurrentAssets: 30 + Math.random() * 80,
      currentLiabilities: 15 + Math.random() * 40,
      nonCurrentLiabilities: 10 + Math.random() * 30,
      accountsReceivable: 5 + Math.random() * 20,
      inventory: 3 + Math.random() * 15,
      cashAndEquivalents: 10 + Math.random() * 50,
    })),
    income: years.map(d => ({
      reportDate: d, stockId,
      revenue: 20 + Math.random() * 100,
      costOfSales: 10 + Math.random() * 50,
      grossProfit: 8 + Math.random() * 40,
      operatingExpenses: 3 + Math.random() * 15,
      operatingProfit: 5 + Math.random() * 25,
      netProfit: 4 + Math.random() * 20,
      eps: 0.5 + Math.random() * 3,
    })),
    cashflow: years.map(d => ({
      reportDate: d, stockId,
      operatingCashFlow: 5 + Math.random() * 30,
      investingCashFlow: -(3 + Math.random() * 20),
      financingCashFlow: -(1 + Math.random() * 10),
      freeCashFlow: 2 + Math.random() * 15,
    })),
  }
}

/** 每股收益列格式化：保留 4 位小数 */
export function epsFormatter(_: any, __: any, v: any) {
  return v != null ? v.toFixed(4) : '-'
}

/* ========== ECharts 图表配置构建 ========== */

/** 历年分红折线图，x 轴为年份，y 轴为每股股息，蓝色渐变面积 */
export function buildDividendChartOption(data: any[]): EChartsOption {
  if (!data?.length) {
    data = generateMockDividend()
  }
  const years = data.map(d => d.year || d.dataTime?.slice(0, 4))
  const values = data.map(d => d.dividendPerShare ?? d.cashPerShare ?? 0)
  return {
    tooltip: { trigger: 'axis', valueFormatter: (v: any) => `${v} 元` },
    grid: { left: '8%', right: '6%', bottom: '15%', top: '10%' },
    xAxis: { type: 'category', data: years, axisLabel: { rotate: 30 } },
    yAxis: { type: 'value', name: '每股股息(元)' },
    series: [{
      type: 'line',
      data: values,
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: { color: '#409EFF', width: 2 },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(64,158,255,0.35)' },
          { offset: 1, color: 'rgba(64,158,255,0.02)' },
        ]),
      },
    }],
  }
}

/**
 * K 线图 + 成交量柱状图
 * data: StockHistoryData[] (tradeDate, openPrice, closePrice, highPrice, lowPrice, volume, turnover, amplitude)
 */
export function buildKLineChartOption(data: any[]): EChartsOption {
  if (!data?.length) return {}

  const dates = data.map(d => d.tradeDate)
  // candlestick 需要 [open, close, low, high] 顺序
  const ohlc = data.map(d => [d.openPrice, d.closePrice, d.lowPrice, d.highPrice])
  const volumes = data.map(d => d.volume)
  const turnovers = data.map(d => d.turnover)
  const amplitudes = data.map(d => d.amplitude)

  // 成交量颜色：涨红跌绿
  const volColors = data.map(d =>
    d.closePrice >= d.openPrice ? '#f56c6c' : '#67c23a'
  )

  // 计算成交量最大值用于 Y 轴刻度
  const maxVol = Math.max(...volumes, 1)

  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
      backgroundColor: 'rgba(255,255,255,0.95)',
      borderColor: '#ddd',
      borderWidth: 1,
      formatter: (params: any) => {
        const i = params[0]?.dataIndex ?? 0
        const d = data[i]
        if (!d) return ''
        const vol = d.volume >= 1e8
          ? (d.volume / 1e8).toFixed(2) + ' 亿'
          : d.volume >= 1e4
            ? (d.volume / 1e4).toFixed(2) + ' 万'
            : d.volume
        const turnover = d.turnover >= 1e8
          ? (d.turnover / 1e8).toFixed(2) + ' 亿'
          : d.turnover >= 1e4
            ? (d.turnover / 1e4).toFixed(2) + ' 万'
            : d.turnover
        return `
          <b>${d.tradeDate}</b><br/>
          开盘: ${d.openPrice?.toFixed(2)} 元<br/>
          收盘: ${d.closePrice?.toFixed(2)} 元<br/>
          最高: ${d.highPrice?.toFixed(2)} 元<br/>
          最低: ${d.lowPrice?.toFixed(2)} 元<br/>
          成交量: ${vol} 股<br/>
          成交额: ${turnover} 元<br/>
          振幅: ${d.amplitude?.toFixed(2)}%
        `
      },
    },
    grid: [
      { left: '8%', right: '6%', top: '6%', height: '55%' },
      { left: '8%', right: '6%', top: '72%', height: '18%' },
    ],
    xAxis: [
      {
        type: 'category',
        data: dates,
        axisLabel: { rotate: 30, fontSize: 10 },
        gridIndex: 0,
        axisLine: { onZero: false },
        splitLine: { show: false },
      },
      {
        type: 'category',
        data: dates,
        axisLabel: { show: false },
        gridIndex: 1,
        splitLine: { show: false },
      },
    ],
    yAxis: [
      {
        type: 'value',
        scale: true,
        gridIndex: 0,
        splitNumber: 4,
        axisLabel: {
          formatter: (v: number) => v.toFixed(0),
        },
      },
      {
        type: 'value',
        gridIndex: 1,
        splitNumber: 2,
        axisLabel: {
          formatter: (v: number) => {
            if (v >= 1e8) return (v / 1e8).toFixed(0) + '亿'
            if (v >= 1e4) return (v / 1e4).toFixed(0) + '万'
            return v
          },
        },
        max: maxVol * 4,
      },
    ],
    series: [
      {
        name: 'K 线',
        type: 'candlestick',
        xAxisIndex: 0,
        yAxisIndex: 0,
        data: ohlc,
        itemStyle: {
          color: '#f56c6c',
          color0: '#67c23a',
          borderColor: '#f56c6c',
          borderColor0: '#67c23a',
        },
      },
      {
        name: '成交量',
        type: 'bar',
        xAxisIndex: 1,
        yAxisIndex: 1,
        data: volumes.map((v, i) => ({ value: v, itemStyle: { color: volColors[i] } })),
      },
    ],
  }
}

/* ========== 财务报表对应变迁柱状图 ========== */

/** 资产负债表变迁图：总资产、总负债、净资产 分组柱状图 */
export function buildBalanceChartOption(data: any[]): EChartsOption {
  const years = data.map(d => d.reportDate?.slice(0, 4) || '')
  return {
    tooltip: { trigger: 'axis' },
    grid: { left: '10%', right: '6%', bottom: '15%', top: '10%' },
    xAxis: { type: 'category', data: years, axisLabel: { rotate: 30 } },
    yAxis: { type: 'value', name: '金额' },
    series: [
      { name: '总资产', type: 'bar', data: data.map(d => d.totalAssets), itemStyle: { color: '#409EFF' } },
      { name: '总负债', type: 'bar', data: data.map(d => d.totalLiabilities), itemStyle: { color: '#e6a23c' } },
      { name: '净资产', type: 'bar', data: data.map(d => d.totalEquity), itemStyle: { color: '#67c23a' } },
    ],
  }
}

/** 利润表变迁图：营业收入、净利润 双柱图 */
export function buildIncomeChartOption(data: any[]): EChartsOption {
  const years = data.map(d => d.reportDate?.slice(0, 4) || '')
  return {
    tooltip: { trigger: 'axis' },
    grid: { left: '10%', right: '6%', bottom: '15%', top: '10%' },
    xAxis: { type: 'category', data: years, axisLabel: { rotate: 30 } },
    yAxis: { type: 'value', name: '金额' },
    series: [
      { name: '营业收入', type: 'bar', data: data.map(d => d.revenue), itemStyle: { color: '#409EFF' } },
      { name: '净利润', type: 'bar', data: data.map(d => d.netProfit), itemStyle: { color: '#67c23a' } },
    ],
  }
}

/** 现金流量表变迁图：经营/投资/筹资 三柱图 */
export function buildCashflowChartOption(data: any[]): EChartsOption {
  const years = data.map(d => d.reportDate?.slice(0, 4) || '')
  return {
    tooltip: { trigger: 'axis' },
    grid: { left: '10%', right: '6%', bottom: '15%', top: '10%' },
    xAxis: { type: 'category', data: years, axisLabel: { rotate: 30 } },
    yAxis: { type: 'value', name: '金额' },
    series: [
      { name: '经营活动', type: 'bar', data: data.map(d => d.operatingCashFlow), itemStyle: { color: '#409EFF' } },
      { name: '投资活动', type: 'bar', data: data.map(d => d.investingCashFlow), itemStyle: { color: '#e6a23c' } },
      { name: '筹资活动', type: 'bar', data: data.map(d => d.financingCashFlow), itemStyle: { color: '#f56c6c' } },
    ],
  }
}

/* ========== 三大财务报表 SpTable 列定义 ========== */

/** 资产负债表列：报告期 + 资产/负债/权益类 10 列 */
export const balanceColumns = [
  { label: '报告期', prop: 'reportDate', width: 120 },
  { label: '总资产', prop: 'totalAssets', width: 140, formatter: fmtMoney },
  { label: '总负债', prop: 'totalLiabilities', width: 140, formatter: fmtMoney },
  { label: '净资产', prop: 'totalEquity', width: 140, formatter: fmtMoney },
  { label: '流动资产', prop: 'currentAssets', width: 140, formatter: fmtMoney },
  { label: '非流动资产', prop: 'nonCurrentAssets', width: 140, formatter: fmtMoney },
  { label: '流动负债', prop: 'currentLiabilities', width: 140, formatter: fmtMoney },
  { label: '应收账款', prop: 'accountsReceivable', width: 140, formatter: fmtMoney },
  { label: '存货', prop: 'inventory', width: 140, formatter: fmtMoney },
  { label: '货币资金', prop: 'cashAndEquivalents', width: 140, formatter: fmtMoney },
]

/** 利润表列：报告期 + 收入/成本/利润类 8 列 */
export const incomeColumns = [
  { label: '报告期', prop: 'reportDate', width: 120 },
  { label: '营业收入', prop: 'revenue', width: 140, formatter: fmtMoney },
  { label: '营业成本', prop: 'costOfSales', width: 140, formatter: fmtMoney },
  { label: '毛利', prop: 'grossProfit', width: 140, formatter: fmtMoney },
  { label: '营业费用', prop: 'operatingExpenses', width: 140, formatter: fmtMoney },
  { label: '营业利润', prop: 'operatingProfit', width: 140, formatter: fmtMoney },
  { label: '净利润', prop: 'netProfit', width: 140, formatter: fmtMoney },
  { label: '每股收益', prop: 'eps', width: 110, align: 'right', formatter: epsFormatter },
]

/** 现金流量表列：报告期 + 三大现金流 + 自由现金流 5 列 */
export const cashflowColumns = [
  { label: '报告期', prop: 'reportDate', width: 120 },
  { label: '经营活动现金流', prop: 'operatingCashFlow', width: 160, formatter: fmtMoney },
  { label: '投资活动现金流', prop: 'investingCashFlow', width: 160, formatter: fmtMoney },
  { label: '筹资活动现金流', prop: 'financingCashFlow', width: 160, formatter: fmtMoney },
  { label: '自由现金流', prop: 'freeCashFlow', width: 160, formatter: fmtMoney },
]
