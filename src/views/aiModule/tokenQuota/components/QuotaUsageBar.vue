<!--
  QuotaUsageBar — 额度使用进度条

  Props:
    - used: 已使用量
    - limit: 额度上限
    - alertThreshold: 预警阈值百分比
    - label: 标签名称
    - showText: 是否显示文字
-->
<template>
  <div class="quota-usage-bar flex items-center gap-15">
    <div class="w-[100px] flex items-center justify-between">
      <span class="text-13px font-500 color-[var(--el-text-color-primary)]">{{ label }}</span>
      <span class="text-12px color-[var(--el-text-color-secondary)]">
        {{ formatNumber(used) }} / {{ limit === 0 ? '不限制' : formatNumber(limit) }}
      </span>
    </div>
    <el-progress
      class="flex-1"
      :percentage="percentage"
      :color="progressColor"
      :stroke-width="10"
      :format="formatPercent"
    />
    <div v-if="limit > 0 && remaining <= 0" class="w-[100px] text-12px color-[var(--el-color-danger)]">
      额度已用完
    </div>
    <div v-else-if="isWarning" class="w-[120px] text-12px color-[var(--el-color-warning)]">
      额度使用已超过 {{ alertThreshold }}%
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  used: number
  limit: number
  alertThreshold?: number
  label?: string
  showText?: boolean
}>()

const threshold = computed(() => props.alertThreshold ?? 80)

const percentage = computed(() => {
  if (props.limit <= 0) return 0
  return Math.min(100, Math.round((props.used / props.limit) * 100))
})

const remaining = computed(() => {
  if (props.limit <= 0) return Infinity
  return Math.max(0, props.limit - props.used)
})

const isWarning = computed(() => {
  return percentage.value >= threshold.value && remaining.value > 0
})

const progressColor = computed(() => {
  if (percentage.value >= 100) return '#F56C6C'
  if (isWarning.value) return '#E6A23C'
  return '#67C23A'
})

function formatNumber(num: number): string {
  if (num >= 10000) {
    return `${(num / 10000).toFixed(1)}万`
  }
  return num.toLocaleString()
}

function formatPercent(percentage: number): string {
  if (props.limit <= 0) return 'N/A'
  return `${percentage}%`
}
</script>

<style scoped>
.quota-usage-bar {
  padding: 8px 0;
}
</style>
