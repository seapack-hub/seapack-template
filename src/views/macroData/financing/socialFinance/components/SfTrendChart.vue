<template>
  <MacroChartCard title="社融增量与存量同比增速" :options="option" height="450px" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import MacroChartCard from '@/views/macroData/components/MacroChartCard.vue'
import type { SfTrend } from '@/api/macroData/financing/types'
import { useTrendOption } from '../utils/chartOptions'

const props = defineProps<{ trend: SfTrend | null }>()
const option = computed(() => useTrendOption(props.trend))
</script>
