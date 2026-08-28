/**
 * 社会融资规模看板 — ECharts 图表配置工厂
 * 趋势图 / 结构百分比 / 结构面积 / 信用脉冲 / 宏观象限
 */
import type { EChartsOption } from 'echarts'
import type { SfTrend, SfStructure } from '@/api/macroData/financing/types'

// ==================== 公共样式常量 ====================

const COLORS = {
  blue: '#409EFF',
  green: '#67C23A',
  orange: '#E6A23C',
  red: '#F56C6C',
  gray: '#909399',
  purple: '#9B59B6',
  teal: '#1ABC9C',
  brown: '#E67E22',
  navy: '#2C3E50',
}

const axisTooltip = {
  trigger: 'axis' as const,
  backgroundColor: 'rgba(255,255,255,0.98)',
  borderColor: '#ebeef5',
  borderWidth: 1,
  textStyle: { color: '#303133', fontSize: 13 },
  axisPointer: { type: 'cross' as const, crossStyle: { color: '#999' } },
}

function categoryAxis(data: string[]) {
  return {
    type: 'category' as const,
    data,
    boundaryGap: false,
    axisLine: { lineStyle: { color: '#dcdfe6' } },
    axisTick: { show: false },
    axisLabel: { color: '#909399', fontSize: 11 },
  }
}

function valueAxis(name?: string, position: 'left' | 'right' = 'left') {
  return {
    type: 'value' as const,
    name,
    position,
    nameTextStyle: { color: '#909399', fontSize: 12, padding: position === 'left' ? [0, 40, 0, 0] : [0, 0, 0, 40] },
    splitLine: { lineStyle: { type: 'dashed' as const, color: '#f0f0f0' } },
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { 
      color: '#909399', 
      fontSize: 11, 
      margin: 12,
    },
  }
}

function legend(data: string[], opts?: Record<string, any>) {
  return { data, top: 8, icon: 'circle', itemGap: 16, itemWidth: 10, itemHeight: 10, textStyle: { color: '#606266', fontSize: 12 }, ...opts }
}

// ==================== 1. 趋势图：增量柱 + 同比线（双轴） ====================

export function useTrendOption(trend: SfTrend | null): EChartsOption {
  if (!trend) return {}
  const { dates, sfNew, sfYoy } = trend

  // 检测拐点
  const turningPoints: { coord: [string, number]; name: string; symbol: string }[] = []
  for (let i = 1; i < sfYoy.length - 1; i++) {
    if (sfYoy[i] > sfYoy[i - 1] && sfYoy[i] > sfYoy[i + 1]) {
      turningPoints.push({ coord: [dates[i], sfYoy[i]], name: '高点', symbol: 'pin' })
    } else if (sfYoy[i] < sfYoy[i - 1] && sfYoy[i] < sfYoy[i + 1]) {
      turningPoints.push({ coord: [dates[i], sfYoy[i]], name: '低点', symbol: 'triangle' })
    }
  }

  return {
    tooltip: {
      ...axisTooltip,
      formatter(params: any) {
        const list = Array.isArray(params) ? params : [params]
        let html = `<div style="font-size:13px"><b style="color:#606266">${list[0].axisValue}</b><br/>`
        for (const p of list) {
          const color = typeof p.color === 'string' ? p.color : (p.color?.colorStops?.[0]?.color ?? '#409EFF')
          if (p.seriesType === 'bar') {
            html += `<span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:${color};margin-right:6px"></span>${p.seriesName}：<b>${Number(p.value).toFixed(2)} 万亿</b><br/>`
          } else {
            html += `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${color};margin-right:6px"></span>${p.seriesName}：<b>${Number(p.value).toFixed(2)}%</b><br/>`
          }
        }
        return html + '</div>'
      },
    },
    legend: legend(['社融增量', '存量同比']),
    grid: { left: 80, right: 80, top: 55, bottom: 30, containLabel: false },
    xAxis: categoryAxis(dates),
    yAxis: [valueAxis('万亿元', 'left'), valueAxis('%', 'right')],
    series: [
      {
        name: '社融增量',
        type: 'bar',
        data: sfNew.map(v => +Number(v).toFixed(2)),
        itemStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: COLORS.blue }, { offset: 1, color: '#79bbff' }] }, borderRadius: [4, 4, 0, 0] },
        barMaxWidth: 20,
      },
      {
        name: '存量同比',
        type: 'line',
        yAxisIndex: 1,
        data: sfYoy.map(v => +Number(v).toFixed(2)),
        smooth: 0.3,
        symbol: 'none',
        lineStyle: { width: 2.5, color: COLORS.red },
        itemStyle: { color: COLORS.red },
        markLine: {
          silent: true, symbol: 'none', lineStyle: { type: 'dashed', color: '#dcdfe6' },
          data: [
            { yAxis: 8, label: { formatter: '信用紧缩线 8%', color: COLORS.gray, fontSize: 11 } },
            { yAxis: 10, label: { formatter: '信用扩张线 10%', color: COLORS.green, fontSize: 11 } },
          ],
        },
        markPoint: {
          data: turningPoints.map(tp => ({
            name: tp.name, coord: tp.coord, symbol: tp.symbol, symbolSize: 14,
            itemStyle: { color: tp.symbol === 'pin' ? COLORS.orange : COLORS.green },
            label: { show: false },
          })),
        },
      },
    ],
    animationDuration: 1200,
    animationEasing: 'cubicOut',
  }
}

// ==================== 2. 结构贡献图：百分比堆叠 3 大块 ====================

export function useStructurePieOption(structure: SfStructure | null): EChartsOption {
  if (!structure) return {}
  const { dates } = structure

  // 将8项合并为3大块：人民币贷款 / 政府债券 / 其他
  const loanArr = structure.rmblOan
  const govtArr = structure.govtBond
  const loanPct: number[] = []
  const govtPct: number[] = []
  const otherPct: number[] = []
  for (let i = 0; i < dates.length; i++) {
    const total = (loanArr[i] ?? 0) + (govtArr[i] ?? 0)
      + (structure.corpBond[i] ?? 0) + (structure.equity[i] ?? 0)
      + (structure.trustLoan[i] ?? 0) + (structure.entrustedLoan[i] ?? 0)
      + (structure.foreignLoan[i] ?? 0) + (structure.other[i] ?? 0)
    if (total > 0) {
      loanPct.push(+((loanArr[i] ?? 0) / total * 100).toFixed(1))
      govtPct.push(+((govtArr[i] ?? 0) / total * 100).toFixed(1))
      otherPct.push(+((total - (loanArr[i] ?? 0) - (govtArr[i] ?? 0)) / total * 100).toFixed(1))
    } else {
      loanPct.push(0); govtPct.push(0); otherPct.push(0)
    }
  }

  return {
    tooltip: {
      trigger: 'axis' as const, backgroundColor: 'rgba(255,255,255,0.98)', borderColor: '#ebeef5',
      textStyle: { color: '#303133', fontSize: 13 },
      formatter(params: any) {
        const list = Array.isArray(params) ? params : [params]
        let html = `<div style="font-size:13px"><b style="color:#606266">${list[0].axisValue}</b><br/>`
        for (const p of list) {
          const color = typeof p.color === 'string' ? p.color : (p.color?.colorStops?.[0]?.color ?? '#409EFF')
          html += `<span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:${color};margin-right:6px"></span>${p.seriesName}：<b>${p.value}%</b><br/>`
        }
        return html + '</div>'
      },
    },
    legend: legend(['人民币贷款', '政府债券', '其他融资']),
    grid: { left: 50, right: 20, top: 50, bottom: 30 },
    xAxis: { type: 'category' as const, data: dates, axisLine: { lineStyle: { color: '#dcdfe6' } }, axisTick: { show: false }, axisLabel: { color: '#909399', fontSize: 11, rotate: 30 } },
    yAxis: { type: 'value' as const, max: 100, axisLabel: { formatter: '{value}%', color: '#909399', fontSize: 11 }, splitLine: { lineStyle: { type: 'dashed', color: '#f0f0f0' } } },
    series: [
      { name: '人民币贷款', type: 'bar', stack: 'total', data: loanPct, itemStyle: { color: COLORS.blue }, barMaxWidth: 24 },
      { name: '政府债券', type: 'bar', stack: 'total', data: govtPct, itemStyle: { color: COLORS.green }, barMaxWidth: 24 },
      { name: '其他融资', type: 'bar', stack: 'total', data: otherPct, itemStyle: { color: COLORS.orange, borderRadius: [4, 4, 0, 0] }, barMaxWidth: 24 },
    ],
    animationDuration: 800,
  }
}

// ==================== 3. 融资方式拆解：堆叠面积图（存量8分项） ====================

const AREA_SERIES_CONFIG: { key: string; name: string; color: string }[] = [
  { key: 'sfStockRmbLoan', name: '人民币贷款', color: COLORS.blue },
  { key: 'sfStockGovtBond', name: '政府债券', color: COLORS.green },
  { key: 'sfStockCorpBond', name: '企业债券', color: COLORS.orange },
  { key: 'sfStockEquity', name: '股票融资', color: COLORS.red },
  { key: 'sfStockTrustLoan', name: '信托贷款', color: COLORS.purple },
  { key: 'sfStockEntrustedLoan', name: '委托贷款', color: COLORS.gray },
  { key: 'sfStockForeignLoan', name: '外币贷款', color: COLORS.teal },
  { key: 'sfStockOther', name: '其他(ABS等)', color: COLORS.brown },
]

export function useAreaOption(trend: SfTrend | null): EChartsOption {
  if (!trend) return {}
  const { dates } = trend

  return {
    tooltip: {
      ...axisTooltip,
      formatter(params: any) {
        const list = Array.isArray(params) ? params : [params]
        let html = `<div style="font-size:13px"><b style="color:#606266">${list[0].axisValue}</b><br/>`
        for (const p of list) {
          const v = Number(p.value)
          if (v === 0) continue
          const color = typeof p.color === 'string' ? p.color : (p.color?.colorStops?.[0]?.color ?? '#409EFF')
          html += `<span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:${color};margin-right:6px"></span>${p.seriesName}：<b>${v.toFixed(2)} 万亿</b><br/>`
        }
        return html + '</div>'
      },
    },
    legend: legend(AREA_SERIES_CONFIG.map(s => s.name), { top: 8, type: 'scroll' as const }),
    grid: { left: 60, right: 20, top: 50, bottom: 30 },
    xAxis: categoryAxis(dates),
    yAxis: { type: 'value' as const, name: '万亿元', nameTextStyle: { color: '#909399', fontSize: 12 }, splitLine: { lineStyle: { type: 'dashed', color: '#f0f0f0' } }, axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: '#909399', fontSize: 11 } },
    series: AREA_SERIES_CONFIG.map(s => ({
      name: s.name,
      type: 'line' as const,
      stack: 'stock',
      areaStyle: { opacity: 0.35 },
      emphasis: { focus: 'series' as const },
      smooth: 0.2,
      symbol: 'none',
      lineStyle: { width: 1.5, color: s.color },
      itemStyle: { color: s.color },
      data: ((trend as any)[s.key] as number[]).map(v => +Number(v).toFixed(2)),
    })),
    animationDuration: 1000,
  }
}

// ==================== 4. 信用脉冲图 ====================

export function useCreditImpulseOption(trend: SfTrend | null): EChartsOption {
  if (!trend) return {}
  const { dates, creditImpulse } = trend

  return {
    tooltip: {
      ...axisTooltip,
      formatter(params: any) {
        const p = Array.isArray(params) ? params[0] : params
        const v = Number(p.value)
        const color = v >= 0 ? COLORS.green : COLORS.red
        return `<div style="font-size:13px"><span style="color:#909399">${p.axisValue}</span><br/><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${color};margin-right:6px"></span>信用脉冲：<b style="color:${color}">${v >= 0 ? '+' : ''}${v.toFixed(2)}%</b> ${v >= 0 ? '↑' : '↓'}</div>`
      },
    },
    grid: { left: 55, right: 20, top: 20, bottom: 30 },
    xAxis: categoryAxis(dates),
    yAxis: { type: 'value' as const, splitLine: { lineStyle: { type: 'dashed', color: '#f0f0f0' } }, axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: '#909399', fontSize: 11, formatter: '{value}%' } },
    series: [{
      name: '信用脉冲', type: 'bar', barMaxWidth: 16,
      data: creditImpulse.map(v => ({
        value: +Number(v).toFixed(2),
        itemStyle: {
          color: Number(v) >= 0
            ? { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#67C23A' }, { offset: 1, color: '#b3e19d' }] }
            : { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#fab6b6' }, { offset: 1, color: '#F56C6C' }] },
          borderRadius: Number(v) >= 0 ? [4, 4, 0, 0] : [0, 0, 4, 4],
        },
      })),
      markLine: { silent: true, symbol: 'none', lineStyle: { type: 'dashed', color: '#dcdfe6' }, data: [{ yAxis: 0 }], label: { show: false } },
    }],
    animationDuration: 800,
  }
}

// ==================== 5. 宏观象限散点图 ====================

export function useQuadrantOption(trend: SfTrend | null): EChartsOption {
  if (!trend) return {}
  const { dates, sfYoy, m2Yoy } = trend
  if (!sfYoy.length) return {}

  const scatterData = dates.map((d, i) => ({
    value: [+Number(sfYoy[i]).toFixed(2), +Number(m2Yoy[i]).toFixed(2)],
    name: d,
  }))

  // 取最新点做特殊标注
  const latest = scatterData[scatterData.length - 1]

  // 象限中心线：社融 8%，M2 取数据中位数
  const sortedSf = [...sfYoy].sort((a, b) => Number(a) - Number(b))
  const centerX = Number(sortedSf[Math.floor(sortedSf.length / 2)]).toFixed(2)

  return {
    tooltip: {
      trigger: 'item' as const,
      backgroundColor: 'rgba(255,255,255,0.98)',
      borderColor: '#ebeef5',
      textStyle: { color: '#303133', fontSize: 13 },
      formatter(p: any) {
        return `<div style="font-size:13px"><b>${p.name}</b><br/>社融同比：<b>${p.value[0]}%</b><br/>M2同比：<b>${p.value[1]}%</b></div>`
      },
    },
    grid: { left: 60, right: 30, top: 40, bottom: 50 },
    xAxis: {
      type: 'value' as const, name: '社融存量同比(%)', nameLocation: 'middle', nameGap: 30,
      nameTextStyle: { color: '#606266', fontSize: 12 },
      splitLine: { lineStyle: { type: 'dashed', color: '#f0f0f0' } },
      axisLine: { lineStyle: { color: '#dcdfe6' } },
      axisLabel: { color: '#909399', fontSize: 11 },
    },
    yAxis: {
      type: 'value' as const, name: 'M2同比(%)', nameLocation: 'middle', nameGap: 40,
      nameTextStyle: { color: '#606266', fontSize: 12 },
      splitLine: { lineStyle: { type: 'dashed', color: '#f0f0f0' } },
      axisLine: { lineStyle: { color: '#dcdfe6' } },
      axisLabel: { color: '#909399', fontSize: 11 },
    },
    // 象限背景色块
    series: [{
      type: 'scatter',
      data: scatterData,
      symbolSize: (val: number[]) => {
        // 最新点放大
        return val[0] === latest.value[0] && val[1] === latest.value[1] ? 18 : 8
      },
      itemStyle: {
        color: (params: any) => {
          const [sf, m2] = params.value
          const cx = 8
          if (sf >= cx && m2 >= sf) return COLORS.orange   // 宽货币+宽信用：过热
          if (sf < cx && m2 >= sf) return COLORS.green     // 宽货币+紧信用：资产荒
          if (sf >= cx && m2 < sf) return COLORS.blue      // 紧货币+宽信用：复苏
          return COLORS.red                                 // 紧货币+紧信用：衰退
        },
      },
      emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.2)' } },
      label: {
        show: true,
        formatter: (p: any) => p.name === latest.name ? '当前' : '',
        position: 'right',
        fontSize: 11,
        color: '#303133',
      },
      // 象限区域标记线（社融 8% 垂直线）
      markLine: {
        silent: true, symbol: 'none',
        lineStyle: { type: 'dashed', color: '#dcdfe6', width: 1 },
        data: [{ xAxis: 8 }],
        label: { formatter: '信用分界 8%', color: COLORS.gray, fontSize: 10 },
      },
      // 象限文字注释
      markArea: {
        silent: true,
        data: [
          [{ coord: [8, Number(centerX)], itemStyle: { color: 'rgba(230,162,60,0.06)' } }, { coord: ['max', 'max'] }],
          [{ coord: [Number('-Infinity'), Number(centerX)], itemStyle: { color: 'rgba(103,194,58,0.06)' } }, { coord: [8, 'max'] }],
          [{ coord: [8, Number('-Infinity')], itemStyle: { color: 'rgba(64,158,255,0.06)' } }, { coord: ['max', Number(centerX)] }],
          [{ coord: [Number('-Infinity'), Number('-Infinity')], itemStyle: { color: 'rgba(245,108,108,0.06)' } }, { coord: [8, Number(centerX)] }],
        ],
      },
    }],
    // 四象限文字
    graphic: [
      { type: 'text' as const, left: '75%', top: '12%', style: { text: '宽货币+宽信用\n经济过热', fill: COLORS.orange, fontSize: 11 } },
      { type: 'text' as const, left: '15%', top: '12%', style: { text: '宽货币+紧信用\n利好债市', fill: COLORS.green, fontSize: 11 } },
      { type: 'text' as const, left: '75%', bottom: '18%', style: { text: '紧货币+宽信用\n股市黄金期', fill: COLORS.blue, fontSize: 11 } },
      { type: 'text' as const, left: '15%', bottom: '18%', style: { text: '紧货币+紧信用\n现金为王', fill: COLORS.red, fontSize: 11 } },
    ],
    animationDuration: 1200,
  }
}
