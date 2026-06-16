<template>
  <el-card class="mini-charts" shadow="hover">
    <template #header>
      <div class="card-header">
        <span class="card-title">股票趋势</span>
        <el-radio-group v-model="rangeDays" size="small" @change="loadData">
          <el-radio-button :value="7">7天</el-radio-button>
          <el-radio-button :value="30">30天</el-radio-button>
        </el-radio-group>
      </div>
    </template>
    <div ref="chartRef" style="width: 100%; height: 240px"></div>
  </el-card>
</template>

<script setup lang="ts">
import * as echarts from 'echarts'

const chartRef = ref<HTMLDivElement>()
const rangeDays = ref(7)
let chartInstance: echarts.ECharts | null = null

function getMockData(days: number) {
  const dates: string[] = []
  const values: number[] = []
  const now = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    dates.push(`${d.getMonth() + 1}/${d.getDate()}`)
    values.push(Math.round(100 + Math.random() * 50))
  }
  return { dates, values }
}

function setChartOptions(data: { dates: string[]; values: number[] }) {
  if (!chartInstance) return
  chartInstance.setOption({
    tooltip: {
      trigger: 'axis',
      formatter: '{b}<br/>指数: {c}',
    },
    grid: {
      left: 10,
      right: 10,
      top: 10,
      bottom: 24,
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: data.dates,
      axisLine: { lineStyle: { color: '#e0e0e0' } },
      axisLabel: { color: '#909399', fontSize: 11 },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { type: 'dashed', color: '#f0f0f0' } },
      axisLabel: { show: false },
      axisTick: { show: false },
    },
    series: [
      {
        type: 'line',
        data: data.values,
        smooth: true,
        symbol: 'none',
        lineStyle: { color: '#409eff', width: 2 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(64,158,255,0.25)' },
            { offset: 1, color: 'rgba(64,158,255,0.02)' },
          ]),
        },
      },
    ],
  })
}

function loadData() {
  const data = getMockData(rangeDays.value)
  setChartOptions(data)
}

function handleResize() {
  setTimeout(() => chartInstance?.resize(), 100)
}

onMounted(() => {
  if (chartRef.value) {
    chartInstance = markRaw(echarts.init(chartRef.value))
    loadData()
  }
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  chartInstance?.dispose()
})

onActivated(() => handleResize())
</script>

<style lang="scss" scoped>
.mini-charts {
  border-radius: 12px;
  border: none;
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
}
</style>
