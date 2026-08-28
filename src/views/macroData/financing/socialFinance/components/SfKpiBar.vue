<template>
  <div class="grid grid-cols-5 gap-16px flex-none">
    <SfKpiCard label="社融存量" :value="overview?.sfStock ?? null" unit="万亿" :change="overview?.sfYoyChange ?? 0" change-label="存量同比" :icon="TrendCharts" border-color="#409EFF" icon-bg-color="#ecf5ff" icon-color="#409EFF" value-color="#409EFF" />
    <SfKpiCard label="存量同比" :value="overview?.sfYoy ?? null" unit="%" :change="overview?.sfYoyChange ?? 0" change-label="同比月变动" :icon="TrendCharts" border-color="#67C23A" icon-bg-color="#f0f9eb" icon-color="#67C23A" value-color="#67C23A" />
    <SfKpiCard label="M2-社融剪刀差" :value="overview?.scissors ?? null" unit="%" :badge-positive="(overview?.scissors ?? 0) < 0" :change-label="m2vsSfLabel" :badge="(overview?.scissors ?? 0) >= 0 ? '空转扩大' : '流入实体'" :icon="DataLine" border-color="#E6A23C" icon-bg-color="#fdf6ec" icon-color="#E6A23C" :value-color="(overview?.scissors ?? 0) >= 0 ? '#F56C6C' : '#67C23A'" />
    <SfKpiCard label="政府债券同比" :value="overview?.govtBondYoy ?? null" unit="%" :change="overview?.govtBondYoyChange ?? 0" change-label="财政发力" :icon="Coin" border-color="#9B59B6" icon-bg-color="#f5f0fa" icon-color="#9B59B6" value-color="#9B59B6" />
    <SfKpiCard label="贷款存量同比" :value="overview?.loanYoy ?? null" unit="%" :change="overview?.loanYoyChange ?? 0" change-label="月度变动" :icon="Histogram" border-color="#F56C6C" icon-bg-color="#fef0f0" icon-color="#F56C6C" value-color="#F56C6C" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { TrendCharts, DataLine, Coin, Histogram } from '@element-plus/icons-vue'
import type { SfOverview } from '@/api/macroData/financing/types'
import SfKpiCard from './SfKpiCard.vue'

const props = defineProps<{ overview: SfOverview | null }>()

const m2vsSfLabel = computed(() => {
  if (!props.overview) return '资金空转指标'
  return `M2同比 ${(props.overview.m2Yoy ?? 0).toFixed(1)}% vs 社融 ${(props.overview.sfYoy ?? 0).toFixed(1)}%`
})
</script>
