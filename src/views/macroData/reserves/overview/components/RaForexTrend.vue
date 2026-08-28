<template>
  <MacroChartCard title="外汇储备趋势（亿美元）" :options="option" height="420px" />
</template>
<script setup lang="ts">
import { computed } from 'vue'
import MacroChartCard from '@/views/macroData/components/MacroChartCard.vue'
import type { RaTrend } from '@/api/macroData/reserves/types'
import { useForexTrendOption } from '../utils/chartOptions'
const props = defineProps<{ trend: RaTrend | null }>()
const option = computed(() => useForexTrendOption(props.trend))
</script>
