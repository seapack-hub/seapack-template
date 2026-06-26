<!-- ============================================================
  SystemStatus 系统状态组件
  展示系统资源使用情况：CPU、内存、磁盘、在线用户趋势。
  ============================================================ -->
<template>
  <el-card class="system-status" shadow="hover">
    <template #header>
      <div class="card-header">
        <span class="card-title">系统状态</span>
        <el-radio-group v-model="rangeDays" size="small" @change="loadData">
          <el-radio-button :value="7">7天</el-radio-button>
          <el-radio-button :value="30">30天</el-radio-button>
        </el-radio-group>
      </div>
    </template>

    <!-- 资源指标卡片 -->
    <div class="resource-overview">
      <div v-for="item in resourceList" :key="item.label" class="resource-item">
        <div class="resource-label">{{ item.label }}</div>
        <el-progress
          :percentage="item.value"
          :color="item.color"
          :stroke-width="8"
          :show-text="true"
        />
        <div class="resource-desc">{{ item.desc }}</div>
      </div>
    </div>

    <!-- 在线用户趋势图 -->
    <div ref="chartRef" style="width: 100%; height: 180px; margin-top: 16px"></div>
  </el-card>
</template>

<script setup lang="ts">
import { echarts } from '@/utils/echarts'

const chartRef = ref<HTMLDivElement>()
const rangeDays = ref(7)
let chartInstance: ReturnType<typeof echarts.init> | null = null

const resourceList = ref([
  { label: 'CPU 使用率', value: 32, color: '#409eff', desc: '8 核 / 平均负载 12%' },
  { label: '内存使用率', value: 58, color: '#67c23a', desc: '16 GB / 已用 9.3 GB' },
  { label: '磁盘使用率', value: 45, color: '#e6a23c', desc: '500 GB / 已用 225 GB' },
])

function getMockData(days: number) {
  const dates: string[] = []
  const values: number[] = []
  const now = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    dates.push(`${d.getMonth() + 1}/${d.getDate()}`)
    values.push(Math.round(20 + Math.random() * 40))
  }
  return { dates, values }
}

function setChartOptions(data: { dates: string[]; values: number[] }) {
  if (!chartInstance) return
  chartInstance.setOption({
    tooltip: { trigger: 'axis', formatter: '{b}<br/>在线用户: {c} 人' },
    grid: { left: 10, right: 10, top: 10, bottom: 24, containLabel: true },
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
        lineStyle: { color: '#9b59b6', width: 2 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(155,89,182,0.25)' },
            { offset: 1, color: 'rgba(155,89,182,0.02)' },
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
.system-status {
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

.resource-overview {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.resource-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.resource-label {
  font-size: 13px;
  color: #606266;
  font-weight: 500;
}

.resource-desc {
  font-size: 12px;
  color: #909399;
}
</style>
