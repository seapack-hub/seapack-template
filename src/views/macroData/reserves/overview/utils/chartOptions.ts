/**
 * 储备资产看板 — ECharts 图表配置工厂
 * 趋势图 / 构成图 / 黄金分析 / 去美元化
 */
import type { EChartsOption } from 'echarts'
import type { RaTrend } from '@/api/macroData/reserves/types'

const COLORS = {
  blue: '#409EFF',
  green: '#67C23A',
  orange: '#E6A23C',
  red: '#F56C6C',
  gold: '#E6A23C',
  navy: '#4E79A7',
  teal: '#59A14F',
  gray: '#909399',
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
    nameTextStyle: { color: '#909399', fontSize: 12, padding: position === 'left' ? [0, 30, 0, 0] : [0, 0, 0, 30] },
    splitLine: { lineStyle: { type: 'dashed' as const, color: '#f0f0f0' } },
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { color: '#909399', fontSize: 11 },
  }
}

function legend(data: string[]) {
  return { data, top: 8, icon: 'circle', itemGap: 16, itemWidth: 10, itemHeight: 10, textStyle: { color: '#606266', fontSize: 12 } }
}

/** 计算移动平均 */
function movingAvg(arr: number[], window = 3): (number | null)[] {
  return arr.map((_, i) => {
    if (i < window - 1) return null
    const slice = arr.slice(i - window + 1, i + 1)
    return +(slice.reduce((a, b) => a + b, 0) / window).toFixed(2)
  })
}

// ==================== 1. 外汇储备趋势图（双Y轴 + 事件标注） ====================

export function useForexTrendOption(trend: RaTrend | null): EChartsOption {
  if (!trend) return {}
  const { dates, forexUsd } = trend
  const ma3 = movingAvg(forexUsd, 3)

  const events = [
    { xAxis: '2018-03', label: { formatter: '中美贸易战', fontSize: 10 }, symbol: 'pin', symbolSize: 12, itemStyle: { color: COLORS.red } },
    { xAxis: '2020-02', label: { formatter: '新冠疫情', fontSize: 10 }, symbol: 'pin', symbolSize: 12, itemStyle: { color: COLORS.red } },
    { xAxis: '2022-03', label: { formatter: '美联储加息', fontSize: 10 }, symbol: 'pin', symbolSize: 12, itemStyle: { color: COLORS.orange } },
    { xAxis: '2024-10', label: { formatter: '增持黄金', fontSize: 10 }, symbol: 'pin', symbolSize: 12, itemStyle: { color: COLORS.gold } },
  ]

  return {
    tooltip: axisTooltip,
    legend: legend(['外汇储备', '3月均线']),
    grid: { left: 80, right: 80, top: 55, bottom: 30, containLabel: false },
    xAxis: categoryAxis(dates),
    yAxis: [
      valueAxis('亿美元', 'left'),
      valueAxis('亿美元(MA)', 'right'),
    ],
    dataZoom: [{ type: 'inside', start: 0, end: 100 }],
    series: [
      {
        name: '外汇储备',
        type: 'line',
        data: forexUsd.map(v => +v.toFixed(2)),
        smooth: 0.2,
        symbol: 'none',
        lineStyle: { width: 2.5, color: COLORS.blue },
        itemStyle: { color: COLORS.blue },
        areaStyle: {
          color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [{ offset: 0, color: 'rgba(64,158,255,0.2)' }, { offset: 1, color: 'rgba(64,158,255,0.02)' }] },
        },
        markPoint: { data: events.map(e => ({ ...e, name: e.label.formatter } as any)), label: { show: true, position: 'top', fontSize: 10 } },
      },
      {
        name: '3月均线',
        type: 'line',
        yAxisIndex: 1,
        data: ma3,
        smooth: 0.3,
        symbol: 'none',
        lineStyle: { width: 1.5, type: 'dashed', color: COLORS.orange },
        itemStyle: { color: COLORS.orange },
      },
    ],
    animationDuration: 1200,
  }
}

// ==================== 2. 储备资产构成（堆叠面积 + 饼图） ====================

export function useCompositionAreaOption(trend: RaTrend | null): EChartsOption {
  if (!trend) return {}
  const { dates, forexUsd, imfUsd, sdrUsd, goldUsd } = trend
  return {
    tooltip: { ...axisTooltip, trigger: 'axis' },
    legend: legend(['外汇储备', 'IMF头寸', 'SDR', '黄金价值']),
    grid: { left: 80, right: 20, top: 55, bottom: 30, containLabel: false },
    xAxis: categoryAxis(dates),
    yAxis: valueAxis('亿美元'),
    series: [
      { name: '外汇储备', type: 'line', stack: 'total', data: forexUsd.map(v => +v.toFixed(2)), symbol: 'none', lineStyle: { width: 0 }, areaStyle: { opacity: 0.35 }, itemStyle: { color: COLORS.navy } },
      { name: 'IMF头寸', type: 'line', stack: 'total', data: imfUsd.map(v => +v.toFixed(2)), symbol: 'none', lineStyle: { width: 0 }, areaStyle: { opacity: 0.35 }, itemStyle: { color: COLORS.teal } },
      { name: 'SDR', type: 'line', stack: 'total', data: sdrUsd.map(v => +v.toFixed(2)), symbol: 'none', lineStyle: { width: 0 }, areaStyle: { opacity: 0.35 }, itemStyle: { color: COLORS.orange } },
      { name: '黄金价值', type: 'line', stack: 'total', data: goldUsd.map(v => +v.toFixed(2)), symbol: 'none', lineStyle: { width: 0 }, areaStyle: { opacity: 0.35 }, itemStyle: { color: COLORS.gold } },
    ],
    animationDuration: 1000,
  }
}

export function useCompositionPieOption(trend: RaTrend | null): EChartsOption {
  if (!trend) return {}
  const { forexUsd, imfUsd, sdrUsd, goldUsd } = trend
  const last = (arr: number[]) => arr.length ? arr[arr.length - 1] : 0
  const total = last(forexUsd) + last(imfUsd) + last(sdrUsd) + last(goldUsd)
  return {
    tooltip: { trigger: 'item', backgroundColor: 'rgba(255,255,255,0.98)', borderColor: '#ebeef5', textStyle: { color: '#303133', fontSize: 13 }, formatter: '{b}: {c} ({d}%)' },
    legend: { bottom: 8, icon: 'circle', itemWidth: 10, itemHeight: 10, textStyle: { color: '#606266', fontSize: 11 } },
    series: [{
      type: 'pie',
      radius: ['40%', '65%'],
      center: ['50%', '42%'],
      avoidLabelOverlap: true,
      itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
      label: { show: true, formatter: '{b}\n{d}%', fontSize: 11, lineHeight: 16 },
      emphasis: { scaleSize: 6 },
      data: [
        { value: +last(forexUsd).toFixed(2), name: '外汇储备', itemStyle: { color: COLORS.navy } },
        { value: +last(imfUsd).toFixed(2), name: 'IMF头寸', itemStyle: { color: COLORS.teal } },
        { value: +last(sdrUsd).toFixed(2), name: 'SDR', itemStyle: { color: COLORS.orange } },
        { value: +last(goldUsd).toFixed(2), name: '黄金价值', itemStyle: { color: COLORS.gold } },
      ],
    }],
    graphic: [{ type: 'text', left: 'center', top: '38%', style: { text: (total / 10000).toFixed(2) + '\n万亿美元', fontSize: 14, fontWeight: 'bold', fill: '#303133', lineHeight: 22 } }],
    animationDuration: 800,
  }
}

// ==================== 3. 黄金分析（总量 + 月增量 + 价值 + 环比） ====================

export function useGoldAnalysisOption(trend: RaTrend | null): EChartsOption {
  if (!trend) return {}
  const { dates, goldOz, goldUsd } = trend

  // 月增量 = 当月 - 上月
  const monthlyIncr = goldOz.map((v, i) => i === 0 ? 0 : +(v - goldOz[i - 1]).toFixed(1))
  // 黄金价值环比变化率%
  const valueMoM = goldUsd.map((v, i) => {
    if (i === 0 || goldUsd[i - 1] === 0) return 0
    return +((v - goldUsd[i - 1]) / goldUsd[i - 1] * 100).toFixed(2)
  })

  // 检测增持/减持周期（月增量>=20万盎司视为增持信号）
  const markAreas: any[] = []
  let incStart = -1
  for (let i = 0; i < monthlyIncr.length; i++) {
    if (monthlyIncr[i] > 0 && incStart < 0) incStart = i
    if ((monthlyIncr[i] <= 0 || i === monthlyIncr.length - 1) && incStart >= 0) {
      const end = monthlyIncr[i] <= 0 ? i - 1 : i
      if (end - incStart >= 2) {
        markAreas.push([
          { xAxis: dates[incStart], itemStyle: { color: 'rgba(103,194,58,0.08)' } },
          { xAxis: dates[end] },
        ])
      }
      incStart = -1
    }
  }

  return {
    tooltip: {
      ...axisTooltip,
      formatter(params: any) {
        const list = Array.isArray(params) ? params : [params]
        let html = `<div style="font-size:13px"><b style="color:#606266">${list[0].axisValue}</b><br/>`
        for (const p of list) {
          const color = typeof p.color === 'string' ? p.color : (p.color?.colorStops?.[0]?.color ?? '#909399')
          let val = ''
          if (p.seriesName === '黄金储备') val = `${Number(p.value).toLocaleString()} 万盎司`
          else if (p.seriesName === '月增量') val = `${Number(p.value) >= 0 ? '+' : ''}${Number(p.value).toLocaleString()} 万盎司`
          else if (p.seriesName === '黄金价值') val = `${Number(p.value).toLocaleString()} 亿美元`
          else if (p.seriesName === '价值环比') val = `${Number(p.value) >= 0 ? '+' : ''}${Number(p.value)}%`
          html += `<span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:${color};margin-right:6px"></span>${p.seriesName}：<b>${val}</b><br/>`
        }
        return html + '</div>'
      },
    },
    legend: legend(['黄金储备', '月增量', '黄金价值', '价值环比']),
    grid: { left: 70, right: 70, top: 55, bottom: 30, containLabel: false },
    xAxis: categoryAxis(dates),
    yAxis: [
      { ...valueAxis('万盎司'), splitLine: { lineStyle: { type: 'dashed', color: '#f0f0f0' } } },
      { ...valueAxis('%'), splitLine: { show: false } },
    ],
    dataZoom: [{ type: 'inside', start: 0, end: 100 }],
    series: [
      {
        name: '黄金储备',
        type: 'line',
        data: goldOz.map(v => +v.toFixed(0)),
        symbol: 'none',
        lineStyle: { width: 2.5, color: COLORS.green },
        itemStyle: { color: COLORS.green },
        areaStyle: { opacity: 0.08, color: COLORS.green },
        markArea: { silent: true, data: markAreas },
      },
      {
        name: '月增量',
        type: 'bar',
        data: monthlyIncr.map(v => ({
          value: v,
          itemStyle: {
            color: v > 0
              ? { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(103,194,58,0.8)' }, { offset: 1, color: 'rgba(103,194,58,0.2)' }] }
              : v < 0 ? { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(245,108,108,0.2)' }, { offset: 1, color: 'rgba(245,108,108,0.8)' }] }
              : '#dcdfe6',
            borderRadius: v >= 0 ? [3, 3, 0, 0] : [0, 0, 3, 3],
          },
        })),
        barMaxWidth: 14,
        markLine: { silent: true, symbol: 'none', lineStyle: { type: 'dashed', color: '#dcdfe6' }, data: [{ yAxis: 0 }], label: { show: false } },
      },
      {
        name: '黄金价值',
        type: 'line',
        yAxisIndex: 1,
        data: goldUsd.map(v => +v.toFixed(2)),
        smooth: 0.3,
        symbol: 'none',
        lineStyle: { width: 2, color: COLORS.gold },
        itemStyle: { color: COLORS.gold },
      },
      {
        name: '价值环比',
        type: 'bar',
        yAxisIndex: 1,
        data: valueMoM.map(v => ({
          value: v,
          itemStyle: {
            color: v > 0
              ? { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(230,162,60,0.8)' }, { offset: 1, color: 'rgba(230,162,60,0.2)' }] }
              : v < 0 ? { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(245,108,108,0.2)' }, { offset: 1, color: 'rgba(245,108,108,0.8)' }] }
              : '#dcdfe6',
            borderRadius: v >= 0 ? [3, 3, 0, 0] : [0, 0, 3, 3],
          },
        })),
        barMaxWidth: 14,
        barGap: '-100%',
        z: 1,
      },
    ],
    animationDuration: 1200,
  }
}

// ==================== 4. 去美元化趋势图 ====================

export function useDeDollarOption(trend: RaTrend | null): EChartsOption {
  if (!trend) return {}
  const { dates, forexUsd, goldUsd } = trend

  // 黄金占比 = goldUsd / (forexUsd + imfUsd + sdrUsd + goldUsd)
  // 简化：外汇占比 ≈ forexUsd / total, 黄金占比 = goldUsd / total
  // 这里用简化近似
  const total = dates.map((_, i) => forexUsd[i] + goldUsd[i])
  const goldPct = dates.map((_, i) => total[i] > 0 ? +(goldUsd[i] / total[i] * 100).toFixed(2) : 0)
  const fxPct = dates.map((_, i) => total[i] > 0 ? +(forexUsd[i] / total[i] * 100).toFixed(2) : 0)

  // 黄金占比 > 10% 的区域高亮
  const highlightAreas: any[] = []
  let hStart = -1
  for (let i = 0; i < goldPct.length; i++) {
    if (goldPct[i] > 10 && hStart < 0) hStart = i
    if (goldPct[i] <= 10 && hStart >= 0) { highlightAreas.push([{ xAxis: dates[hStart], itemStyle: { color: 'rgba(230,162,60,0.08)' } }, { xAxis: dates[i - 1] }]); hStart = -1 }
  }
  if (hStart >= 0) highlightAreas.push([{ xAxis: dates[hStart], itemStyle: { color: 'rgba(230,162,60,0.08)' } }, { xAxis: dates[dates.length - 1] }])

  return {
    tooltip: axisTooltip,
    legend: legend(['黄金占比', '外汇占比']),
    grid: { left: 60, right: 20, top: 55, bottom: 30 },
    xAxis: categoryAxis(dates),
    yAxis: { ...valueAxis('%'), min: 0, max: 100 },
    dataZoom: [{ type: 'inside', start: 0, end: 100 }],
    series: [
      {
        name: '黄金占比',
        type: 'line',
        data: goldPct,
        smooth: 0.3,
        symbol: 'none',
        lineStyle: { width: 2.5, color: COLORS.gold },
        itemStyle: { color: COLORS.gold },
        areaStyle: { opacity: 0.1, color: COLORS.gold },
        markArea: { silent: true, data: highlightAreas },
        markLine: { silent: true, symbol: 'none', lineStyle: { type: 'dashed', color: '#dcdfe6' }, data: [{ yAxis: 10, label: { formatter: '结构转变线 10%', fontSize: 11 } }] },
      },
      {
        name: '外汇占比',
        type: 'line',
        data: fxPct,
        smooth: 0.3,
        symbol: 'none',
        lineStyle: { width: 2, color: COLORS.blue },
        itemStyle: { color: COLORS.blue },
        areaStyle: { opacity: 0.05, color: COLORS.blue },
      },
    ],
    animationDuration: 1200,
  }
}
