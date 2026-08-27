/**
 * 货币供应量看板 — ECharts 图表配置
 * 7 个图表的配置工厂函数，接收数据返回 EChartsOption
 */
import type { EChartsOption } from 'echarts'
import type {
  MoneySupplyTrend,
  MoneySupplyScissors,
  MoneySupplyStructure,
  ScissorsVsStock,
  M2VsCpi,
  SocialFinanceVsM2,
} from '@/api/macroData/types'

// ==================== 公共样式常量 ====================

const COLORS = {
  blue: '#409EFF',
  green: '#67C23A',
  orange: '#E6A23C',
  red: '#F56C6C',
  gray: '#909399',
  blueLight: 'rgba(64,158,255,0.15)',
  greenLight: 'rgba(103,194,58,0.15)',
  orangeLight: 'rgba(230,162,60,0.15)',
} as const

/** 通用 tooltip 样式 */
const axisTooltip = {
  trigger: 'axis' as const,
  backgroundColor: 'rgba(255,255,255,0.98)',
  borderColor: '#ebeef5',
  borderWidth: 1,
  textStyle: { color: '#303133', fontSize: 13 },
  axisPointer: { type: 'cross' as const, crossStyle: { color: '#999' } },
}

/** 通用 x 轴样式 */
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

/** 通用数值轴样式 */
function valueAxis(name?: string, position: 'left' | 'right' = 'left') {
  return {
    type: 'value' as const,
    name,
    position,
    nameTextStyle: { color: '#909399', fontSize: 12, padding: position === 'left' ? [0, 40, 0, 0] : [0, 0, 0, 40] },
    splitLine: { lineStyle: { type: 'dashed' as const, color: '#f0f0f0' } },
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { color: '#909399', fontSize: 11 },
  }
}

/** 通用 legend 样式 */
function legend(data: string[]) {
  return {
    data,
    top: 8,
    icon: 'circle',
    itemGap: 16,
    itemWidth: 10,
    itemHeight: 10,
    textStyle: { color: '#606266', fontSize: 12 },
  }
}

/** 渐变面积填充 */
function areaGradient(color: string) {
  return {
    color: {
      type: 'linear' as const,
      x: 0, y: 0, x2: 0, y2: 1,
      colorStops: [
        { offset: 0, color: color.replace(')', ',0.25)').replace('rgb', 'rgba') },
        { offset: 1, color: color.replace(')', ',0.02)').replace('rgb', 'rgba') },
      ],
    },
  }
}

// ==================== 图表配置工厂 ====================

/**
 * 2-1. 双Y轴：余额（左轴）+ 同比增速（右轴）
 * 实线=余额，虚线=增速；面积渐增
 */
export function useBalanceYoyOption(trend: MoneySupplyTrend | null): EChartsOption {
  if (!trend) return {}
  const { dates, m0, m1, m2, m0Yoy, m1Yoy, m2Yoy } = trend
  return {
    tooltip: axisTooltip,
    legend: legend(['M0', 'M1', 'M2', 'M0 同比', 'M1 同比', 'M2 同比']),
    grid: { left: 65, right: 65, top: 55, bottom: 30 },
    xAxis: categoryAxis(dates),
    yAxis: [
      valueAxis('万亿元', 'left'),
      valueAxis('%', 'right'),
    ],
    series: [
      { name: 'M0', type: 'line', data: m0, smooth: 0.3, symbol: 'none', lineStyle: { width: 2.5 }, itemStyle: { color: COLORS.blue }, areaStyle: areaGradient('rgb(64,158,255)') },
      { name: 'M1', type: 'line', data: m1, smooth: 0.3, symbol: 'none', lineStyle: { width: 2.5 }, itemStyle: { color: COLORS.green }, areaStyle: areaGradient('rgb(103,194,58)') },
      { name: 'M2', type: 'line', data: m2, smooth: 0.3, symbol: 'none', lineStyle: { width: 2.5 }, itemStyle: { color: COLORS.orange }, areaStyle: areaGradient('rgb(230,162,60)') },
      { name: 'M0 同比', type: 'line', yAxisIndex: 1, data: m0Yoy, smooth: 0.3, symbol: 'none', lineStyle: { width: 1.5, type: 'dashed' }, itemStyle: { color: COLORS.blue } },
      { name: 'M1 同比', type: 'line', yAxisIndex: 1, data: m1Yoy, smooth: 0.3, symbol: 'none', lineStyle: { width: 1.5, type: 'dashed' }, itemStyle: { color: COLORS.green } },
      { name: 'M2 同比', type: 'line', yAxisIndex: 1, data: m2Yoy, smooth: 0.3, symbol: 'none', lineStyle: { width: 1.5, type: 'dashed' }, itemStyle: { color: COLORS.orange } },
    ],
    animationDuration: 1200,
    animationEasing: 'cubicOut',
  }
}

/**
 * 2-2a. M1-M2 剪刀差柱状图
 * 色彩语义化：正=红（经济活跃），负=蓝（经济谨慎）
 */
export function useScissorsOption(scissors: MoneySupplyScissors | null): EChartsOption {
  if (!scissors) return {}
  const { dates, scissors: vals } = scissors
  return {
    tooltip: {
      ...axisTooltip,
      formatter(params: any) {
        const p = Array.isArray(params) ? params[0] : params
        const v = Number(p.value)
        const color = v >= 0 ? COLORS.red : COLORS.green
        const arrow = v >= 0 ? '↑' : '↓'
        return `<div style="font-size:13px">
          <span style="color:#909399">${p.axisValue}</span><br/>
          <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${color};margin-right:6px"></span>
          剪刀差：<b style="color:${color}">${v >= 0 ? '+' : ''}${v.toFixed(2)}%</b> ${arrow}
        </div>`
      },
    },
    grid: { left: 50, right: 20, top: 20, bottom: 30 },
    xAxis: categoryAxis(dates),
    yAxis: {
      ...valueAxis('%'),
      splitLine: { lineStyle: { type: 'dashed', color: '#f0f0f0' } },
    },
    series: [
      {
        name: '剪刀差',
        type: 'bar',
        data: vals.map((v) => ({
          value: +v.toFixed(2),
          itemStyle: {
            color: v >= 0
              ? { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#F56C6C' }, { offset: 1, color: '#fab6b6' }] }
              : { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#b3e19d' }, { offset: 1, color: '#67C23A' }] },
            borderRadius: v >= 0 ? [4, 4, 0, 0] : [0, 0, 4, 4],
          },
        })),
        barMaxWidth: 18,
        markLine: {
          silent: true,
          symbol: 'none',
          lineStyle: { type: 'dashed', color: '#dcdfe6' },
          data: [{ yAxis: 0 }],
          label: { show: false },
        },
      },
    ],
    animationDuration: 800,
  }
}

/**
 * 2-2b. 货币结构占比环形图
 */
export function useStructureOption(structure: MoneySupplyStructure | null): EChartsOption {
  if (!structure) return {}
  const { m0, m1, quasiM2, m0Pct, m1Pct, quasiPct } = structure
  return {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255,255,255,0.98)',
      borderColor: '#ebeef5',
      textStyle: { color: '#303133', fontSize: 13 },
      formatter: `{b}<br/>金额：<b>{c}</b> 万亿<br/>占比：<b>{d}%</b>`,
    },
    legend: {
      bottom: 12,
      icon: 'circle',
      itemWidth: 10,
      itemHeight: 10,
      textStyle: { color: '#606266', fontSize: 12 },
    },
    series: [
      {
        type: 'pie',
        radius: ['42%', '68%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 3,
          shadowBlur: 10,
          shadowColor: 'rgba(0,0,0,0.06)',
        },
        label: {
          show: true,
          formatter: '{b}\n{d}%',
          fontSize: 12,
          lineHeight: 18,
        },
        emphasis: {
          scaleSize: 6,
          label: { fontSize: 14, fontWeight: 'bold' },
        },
        data: [
          { value: +m0.toFixed(2), name: `M0 ${m0Pct}%`, itemStyle: { color: COLORS.blue } },
          { value: +m1.toFixed(2), name: `M1 ${m1Pct}%`, itemStyle: { color: COLORS.green } },
          { value: +quasiM2.toFixed(2), name: `准货币 ${quasiPct}%`, itemStyle: { color: COLORS.orange } },
        ],
      },
    ],
    animationDuration: 1000,
    animationEasing: 'cubicOut',
  }
}

/**
 * 3-1. 剪刀差 vs 上证指数（跨市场关联）
 */
export function useScissorsStockOption(data: ScissorsVsStock | null): EChartsOption {
  if (!data) return {}
  const { dates, scissors, stockIndex } = data
  return {
    tooltip: {
      ...axisTooltip,
      formatter(params: any) {
        const list = Array.isArray(params) ? params : [params]
        let html = `<div style="font-size:13px"><b style="color:#606266">${list[0].axisValue}</b><br/>`
        for (const p of list) {
          const color = p.color?.toString?.() ?? p.color
          const seriesName = p.seriesName
          let val = ''
          if (seriesName === '剪刀差') {
            const v = Number(p.value)
            val = `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`
          } else {
            val = Number(p.value).toLocaleString()
          }
          html += `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${color};margin-right:6px"></span>${seriesName}：<b>${val}</b><br/>`
        }
        return html + '</div>'
      },
    },
    legend: legend(['剪刀差', '上证指数']),
    grid: { left: 65, right: 65, top: 50, bottom: 30 },
    xAxis: categoryAxis(dates),
    yAxis: [
      valueAxis('剪刀差（%）', 'left'),
      valueAxis('点位', 'right'),
    ],
    series: [
      {
        name: '剪刀差',
        type: 'bar',
        data: scissors.map((v) => ({
          value: +v.toFixed(2),
          itemStyle: {
            color: v >= 0
              ? { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(245,108,108,0.7)' }, { offset: 1, color: 'rgba(245,108,108,0.2)' }] }
              : { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(103,194,58,0.2)' }, { offset: 1, color: 'rgba(103,194,58,0.7)' }] },
            borderRadius: v >= 0 ? [3, 3, 0, 0] : [0, 0, 3, 3],
          },
        })),
        barMaxWidth: 16,
        markLine: {
          silent: true,
          symbol: 'none',
          lineStyle: { type: 'dashed', color: '#dcdfe6' },
          data: [{ yAxis: 0 }],
          label: { show: false },
        },
      },
      {
        name: '上证指数',
        type: 'line',
        yAxisIndex: 1,
        data: stockIndex,
        smooth: 0.3,
        symbol: 'none',
        lineStyle: { width: 2, color: COLORS.gray },
        itemStyle: { color: COLORS.gray },
        areaStyle: areaGradient('rgb(144,147,153)'),
      },
    ],
    animationDuration: 1000,
  }
}

/**
 * 3-2. M2 增速 vs CPI / PPI
 */
export function useM2CpiOption(data: M2VsCpi | null): EChartsOption {
  if (!data) return {}
  const { dates, m2Yoy, cpiYoy, ppiYoy } = data
  return {
    tooltip: axisTooltip,
    legend: legend(['M2 同比', 'CPI 同比', 'PPI 同比']),
    grid: { left: 50, right: 20, top: 50, bottom: 30 },
    xAxis: categoryAxis(dates),
    yAxis: {
      ...valueAxis('%'),
      splitLine: { lineStyle: { type: 'dashed', color: '#f0f0f0' } },
    },
    series: [
      { name: 'M2 同比', type: 'line', data: m2Yoy, smooth: 0.3, symbol: 'none', lineStyle: { width: 2.5 }, itemStyle: { color: COLORS.blue }, areaStyle: areaGradient('rgb(64,158,255)') },
      { name: 'CPI 同比', type: 'line', data: cpiYoy, smooth: 0.3, symbol: 'none', lineStyle: { width: 2 }, itemStyle: { color: COLORS.orange }, areaStyle: areaGradient('rgb(230,162,60)') },
      { name: 'PPI 同比', type: 'line', data: ppiYoy, smooth: 0.3, symbol: 'none', lineStyle: { width: 2 }, itemStyle: { color: COLORS.red }, areaStyle: areaGradient('rgb(245,108,108)') },
    ],
    animationDuration: 1000,
  }
}

/**
 * 3-3. 社融增量 vs M2 增速
 */
export function useSfM2Option(data: SocialFinanceVsM2 | null): EChartsOption {
  if (!data) return {}
  const { dates, sfYoy, m2Yoy } = data
  return {
    tooltip: axisTooltip,
    legend: legend(['社融存量同比', 'M2 同比']),
    grid: { left: 50, right: 20, top: 50, bottom: 30 },
    xAxis: categoryAxis(dates),
    yAxis: {
      ...valueAxis('%'),
      splitLine: { lineStyle: { type: 'dashed', color: '#f0f0f0' } },
    },
    series: [
      { name: '社融存量同比', type: 'line', data: sfYoy, smooth: 0.3, symbol: 'none', lineStyle: { width: 2.5 }, itemStyle: { color: COLORS.green }, areaStyle: areaGradient('rgb(103,194,58)') },
      { name: 'M2 同比', type: 'line', data: m2Yoy, smooth: 0.3, symbol: 'none', lineStyle: { width: 2.5 }, itemStyle: { color: COLORS.blue }, areaStyle: areaGradient('rgb(64,158,255)') },
    ],
    animationDuration: 1000,
  }
}
