<template>
  <MacroChartCard title="社融增量结构贡献（百分比）" :options="option" height="300px" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import MacroChartCard from '@/views/macroData/components/MacroChartCard.vue'
import type { SfStructure } from '@/api/macroData/financing/types'
import { useStructurePieOption } from '../utils/chartOptions'

const props = defineProps<{ structure: SfStructure | null }>()
const option = computed(() => useStructurePieOption(props.structure))
</script>
