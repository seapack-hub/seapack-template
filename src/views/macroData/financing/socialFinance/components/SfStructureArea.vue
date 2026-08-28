<template>
  <MacroChartCard title="融资方式拆解（存量规模趋势）" :options="option" height="500px" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import MacroChartCard from '@/views/macroData/components/MacroChartCard.vue'
import type { SfTrend } from '@/api/macroData/financing/types'
import { useAreaOption } from '../utils/chartOptions'

const props = defineProps<{ trend: SfTrend | null }>()
const option = computed(() => useAreaOption(props.trend))
</script>
