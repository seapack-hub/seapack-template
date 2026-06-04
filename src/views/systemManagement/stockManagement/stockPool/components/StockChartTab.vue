<template>
  <!-- 历年分红 + 股价走势 双折线图 -->
  <el-row :gutter="16" class="chart-row">
    <el-col :span="12">
      <el-card shadow="never">
        <template #header><span class="card-title">历年分红统计</span></template>
        <baseCharts :options="dividendOpts" height="340px" />
      </el-card>
    </el-col>
    <el-col :span="12">
      <el-card shadow="never">
        <template #header><span class="card-title">股价变化趋势</span></template>
        <baseCharts :options="priceOpts" height="340px" />
      </el-card>
    </el-col>
  </el-row>
</template>

<script setup lang="ts">
import { buildDividendChartOption, buildPriceChartOption } from './detailShared'

const props = defineProps<{
  dividends: any[]
  prices: any[]
}>()

const dividendOpts = computed(() => buildDividendChartOption(props.dividends))
const priceOpts = computed(() => buildPriceChartOption(props.prices))
</script>

<style lang="scss" scoped>
.card-title { font-size: 15px; font-weight: 600; color: #303133; }
.chart-row { margin: 0 !important; .el-col { padding: 0 8px !important; } }
</style>
