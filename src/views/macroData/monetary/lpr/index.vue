<template>
  <div class="h-full flex flex-col gap-16px overflow-hidden">
    <!-- ==================== 1. Header ==================== -->
    <div class="flex items-center justify-between box-border p-x-24 p-y-16 rounded-12px bg-white border border-[var(--el-border-color-lighter)] shadow-sm">
      <div class="flex items-center gap-12px">
        <div class="w-40px h-40px rounded-10px bg-[var(--el-color-primary-light-9)] flex items-center justify-center">
          <el-icon :size="22" color="var(--el-color-primary)"><TrendCharts /></el-icon>
        </div>
        <div class="flex flex-col">
          <span class="text-18px font-700 color-[var(--el-text-color-primary)] leading-24px">LPR 宏观利率监控看板</span>
          <span class="text-12px color-[var(--el-text-color-secondary)] leading-18px">Loan Prime Rate Dashboard</span>
        </div>
      </div>
      <div class="flex items-center gap-8px">
        <span class="text-14px color-[var(--el-text-color-secondary)]">时间筛选：</span>
        <el-select v-model="months" style="width: 120px" @change="fetchAll">
          <el-option v-for="opt in MONTHS_OPTIONS" :key="opt.value" :label="opt.label" :value="opt.value" />
        </el-select>
        <el-button :icon="Refresh" circle @click="fetchAll" />
      </div>
    </div>

    <!-- ==================== 2. KPI 卡片区 ==================== -->
    <div class="grid grid-cols-3 gap-16px flex-none">
      <LprKpiCard label="1年期 LPR" :value="overview?.lpr1y ?? null" unit="%" :change="change1y" change-label="较上月" :icon="Histogram" border-color="#409EFF" icon-bg-color="#ecf5ff" icon-color="#409EFF" />
      <LprKpiCard label="5年期 LPR" :value="overview?.lpr5y ?? null" unit="%" :change="change5y" change-label="较上月" :icon="Histogram" border-color="#F56C6C" icon-bg-color="#fef0f0" icon-color="#F56C6C" />
      <LprKpiCard label="利差（5Y - 1Y）" :value="overview?.spread ?? null" unit="%" :change="0" change-label="长短端定价溢价" :icon="DataLine" border-color="#E6A23C" icon-bg-color="#fdf6ec" icon-color="#E6A23C" />
    </div>

    <!-- ==================== 3+4. 图表 + 表格（左右布局） ==================== -->
    <div class="flex-1 min-h-0 flex gap-16px overflow-hidden">
      <MacroChartCard title="LPR 利率走势" :options="lprOption" height="100%" class="flex-1 min-h-400px flex flex-col overflow-hidden" />
      <div class="flex-1 min-h-400px box-border p-x-16 p-y-10 rounded-12px bg-white border border-[var(--el-border-color-lighter)] shadow-sm flex flex-col overflow-hidden">
        <div class="p-b-10 border-b border-[var(--el-border-color-lighter)]">
          <span class="text-15px font-600 color-[var(--el-text-color-primary)]">历史数据明细</span>
        </div>
        <div class="flex-1 min-h-0 overflow-auto">
          <SpTable class="flex-1 overflow-auto" :columns="columns" :data="tableData" :show-empty="true" size="small" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Refresh, TrendCharts, Histogram, DataLine } from '@element-plus/icons-vue'
import MacroChartCard from '@/views/macroData/components/MacroChartCard.vue'
import SpTable from '@/components/baseComponents/SpTable/index.vue'
import { LprAPI } from '@/api/macroData/monetary/lpr'
import type { LprOverview, LprTrend } from '@/api/macroData/types'
import { MONTHS_OPTIONS, DETAIL_COLUMNS } from './utils/moduleOptions'
import { useLprTrendOption } from './utils/chartOptions'
import LprKpiCard from './components/LprKpiCard.vue'

// ==================== 状态 ====================
const months = ref(120)
const overview = ref<LprOverview | null>(null)
const trend = ref<LprTrend | null>(null)

// ==================== KPI 计算 ====================
const change1y = computed(() => overview.value?.change1y ?? 0)
const change5y = computed(() => overview.value?.change5y ?? 0)

// ==================== ECharts 配置 ====================
const lprOption = computed(() => useLprTrendOption(trend.value))

// ==================== 表格数据 ====================
const columns = DETAIL_COLUMNS

const tableData = computed(() => {
  if (!trend.value) return []
  const { dates, lpr1y, lpr5y } = trend.value
  return [...dates].reverse().map((date, ri) => {
    const i = dates.length - 1 - ri
    return {
      date,
      lpr1y: lpr1y[i] != null ? Number(lpr1y[i].toFixed(2)) : null,
      lpr5y: lpr5y[i] != null ? Number(lpr5y[i].toFixed(2)) : null,
      change: i > 0 && lpr1y[i - 1] != null && lpr1y[i] != null
        ? Math.round((lpr1y[i] - lpr1y[i - 1]) * 100)
        : 0,
    }
  })
})

// ==================== 数据加载 ====================
async function fetchAll() {
  const [ov, tr] = await Promise.allSettled([
    LprAPI.getOverview(),
    LprAPI.getTrend(months.value),
  ])
  if (ov.status === 'fulfilled') overview.value = ov.value as unknown as LprOverview
  if (tr.status === 'fulfilled') trend.value = tr.value as unknown as LprTrend
}

onMounted(() => { fetchAll() })
</script>
