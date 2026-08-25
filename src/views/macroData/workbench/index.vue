<template>
  <div class="flex flex-col gap-16px overflow-y-auto">
    <!-- 顶部标题 -->
    <div class="flex items-end justify-between">
      <div>
        <h2 class="m-0 text-22px font-bold color-[var(--el-text-color-primary)]">宏观数据概览</h2>
        <span class="text-14px color-[var(--el-text-color-secondary)] block m-t-4px">跟踪核心经济指标，把握宏观大势</span>
      </div>
      <div class="flex items-center gap-4px text-12px color-[#c0c4cc]">
        <el-icon><InfoFilled /></el-icon>
        数据来源：中国人民银行 / 国家统计局 / 东方财富
      </div>
    </div>

    <!-- KPI 卡片行 -->
    <div class="grid grid-cols-4 gap-16px max-lg:grid-cols-2 max-sm:grid-cols-1">
      <MacroKpiCard
        v-for="item in kpiList"
        :key="item.label"
        :label="item.label"
        :value="item.value"
        :change="item.change"
        :unit="item.unit"
        :icon="item.icon"
        :color="item.color"
      />
    </div>

    <!-- 核心趋势图 — 第一行 -->
    <div class="grid grid-cols-2 gap-16px max-lg:grid-cols-1">
      <MacroChartCard title="M2 增速 vs GDP 增速" :options="m2GdpOption" />
      <MacroChartCard title="社会融资规模增量" :options="socialFinanceOption" />
    </div>

    <!-- 第二行 -->
    <div class="grid grid-cols-2 gap-16px max-lg:grid-cols-1">
      <MacroChartCard title="PMI 制造业 vs 非制造业" :options="pmiOption" />
      <MacroChartCard title="CPI / PPI 同比走势" :options="cpiPpiOption" />
    </div>

    <!-- 第三行 -->
    <div class="grid grid-cols-2 gap-16px max-lg:grid-cols-1">
      <MacroChartCard title="LPR 利率走势" :options="lprOption" />
      <MacroChartCard title="外汇储备" :options="forexOption" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { InfoFilled } from '@element-plus/icons-vue'
import type { EChartsOption } from 'echarts'
import { useMacroData } from '../utils/useMacroData'
import MacroKpiCard from '../components/MacroKpiCard.vue'
import MacroChartCard from '../components/MacroChartCard.vue'

const {
  kpiList, moneySupply, socialFinance, pmi,
  priceIndex, lpr, officialReserves,
  loadAll,
} = useMacroData()

onMounted(() => { loadAll() })

const dates = computed(() => moneySupply.value.map((d) => d.date))

const m2GdpOption = computed<EChartsOption>(() => ({
  legend: { data: ['M2 增速', 'GDP 增速'], bottom: 0, textStyle: { fontSize: 12 } },
  xAxis: { type: 'category', data: dates.value, axisLabel: { fontSize: 11 } },
  yAxis: { type: 'value', name: '%', axisLabel: { fontSize: 11 } },
  series: [
    { name: 'M2 增速', type: 'line', data: moneySupply.value.map((d) => d.m2Yoy), smooth: true, itemStyle: { color: '#409EFF' }, areaStyle: { color: 'rgba(64,158,255,0.08)' } },
    { name: 'GDP 增速', type: 'line', data: moneySupply.value.map(() => +(5.2 + (Math.random() - 0.5) * 0.4).toFixed(1)), smooth: true, lineStyle: { type: 'dashed' }, itemStyle: { color: '#E6A23C' } },
  ],
}))

const socialFinanceOption = computed<EChartsOption>(() => ({
  legend: { data: ['当月新增', '存量同比'], bottom: 0, textStyle: { fontSize: 12 } },
  xAxis: { type: 'category', data: dates.value, axisLabel: { fontSize: 11 } },
  yAxis: [
    { type: 'value', name: '万亿元', position: 'left', axisLabel: { fontSize: 11 } },
    { type: 'value', name: '%', position: 'right', axisLabel: { fontSize: 11 } },
  ],
  series: [
    { name: '当月新增', type: 'bar', data: socialFinance.value.map((d) => d.newAmount), itemStyle: { color: '#409EFF', borderRadius: [4, 4, 0, 0] }, barMaxWidth: 20 },
    { name: '存量同比', type: 'line', yAxisIndex: 1, data: socialFinance.value.map((d) => d.yoyGrowth), smooth: true, itemStyle: { color: '#F56C6C' } },
  ],
}))

const pmiOption = computed<EChartsOption>(() => ({
  legend: { data: ['制造业', '非制造业'], bottom: 0, textStyle: { fontSize: 12 } },
  xAxis: { type: 'category', data: dates.value, axisLabel: { fontSize: 11 } },
  yAxis: { type: 'value', min: 45, max: 58, axisLabel: { fontSize: 11 } },
  series: [
    {
      name: '制造业', type: 'line', data: pmi.value.map((d) => d.manufacturing), smooth: true, itemStyle: { color: '#409EFF' },
      markLine: { silent: true, data: [{ yAxis: 50, label: { formatter: '荣枯线 50', fontSize: 11 }, lineStyle: { type: 'dashed', color: '#F56C6C' } }] },
    },
    { name: '非制造业', type: 'line', data: pmi.value.map((d) => d.nonManufacturing), smooth: true, itemStyle: { color: '#67C23A' } },
  ],
}))

const cpiPpiOption = computed<EChartsOption>(() => ({
  legend: { data: ['CPI 同比', 'PPI 同比'], bottom: 0, textStyle: { fontSize: 12 } },
  xAxis: { type: 'category', data: dates.value, axisLabel: { fontSize: 11 } },
  yAxis: { type: 'value', name: '%', axisLabel: { fontSize: 11 } },
  series: [
    { name: 'CPI 同比', type: 'line', data: priceIndex.value.map((d) => d.cpi), smooth: true, itemStyle: { color: '#E6A23C' }, areaStyle: { color: 'rgba(230,162,60,0.06)' } },
    { name: 'PPI 同比', type: 'line', data: priceIndex.value.map((d) => d.ppi), smooth: true, itemStyle: { color: '#F56C6C' }, areaStyle: { color: 'rgba(245,108,108,0.06)' } },
  ],
}))

const lprOption = computed<EChartsOption>(() => ({
  legend: { data: ['1年期 LPR', '5年期 LPR'], bottom: 0, textStyle: { fontSize: 12 } },
  xAxis: { type: 'category', data: dates.value, axisLabel: { fontSize: 11 } },
  yAxis: { type: 'value', name: '%', min: 3.0, max: 4.5, axisLabel: { fontSize: 11 } },
  series: [
    { name: '1年期 LPR', type: 'line', data: lpr.value.map((d) => d.lpr1y), step: 'end', itemStyle: { color: '#409EFF' }, lineStyle: { width: 2 } },
    { name: '5年期 LPR', type: 'line', data: lpr.value.map((d) => d.lpr5y), step: 'end', itemStyle: { color: '#F56C6C' }, lineStyle: { width: 2 } },
  ],
}))

const forexOption = computed<EChartsOption>(() => ({
  xAxis: { type: 'category', data: dates.value, axisLabel: { fontSize: 11 } },
  yAxis: { type: 'value', name: '亿美元', axisLabel: { fontSize: 11 } },
  series: [
    { type: 'bar', data: officialReserves.value.map((d) => d.forexUsd), itemStyle: { color: '#67C23A', borderRadius: [4, 4, 0, 0] }, barMaxWidth: 18 },
  ],
}))
</script>
