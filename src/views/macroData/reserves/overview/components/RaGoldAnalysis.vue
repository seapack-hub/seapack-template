<template>
  <MacroChartCard title="黄金储备分析（总量 + 月增量 + 价值环比）" :options="option" height="420px" />
</template>
<script setup lang="ts">
import { computed } from 'vue'
import MacroChartCard from '@/views/macroData/components/MacroChartCard.vue'
import type { RaTrend } from '@/api/macroData/reserves/types'
import { useGoldAnalysisOption } from '../utils/chartOptions'
const props = defineProps<{ trend: RaTrend | null }>()
const option = computed(() => useGoldAnalysisOption(props.trend))
</script>
