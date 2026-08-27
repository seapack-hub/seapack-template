/**
 * LPR 利率看板 — ECharts 图表配置
 */
import type { EChartsOption } from 'echarts'
import type { LprTrend } from '@/api/macroData/types'

const COLORS = { blue: '#409EFF', red: '#F56C6C', gray: '#909399' }

/** LPR 阶梯折线图 */
export function useLprTrendOption(trend: LprTrend | null): EChartsOption {
  if (!trend) return {}
  const { dates, lpr1y, lpr5y } = trend
  return {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255,255,255,0.98)',
      borderColor: '#ebeef5',
      borderWidth: 1,
      textStyle: { color: '#303133', fontSize: 13 },
      axisPointer: { type: 'cross', crossStyle: { color: '#999' } },
      formatter(params: any) {
        const list = Array.isArray(params) ? params : [params]
        let html = `<div style="font-size:13px"><b style="color:#606266">${list[0].axisValue}</b><br/>`
        for (const p of list) {
          html += `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${p.color};margin-right:6px"></span>${p.seriesName}：<b>${Number(p.value).toFixed(2)}%</b><br/>`
        }
        return html + '</div>'
      },
    },
    legend: {
      data: ['1年期 LPR', '5年期 LPR'],
      top: 8,
      icon: 'circle',
      itemGap: 16,
      itemWidth: 10,
      itemHeight: 10,
      textStyle: { color: '#606266', fontSize: 12 },
    },
    grid: { left: 55, right: 20, top: 50, bottom: 60 },
    xAxis: {
      type: 'category',
      data: dates,
      boundaryGap: false,
      axisLine: { lineStyle: { color: '#dcdfe6' } },
      axisTick: { show: false },
      axisLabel: { color: '#909399', fontSize: 11 },
    },
    yAxis: {
      type: 'value',
      name: '%',
      min: (v: any) => Math.floor((v.min - 0.1) * 4) / 4,
      max: (v: any) => Math.ceil((v.max + 0.1) * 4) / 4,
      nameTextStyle: { color: '#909399', fontSize: 12 },
      splitLine: { lineStyle: { type: 'dashed', color: '#f0f0f0' } },
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#909399', fontSize: 11, formatter: '{value}%' },
    },
    dataZoom: [
      { type: 'slider', bottom: 8, height: 24, borderColor: '#dcdfe6', fillerColor: 'rgba(64,158,255,0.12)', handleStyle: { color: '#409EFF' }, textStyle: { color: '#909399', fontSize: 11 } },
      { type: 'inside' },
    ],
    series: [
      {
        name: '1年期 LPR',
        type: 'line',
        data: lpr1y,
        step: 'end',
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { width: 2.5, color: COLORS.blue },
        itemStyle: { color: COLORS.blue },
      },
      {
        name: '5年期 LPR',
        type: 'line',
        data: lpr5y,
        step: 'end',
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { width: 2.5, color: COLORS.red },
        itemStyle: { color: COLORS.red },
      },
    ],
    animationDuration: 1000,
    animationEasing: 'cubicOut',
  }
}
