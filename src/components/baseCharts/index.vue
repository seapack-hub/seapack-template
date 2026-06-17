<template>
  <div
    ref="chartContainer"
    :style="{ width: width, height: height }"
  ></div>
</template>

<script setup lang="ts">
import { echarts, ensureEchartsGL } from '@/utils/echarts'
import type { EChartsOption } from 'echarts'
// 定义组件接收的 Props
interface Props {
  options: EChartsOption; // 图表配置项[2,3]
  width?: string;
  height?: string;
  autoResize?: boolean; // 是否自动响应窗口 resize
}

//设置默认值
const props = withDefaults(defineProps<Props>(), {
  width: '100%',
  height: '400px',
  autoResize: true,
});

const chartContainer = ref<HTMLElement | null>(null); // 图表容器 DOM 引用
let chartInstance: ReturnType<typeof echarts.init> | null = null; // ECharts 实例
let resizeObserver: ResizeObserver | null = null; // 用于监听容器自身大小变化

function needsGL(opt: any): boolean {
  const series = opt?.series
  if (!series) return false
  const arr = Array.isArray(series) ? series : [series]
  return arr.some((s: any) => {
    const t = s?.type
    return t === 'surface' || (typeof t === 'string' && t.toLowerCase().endsWith('3d'))
  })
}

// 初始化图表
const initChart = async () => {
  if (!chartContainer.value) return;
  
  // 如果已有实例，先销毁
  if (chartInstance) {
    chartInstance.dispose();
  }
  if (needsGL(props.options)) {
    await ensureEchartsGL()
  }
  // 初始化图表实例
  chartInstance = echarts.init(chartContainer.value);
  // 设置图表配置
  chartInstance.setOption(props.options, true);
};

// 处理图表 resize
const handleResize = () => {
  if (chartInstance) {
    chartInstance.resize();
  }
};

// 监听窗口 resize
const handleWindowResize = () => {
  if (props.autoResize) {
    handleResize();
  }
};

onMounted(() => {
  initChart();
  window.addEventListener('resize', handleWindowResize);
  
  // 监听容器自身大小变化 (更精准的响应式)
  if (chartContainer.value && props.autoResize) {
    resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(chartContainer.value);
  }
});

// 监听 options 变化，更新图表[2,3](@ref)
watch(() => props.options, (newOptions) => {
  if (!chartInstance) return
  if (needsGL(newOptions)) {
    ensureEchartsGL().then(() => chartInstance?.setOption(newOptions, true))
    return
  }
  chartInstance.setOption(newOptions, true);
}, { deep: true });

onBeforeUnmount(() => {
  // 清理资源
  if (chartInstance) {
    chartInstance.dispose();
    chartInstance = null;
  }
  window.removeEventListener('resize', handleWindowResize);
  if (resizeObserver) {
    resizeObserver.disconnect();
  }
});

</script>

<style lang="scss" scoped></style>
