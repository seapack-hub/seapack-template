<template>
  <MacroChartCard title="宏观象限图（信用宽紧 × 货币宽紧）" :options="option" height="400px" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import MacroChartCard from '@/views/macroData/components/MacroChartCard.vue'
import type { SfTrend } from '@/api/macroData/financing/types'
import { useQuadrantOption } from '../utils/chartOptions'

const props = defineProps<{ trend: SfTrend | null }>()
const option = computed(() => useQuadrantOption(props.trend))
</script>
