<template>
  <div class="chart-tab">
    <!-- 时间筛选 -->
    <el-card shadow="never" class="filter-card">
      <el-form :inline="true" class="filter-form">
        <el-form-item label="开始日期">
          <el-date-picker v-model="startDate" type="date" placeholder="选择开始日期" value-format="YYYYMMDD"
            :disabled-date="d => d > endVal" />
        </el-form-item>
        <el-form-item label="结束日期">
          <el-date-picker v-model="endDate" type="date" placeholder="选择结束日期" value-format="YYYYMMDD"
            :disabled-date="d => d < startVal" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery" :loading="loading">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-row :gutter="16" class="chart-row">
      <el-col :span="24" class="mb-16px">
        <el-card shadow="never">
          <template #header><span class="card-title">K 线走势</span></template>
          <baseCharts :options="kLineOpts" height="480px" />
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="chart-row">
      <el-col :span="12">
        <el-card shadow="never">
          <template #header><span class="card-title">行情概要</span></template>
          <div v-if="summary" class="summary-grid">
            <div class="summary-item">
              <span class="label">最新收盘</span>
              <span class="value price">{{ summary.latestClose?.toFixed(2) }} 元</span>
            </div>
            <div class="summary-item">
              <span class="label">区间最高</span>
              <span class="value up">{{ summary.high?.toFixed(2) }} 元</span>
            </div>
            <div class="summary-item">
              <span class="label">区间最低</span>
              <span class="value down">{{ summary.low?.toFixed(2) }} 元</span>
            </div>
            <div class="summary-item">
              <span class="label">总成交量</span>
              <span class="value">{{ summary.totalVolume }}</span>
            </div>
            <div class="summary-item">
              <span class="label">总成交额</span>
              <span class="value">{{ summary.totalTurnover }} 元</span>
            </div>
            <div class="summary-item">
              <span class="label">数据条数</span>
              <span class="value">{{ summary.count }} 条</span>
            </div>
          </div>
          <el-empty v-else description="暂无数据" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { EastMoneyAPI } from '@/api/system/stockPool'
import { buildKLineChartOption } from './detailShared'

function todayStr() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}${m}${day}`
}

function parseYyyymmdd(s: string) {
  if (!s || s.length !== 8) return undefined
  return new Date(+s.slice(0, 4), +s.slice(4, 6) - 1, +s.slice(6, 8))
}

const props = defineProps<{
  stockCode: string
}>()

const loading = ref(false)
const historyData = ref<any[]>([])

const startDate = ref('20260101')
const endDate = ref(todayStr())

const startVal = computed(() => parseYyyymmdd(startDate.value))
const endVal = computed(() => parseYyyymmdd(endDate.value))

const kLineOpts = computed(() => buildKLineChartOption(historyData.value))

const summary = computed(() => {
  const d = historyData.value
  if (!d?.length) return null
  const closePrices = d.map(i => i.closePrice)
  const vol = d.reduce((s, i) => s + (i.volume || 0), 0)
  const turn = d.reduce((s, i) => s + (i.turnover || 0), 0)
  const fmtVol = vol >= 1e8 ? (vol / 1e8).toFixed(2) + ' 亿' : vol >= 1e4 ? (vol / 1e4).toFixed(2) + ' 万' : vol
  const fmtTurn = turn >= 1e8 ? (turn / 1e8).toFixed(2) + ' 亿' : turn >= 1e4 ? (turn / 1e4).toFixed(2) + ' 万' : turn
  return {
    latestClose: closePrices[closePrices.length - 1],
    high: Math.max(...d.map(i => i.highPrice)),
    low: Math.min(...d.map(i => i.lowPrice)),
    totalVolume: fmtVol,
    totalTurnover: fmtTurn,
    count: d.length,
  }
})

async function fetchHistory() {
  if (!props.stockCode) return
  loading.value = true
  try {
    const res = await EastMoneyAPI.history(props.stockCode, startDate.value, endDate.value)
    historyData.value = res ?? []
  } catch {
    historyData.value = []
  } finally {
    loading.value = false
  }
}

function handleQuery() {
  fetchHistory()
}

function handleReset() {
  startDate.value = '20260101'
  endDate.value = todayStr()
  fetchHistory()
}

watch(() => props.stockCode, fetchHistory, { immediate: true })
</script>

<style lang="scss" scoped>
.chart-tab { width: 100%; }
.filter-card { margin-bottom: 16px; border-radius: 8px; }
.filter-form { margin: 0; }
.card-title { font-size: 15px; font-weight: 600; color: #303133; }
.chart-row { margin: 0 !important; }
.mb-16px { margin-bottom: 16px; }
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
