<!-- ============================================================
  MiniCharts 迷你趋势图表组件
  基于 ECharts 绘制股票指数趋势折线图，
  支持 7 天 / 30 天切换，自适应容器 resize。
  ============================================================ -->
<template>
  <el-card class="mini-charts" shadow="hover">
    <!-- 卡片标题栏：标题 + 时间范围切换按钮 -->
    <template #header>
      <div class="card-header">
        <span class="card-title">股票趋势</span>
        <!-- 7天 / 30天切换 -->
        <el-radio-group v-model="rangeDays" size="small" @change="loadData">
          <el-radio-button :value="7">7天</el-radio-button>
          <el-radio-button :value="30">30天</el-radio-button>
        </el-radio-group>
      </div>
    </template>
    <!-- ECharts 图表容器 -->
    <div ref="chartRef" style="width: 100%; height: 240px"></div>
  </el-card>
</template>

<script setup lang="ts">
import * as echarts from 'echarts'

/** 图表 DOM 容器引用 */
const chartRef = ref<HTMLDivElement>()
/** 当前选中的天数范围（7 或 30） */
const rangeDays = ref(7)
/** ECharts 实例引用 */
let chartInstance: echarts.ECharts | null = null

/**
 * 生成模拟图表数据
 * @param days - 数据天数
 * @returns 日期标签数组和随机数值数组
 */
function getMockData(days: number) {
  const dates: string[] = []
  const values: number[] = []
  const now = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    dates.push(`${d.getMonth() + 1}/${d.getDate()}`)
    // 生成 100-150 之间的随机整数值
    values.push(Math.round(100 + Math.random() * 50))
  }
  return { dates, values }
}

/**
 * 设置 ECharts 图表配置
 * @param data - 包含日期和数值的对象
 */
function setChartOptions(data: { dates: string[]; values: number[] }) {
  if (!chartInstance) return
  chartInstance.setOption({
    // 提示框
    tooltip: {
      trigger: 'axis',
      formatter: '{b}<br/>指数: {c}',
    },
    // 网格布局
    grid: {
      left: 10,
      right: 10,
      top: 10,
      bottom: 24,
      containLabel: true,
    },
    // X 轴（类别轴）
    xAxis: {
      type: 'category',
      data: data.dates,
      axisLine: { lineStyle: { color: '#e0e0e0' } },
      axisLabel: { color: '#909399', fontSize: 11 },
      axisTick: { show: false },
    },
    // Y 轴（数值轴）
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { type: 'dashed', color: '#f0f0f0' } },
      axisLabel: { show: false },
      axisTick: { show: false },
    },
    // 平滑折线图 + 渐变面积
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

/**
 * 加载并刷新图表数据
 */
function loadData() {
  const data = getMockData(rangeDays.value)
  setChartOptions(data)
}

/**
 * 窗口 resize 处理：防抖 100ms 后刷新图表尺寸
 */
function handleResize() {
  setTimeout(() => chartInstance?.resize(), 100)
}

/** 组件挂载：初始化 ECharts 并绑定 resize 事件 */
onMounted(() => {
  if (chartRef.value) {
    chartInstance = markRaw(echarts.init(chartRef.value))
    loadData()
  }
  window.addEventListener('resize', handleResize)
})

/** 组件卸载：移除 resize 事件并销毁图表实例 */
onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  chartInstance?.dispose()
})

/** KeepAlive 激活时重新适配图表尺寸 */
onActivated(() => handleResize())
</script>

<style lang="scss" scoped>
/** 迷你图表卡片：撑满高度 */
.mini-charts {
  border-radius: 12px;
  border: none;
  height: 100%;
}

/** 卡片头部：标题居左，切换按钮居右 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/** 卡片标题 */
.card-title {
  font-size: 16px;
  font-weight: 600;
}
</style>
