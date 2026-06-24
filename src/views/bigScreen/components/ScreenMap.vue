<template>
  <!-- ECharts 中国地图：通过 visualMap 热力着色 -->
  <div ref="chartRef" class="screen-map"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { echarts } from '@/utils/echarts'
import type { EChartsOption } from 'echarts'
import axios from 'axios'

interface Props {
  data?: Array<{ name: string; value: number }>  // 各省份数据
  primaryColor?: string
  accentColor?: string
}

const props = withDefaults(defineProps<Props>(), {
  data: () => [],
  primaryColor: '#00d4ff',
  accentColor: '#3a7bd5',
})

const chartRef = ref<HTMLElement | null>(null)
let chartInstance: ReturnType<typeof echarts.init> | null = null

// 构建 ECharts 地图配置
const getOption = (): EChartsOption => ({
  tooltip: {
    trigger: 'item',
    formatter: (params: any) => `${params.name}<br/>数值：${params.value ?? '-'}`,
    backgroundColor: 'rgba(10,14,23,0.85)',
    borderColor: props.primaryColor,
    textStyle: { color: '#fff', fontSize: 12 },
  },
  visualMap: {
    min: 0,
    max: 100000,
    left: 20,
    bottom: 20,
    text: ['高', '低'],
    textStyle: { color: 'rgba(255,255,255,0.6)', fontSize: 10 },
    inRange: {
      color: ['rgba(58,123,213,0.2)', props.accentColor, props.primaryColor],
    },
    calculable: true,  // 显示拖拽手柄
  },
  series: [
    {
      type: 'map',
      map: 'china',
      roam: true,        // 允许拖拽缩放
      selectedMode: false,
      label: {
        show: true,
        color: 'rgba(255,255,255,0.7)',
        fontSize: 9,
      },
      itemStyle: {
        areaColor: 'rgba(58,123,213,0.15)',
        borderColor: 'rgba(0,212,255,0.4)',
        borderWidth: 1,
      },
      emphasis: {
        label: { color: '#fff', fontSize: 12 },
        itemStyle: {
          areaColor: props.primaryColor,
          borderColor: '#fff',
        },
      },
      data: props.data,
    },
  ],
})

const renderChart = () => {
  if (!chartRef.value || !chartInstance) return
  chartInstance.setOption(getOption(), true)
}

// 异步加载 GeoJSON 并注册地图
const initChart = async () => {
  if (!chartRef.value) return

  try {
    const res = await axios.get('/geojson/china.json', { timeout: 10000 })
    echarts.registerMap('china', res.data)
  } catch {
    return
  }

  chartInstance = echarts.init(chartRef.value, undefined, { renderer: 'canvas' })
  chartInstance.setOption(getOption(), true)

  // 容器尺寸变化时自动 resize
  const ro = new ResizeObserver(() => chartInstance?.resize())
  ro.observe(chartRef.value)
}

// 数据变化时更新地图
watch(() => props.data, renderChart, { deep: true })

onMounted(initChart)

onUnmounted(() => {
  chartInstance?.dispose()
  chartInstance = null
})
</script>

<style lang="scss" scoped>
.screen-map {
  width: 100%;
  height: 100%;
}
</style>
