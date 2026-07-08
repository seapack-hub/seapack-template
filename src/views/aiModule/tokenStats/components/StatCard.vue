<!--
  统计卡片组件
  显示今日调用/Token/费用/成功率，含环比变化
-->
<template>
  <div class="stat-card">
    <div class="flex items-center gap-12px mb-12px">
      <div class="card-icon" :style="{ background: bgColor }">
        <el-icon :size="20" color="white"><component :is="icon" /></el-icon>
      </div>
      <span class="text-13px text-[var(--el-text-color-secondary)]">{{ title }}</span>
    </div>
    <div class="text-28px font-700 color-[var(--el-text-color-primary)] mb-6px tabular-nums">
      {{ displayValue }}
    </div>
    <div class="text-12px" :class="trendClass">
      <span v-if="trend > 0">↑ +{{ trend }}%</span>
      <span v-else-if="trend < 0">↓ {{ trend }}%</span>
      <span v-else>— 持平</span>
      <span class="color-[var(--el-text-color-secondary)] ml-4px">较昨日</span>
    </div>
  </div>
</template>

<script setup lang="ts">

const props = defineProps<{
  title: string
  value: number | string
  icon: any
  bgColor: string
  trend: number
  format?: 'number' | 'cost' | 'percent'
}>()

const displayValue = computed(() => {
  if (props.format === 'cost') return `¥${props.value}`
  if (props.format === 'percent') return `${props.value}%`
  if (typeof props.value === 'number') return props.value.toLocaleString()
  return props.value
})

const trendClass = computed(() => {
  if (props.trend > 0) return 'color-[var(--el-color-success)]'
  if (props.trend < 0) return 'color-[var(--el-color-danger)]'
  return 'color-[var(--el-text-color-secondary)]'
})
</script>

<style scoped>
.stat-card {
  background: white;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  padding: 20px;
  transition: box-shadow 0.2s;
}
.stat-card:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}
.card-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.tabular-nums {
  font-variant-numeric: tabular-nums;
}
</style>
