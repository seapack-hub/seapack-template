<template>
  <!-- KPI 指标卡：数字动画 + 涨跌标识 -->
  <div
    class="kpi-card"
    :style="{ '--primary': primaryColor, '--text': textColor, '--text-sec': textSecondary }"
  >
    <div class="kpi-card-label">{{ label }}</div>
    <div class="kpi-card-value">
      <span class="kpi-card-number">{{ displayValue }}</span>
      <span class="kpi-card-unit">{{ unit }}</span>
    </div>
    <div class="kpi-card-trend" :class="trend">
      <span class="kpi-card-trend-icon">{{ trend === 'up' ? '↑' : '↓' }}</span>
      <span class="kpi-card-trend-value">{{ trendValue }}</span>
      <span class="kpi-card-trend-label">较上月</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'

interface Props {
  label: string
  value: number
  unit?: string
  trend?: 'up' | 'down'
  trendValue?: string
  primaryColor?: string
  textColor?: string
  textSecondary?: string
}

const props = withDefaults(defineProps<Props>(), {
  unit: '',
  trend: 'up',
  trendValue: '',
  primaryColor: '#00d4ff',
  textColor: '#ffffff',
  textSecondary: 'rgba(255,255,255,0.65)',
})

const displayValue = ref('0')

// 数字滚动动画：从当前值过渡到目标值，800ms 完成
const animateValue = (target: number) => {
  const duration = 800
  const start = performance.now()
  const from = parseFloat(displayValue.value.replace(/,/g, '')) || 0

  const step = (now: number) => {
    const elapsed = now - start
    const progress = Math.min(elapsed / duration, 1)
    // ease-out 效果使减速更自然
    const eased = 1 - Math.pow(1 - progress, 2)
    const current = from + (target - from) * eased
    displayValue.value = formatNumber(current)
    if (progress < 1) requestAnimationFrame(step)
  }

  requestAnimationFrame(step)
}

// 数字格式化：整数加千分位逗号，小数保留 1 位
const formatNumber = (n: number): string => {
  if (Number.isInteger(n)) return n.toLocaleString()
  return n.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })
}

watch(() => props.value, (val) => animateValue(val), { immediate: true })
onMounted(() => animateValue(props.value))
</script>

<style lang="scss" scoped>
.kpi-card {
  padding: 16px 20px;
  border-radius: 4px;
  border: 1px solid var(--primary);
  border-color: color-mix(in srgb, var(--primary) 20%, transparent);
  background: color-mix(in srgb, var(--primary) 4%, transparent);
  transition: border-color 0.3s;
  cursor: default;

  &:hover {
    border-color: color-mix(in srgb, var(--primary) 50%, transparent);
  }
}

.kpi-card-label {
  font-size: 14px;
  color: var(--text-sec);
  margin-bottom: 8px;
}

.kpi-card-value {
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-bottom: 8px;
}

.kpi-card-number {
  font-size: 32px;
  font-weight: 700;
  color: var(--text);
  font-variant-numeric: tabular-nums;
  letter-spacing: 1px;
}

.kpi-card-unit {
  font-size: 14px;
  color: var(--text-sec);
}

.kpi-card-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;

  &.up { color: #00e676; }
  &.down { color: #ff5252; }
}

.kpi-card-trend-icon {
  font-size: 14px;
}

.kpi-card-trend-label {
  color: var(--text-sec);
  margin-left: 2px;
}
</style>
