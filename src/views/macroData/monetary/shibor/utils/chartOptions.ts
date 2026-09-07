/**
 * SHIBOR 资金面看板 — ECharts 图表配置
 * 2 个图表：多期限趋势图 + 今日期限结构曲线
 */
import type { EChartsOption } from 'echarts'
import type { ShiborTrend, ShiborCurve } from '@/api/macroData/monetary/types'

// ==================== 公共样式常量 ====================

const COLORS = {
  on: '#FFD700',    // 隔夜 — 亮黄（资金面核心）
  w1: '#409EFF',    // 1周
  w2: '#67C23A',    // 2周
  m1: '#E6A23C',    // 1月
  m3: '#F56C6C',    // 3月
  m6: '#909399',    // 6月
  m9: '#b37feb',    // 9月
  y1: '#409EFF',    // 1年 — 蓝色（中期基准）
}

/** 8条线的配色与名称映射 */
const TENOR_SERIES = [
  { code: 'SHIBOR_ON', name: '隔夜(ON)', color: COLORS.on, width: 3 },
  { code: 'SHIBOR_1W', name: '1周', color: COLORS.w1, width: 1.5 },
  { code: 'SHIBOR_2W', name: '2周', color: COLORS.w2, width: 1.5 },
  { code: 'SHIBOR_1M', name: '1月', color: COLORS.m1, width: 1.5 },
  { code: 'SHIBOR_3M', name: '3月', color: COLORS.m3, width: 1.5 },
  { code: 'SHIBOR_6M', name: '6月', color: COLORS.m6, width: 1 },
  { code: 'SHIBOR_9M', name: '9月', color: COLORS.m9, width: 1 },
  { code: 'SHIBOR_1Y', name: '1年', color: COLORS.y1, width: 3 },
]

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
function valueAxis(name?: string) {
  return {
    type: 'value' as const,
    name,
    nameTextStyle: { color: '#909399', fontSize: 12 },
    splitLine: { lineStyle: { type: 'dashed' as const, color: '#f0f0f0' } },
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { color: '#909399', fontSize: 11 },
  }
}

// ==================== 图表配置工厂 ====================

/**
 * 1. 多期限趋势图（8条折线）
 * - 默认高亮隔夜(ON)和1年(Y1)，其余置灰
 * - dataZoom 缩放轴
 * - Tooltip 以列表展示8个品种
 */
export function useTrendOption(trend: ShiborTrend | null): EChartsOption {
  if (!trend?.dates?.length) return {}
  const { dates = [] } = trend

  return {
    tooltip: {
      ...axisTooltip,
      formatter(params: any) {
        const list = Array.isArray(params) ? params : [params]
        let html = `<div style="font-size:13px"><b style="color:#606266">${list[0].axisValue}</b><br/>`
        // 按值降序排列
        const sorted = [...list].sort((a, b) => Number(b.value) - Number(a.value))
        for (const p of sorted) {
          const color = p.color?.toString?.() ?? p.color
          html += `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${color};margin-right:6px"></span>${p.seriesName}：<b>${Number(p.value).toFixed(4)}%</b><br/>`
        }
        // 计算利差
        const onP = list.find((p: any) => p.seriesName === '隔夜(ON)')
        const y1P = list.find((p: any) => p.seriesName === '1年')
        if (onP && y1P) {
          const spread = (Number(y1P.value) - Number(onP.value)).toFixed(4)
          html += `<span style="color:#909399">──────────</span><br/>`
          html += `<span style="color:#E6A23C">期限利差(1Y-ON)：<b>${spread}%</b></span>`
        }
        return html + '</div>'
      },
    },
    legend: {
      data: TENOR_SERIES.map(s => s.name),
      top: 8,
      icon: 'circle',
      itemGap: 14,
      itemWidth: 10,
      itemHeight: 10,
      textStyle: { color: '#606266', fontSize: 12 },
      // 默认只高亮隔夜和1年
      selected: Object.fromEntries(
        TENOR_SERIES.map(s => [s.name, s.code === 'SHIBOR_ON' || s.code === 'SHIBOR_1Y'])
      ),
    },
    grid: { left: 55, right: 20, top: 55, bottom: 70 },
    xAxis: categoryAxis(dates),
    yAxis: valueAxis('%'),
    dataZoom: [
      { type: 'inside' as const, start: 70, end: 100 },
      { type: 'slider' as const, start: 70, end: 100, height: 24, bottom: 8 },
    ],
    series: TENOR_SERIES.map(s => ({
      name: s.name,
      type: 'line' as const,
      data: (trend as any)[s.code] as number[],
      smooth: 0.2,
      symbol: 'none',
      lineStyle: { width: s.width, color: s.color },
      itemStyle: { color: s.color },
      // 隔夜和1年不透明，其余半透明
      opacity: s.code === 'SHIBOR_ON' || s.code === 'SHIBOR_1Y' ? 1 : 0.5,
      large: true,
    })),
    animation: false,
  }
}

/**
 * 2. 今日期限结构曲线（柱状图）
 * X轴: 8个期限品种，Y轴: 最新利率
 */
export function useCurveOption(curve: ShiborCurve | null): EChartsOption {
  if (!curve?.values?.length) return {}
  const { labels = [], values = [] } = curve

  return {
    tooltip: {
      trigger: 'axis' as const,
      backgroundColor: 'rgba(255,255,255,0.98)',
      borderColor: '#ebeef5',
      textStyle: { color: '#303133', fontSize: 13 },
      formatter(params: any) {
        const p = Array.isArray(params) ? params[0] : params
        return `<div style="font-size:13px">
          <span style="color:#909399">${p.axisValue}</span><br/>
          <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${p.color};margin-right:6px"></span>
          利率：<b>${Number(p.value).toFixed(4)}%</b>
        </div>`
      },
    },
    grid: { left: 55, right: 20, top: 20, bottom: 30 },
    xAxis: {
      type: 'category' as const,
      data: labels,
      axisLine: { lineStyle: { color: '#dcdfe6' } },
      axisTick: { show: false },
      axisLabel: { color: '#606266', fontSize: 12, fontWeight: 500 },
    },
    yAxis: valueAxis('%'),
    series: [
      {
        type: 'bar' as const,
        data: values.map((v, i) => ({
          value: +Number(v).toFixed(4),
          itemStyle: {
            color: {
              type: 'linear' as const,
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: i <= 1 ? '#FFD700' : i <= 3 ? '#409EFF' : '#67C23A' },
                { offset: 1, color: i <= 1 ? '#ffe44d' : i <= 3 ? '#79bbff' : '#95d475' },
              ],
            },
            borderRadius: [4, 4, 0, 0],
          },
        })),
        barMaxWidth: 40,
        label: {
          show: true,
          position: 'top' as const,
          formatter: '{c}%',
          fontSize: 11,
          color: '#606266',
        },
      },
    ],
    animationDuration: 800,
    animationEasing: 'cubicOut',
  }
}
