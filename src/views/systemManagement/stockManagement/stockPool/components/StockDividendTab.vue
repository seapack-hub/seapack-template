<template>
  <el-card shadow="never">
    <template #header><span class="card-title">历年分红统计</span></template>
    <baseCharts :options="dividendOpts" height="400px" />
  </el-card>
</template>

<script setup lang="ts">
import { buildDividendChartOption } from './detailShared'

const props = defineProps<{
  dividends: any[]
}>()

const dividendOpts = computed(() => buildDividendChartOption(props.dividends))
</script>

<style lang="scss" scoped>
.card-title { font-size: 15px; font-weight: 600; color: #303133; }
</style>