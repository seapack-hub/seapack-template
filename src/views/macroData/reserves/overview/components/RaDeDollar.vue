<template>
  <MacroChartCard title="去美元化趋势（黄金占比 vs 外汇占比）" :options="option" height="400px" />
</template>
<script setup lang="ts">
import { computed } from 'vue'
import MacroChartCard from '@/views/macroData/components/MacroChartCard.vue'
import type { RaTrend } from '@/api/macroData/reserves/types'
import { useDeDollarOption } from '../utils/chartOptions'
const props = defineProps<{ trend: RaTrend | null }>()
const option = computed(() => useDeDollarOption(props.trend))
</script>
