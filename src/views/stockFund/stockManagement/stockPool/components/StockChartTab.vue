<template>
  <div v-loading="loading" class="chart-tab" element-loading-text="加载中...">
    <el-card shadow="never" class="filter-card">
      <el-form :inline="true" class="filter-form h-[40px]">
        <el-form-item label="开始日期">
          <el-date-picker
            v-model="startDate" type="date" placeholder="选择开始日期" value-format="YYYY-MM-DD"
            :disabled-date="(d: Date) => endVal && d > endVal"
          />
        </el-form-item>
        <el-form-item label="结束日期">
          <el-date-picker
            v-model="endDate" type="date" placeholder="选择结束日期" value-format="YYYY-MM-DD"
            :disabled-date="(d: Date) => startVal && d < startVal"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="handleQuery">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-row class="chart-row">
      <el-col :span="24">
        <el-card shadow="never">
          <template #header><span class="card-title">K 线走势</span></template>
          <baseCharts :options="kLineOpts" height="480px" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { StockDailyAPI } from '@/api/stockFund/stock/instrument.ts'
import { buildKLineChartOption } from './detailShared'

function formatDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function monthsAgo(n: number): Date {
  const d = new Date()
  d.setMonth(d.getMonth() - n)
  return d
}

const props = defineProps<{
  stockCode: string
}>()

const loading = ref(false)
const klineData = ref<any[]>([])

const now = new Date()
const startDate = ref(formatDate(monthsAgo(3)))
const endDate = ref(formatDate(now))

const startVal = computed(() => startDate.value ? new Date(startDate.value) : undefined)
const endVal = computed(() => endDate.value ? new Date(endDate.value) : undefined)

const kLineOpts = computed(() => buildKLineChartOption(klineData.value))

async function fetchKline() {
  if (!props.stockCode) return
  loading.value = true
  try {
    const res = await StockDailyAPI.klines(props.stockCode, startDate.value, endDate.value)
    klineData.value = res ?? []
  } catch {
    klineData.value = []
  } finally {
    loading.value = false
  }
}

function handleQuery() {
  fetchKline()
}

function handleReset() {
  startDate.value = formatDate(monthsAgo(3))
  endDate.value = formatDate(new Date())
  fetchKline()
}

watch(() => props.stockCode, fetchKline, { immediate: true })
</script>

<style lang="scss" scoped>
.chart-tab { width: 100%; }
.filter-card { margin-bottom: 10px; border-radius: 8px; }
.filter-form { margin: 0; }
.card-title { font-size: 15px; font-weight: 600; color: #303133; }
.chart-row { margin: 0 !important; }
.summary-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 16px; padding: 12px 0;
  .summary-item {
    display: flex; flex-direction: column; gap: 4px;
    .label { font-size: 12px; color: #909399; }
    .value { font-size: 16px; font-weight: 600; color: #303133;
      &.price { color: #e6a23c; }
      &.up { color: #f56c6c; }
      &.down { color: #67c23a; }
    }
  }
}
</style>
