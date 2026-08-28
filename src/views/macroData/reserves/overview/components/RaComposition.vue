<template>
  <div class="flex gap-16px">
    <MacroChartCard title="储备资产构成（堆叠面积）" :options="areaOption" height="380px" class="flex-[3] min-w-0" />
    <MacroChartCard title="最新月份占比" :options="pieOption" height="380px" class="flex-[2] min-w-0" />
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import MacroChartCard from '@/views/macroData/components/MacroChartCard.vue'
import type { RaTrend } from '@/api/macroData/reserves/types'
import { useCompositionAreaOption, useCompositionPieOption } from '../utils/chartOptions'
const props = defineProps<{ trend: RaTrend | null }>()
const areaOption = computed(() => useCompositionAreaOption(props.trend))
const pieOption = computed(() => useCompositionPieOption(props.trend))
</script>
