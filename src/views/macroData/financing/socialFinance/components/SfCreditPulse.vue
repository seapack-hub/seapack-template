<template>
  <MacroChartCard title="信用脉冲（社融同比12个月变动）" :options="option" height="300px" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import MacroChartCard from '@/views/macroData/components/MacroChartCard.vue'
import type { SfTrend } from '@/api/macroData/financing/types'
import { useCreditImpulseOption } from '../utils/chartOptions'

const props = defineProps<{ trend: SfTrend | null }>()
const option = computed(() => useCreditImpulseOption(props.trend))
</script>
