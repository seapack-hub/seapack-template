<!--
  统计卡片组件（单行三列布局）
  左列：标题 + 环比 + 昨日
  中列：数值（突出）
  右列：图标
-->
<template>
  <div class="stat-card">
    <!-- 左列：标题 + 信息 -->
    <div class="flex flex-col gap-6px min-w-0">
      <span class="text-15px font-600 color-[var(--el-text-color-primary)] truncate">{{ title }}</span>
      <div class="flex items-center gap-6px text-13px">
        <span :class="trendClass" class="font-500">
          <template v-if="trend > 0">↑ +{{ trend }}%</template>
          <template v-else-if="trend < 0">↓ {{ trend }}%</template>
          <template v-else>持平</template>
        </span>
        <span class="color-[var(--el-text-color-secondary)]">·</span>
        <span class="color-[var(--el-text-color-secondary)]">昨日 {{ yesterdayDisplay }}</span>
      </div>
    </div>

    <!-- 中列：数值 -->
    <div class="text-28px font-bold color-[var(--el-text-color-primary)] tabular-nums whitespace-nowrap">
      {{ displayValue }}
    </div>

    <!-- 右列：图标 -->
    <div class="w-40px h-40px rounded-10px flex items-center justify-center flex-shrink-0" :style="{ background: `${bgColor}12`, color: bgColor }">
      <el-icon :size="20"><component :is="icon" /></el-icon>
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
  yesterdayValue?: number | string
}>()

const displayValue = computed(() => {
  const v = props.value ?? 0
  if (props.format === 'cost') return `¥${Number(v).toFixed(2)}`
  if (props.format === 'percent') return `${Number(v).toFixed(1)}%`
  if (typeof v === 'number') return v.toLocaleString()
  return v
})

const yesterdayDisplay = computed(() => {
  const v = props.yesterdayValue ?? 0
  if (props.format === 'cost') return `¥${Number(v).toFixed(2)}`
  if (props.format === 'percent') return `${Number(v).toFixed(1)}%`
  if (typeof v === 'number') return v.toLocaleString()
  return v
})

const trendClass = computed(() => {
  if (props.trend > 0) return 'color-[var(--el-color-success)]'
  if (props.trend < 0) return 'color-[var(--el-color-danger)]'
  return 'color-[var(--el-text-color-secondary)]'
})
</script>

<style scoped>
.stat-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 16px 24px;
  background: white;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
  transition: box-shadow 0.2s, transform 0.2s;
}
.stat-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}
</style>
