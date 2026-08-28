<template>
  <div class="h-full flex flex-col gap-16px overflow-hidden">
    <!-- ==================== 1. Header ==================== -->
    <div class="flex-none flex items-center justify-between box-border p-x-24 p-y-16 rounded-12px bg-white border border-[var(--el-border-color-lighter)] shadow-sm">
      <div class="flex items-center gap-12px">
        <div class="w-40px h-40px rounded-10px bg-[var(--el-color-primary-light-9)] flex items-center justify-center">
          <el-icon :size="22" color="var(--el-color-primary)"><TrendCharts /></el-icon>
        </div>
        <div class="flex flex-col">
          <span class="text-18px font-700 color-[var(--el-text-color-primary)] leading-24px">SHIBOR 资金面监控看板</span>
          <span class="text-12px color-[var(--el-text-color-secondary)] leading-18px">Shanghai Interbank Offered Rate Dashboard</span>
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
      <ShiborKpiCard label="隔夜 SHIBOR (ON)" :value="overview?.on ?? null" :bp="overview?.onBp ?? 0" :icon="Coin" border-color="#FFD700" icon-bg-color="#fdf6ec" icon-color="#FFD700" description="当日资金面松紧核心指标" />
      <ShiborKpiCard label="1年期 SHIBOR" :value="overview?.y1 ?? null" :bp="overview?.y1Bp ?? 0" :icon="Histogram" border-color="#409EFF" icon-bg-color="#ecf5ff" icon-color="#409EFF" description="中期资金成本基准" />
      <ShiborKpiCard label="期限利差 (1Y - ON)" :value="overview?.spread ?? null" :bp="overview?.spreadBp ?? 0" :icon="DataLine" border-color="#E6A23C" icon-bg-color="#fdf6ec" icon-color="#E6A23C" :description="(overview?.spread ?? 0) < 0 ? '⚠ 倒挂信号：短期资金极度紧张' : '长短端定价溢价'" />
    </div>

    <!-- ==================== 3+4. 趋势图 + 期限结构（左右布局） ==================== -->
    <div class="flex-1 min-h-0 flex gap-16px overflow-hidden">
      <!-- 左：多期限趋势图 -->
      <MacroChartCard title="多期限 SHIBOR 走势" :options="trendOption" height="100%" class="flex-1 min-h-400px flex flex-col overflow-hidden" />

      <!-- 右：今日期限结构曲线 -->
      <div class="flex-1 min-h-400px box-border p-x-16 p-y-10 rounded-12px bg-white border border-[var(--el-border-color-lighter)] shadow-sm flex flex-col overflow-hidden">
        <div class="flex-none p-b-10 border-b border-[var(--el-border-color-lighter)]">
          <span class="text-15px font-600 color-[var(--el-text-color-primary)]">今日期限结构曲线</span>
          <span v-if="curve?.date" class="m-l-8px text-12px color-[var(--el-text-color-secondary)]">{{ curve.date }}</span>
        </div>
        <div class="flex-1 min-h-0">
          <BaseCharts :options="curveOption" height="100%" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Refresh, TrendCharts, Coin, Histogram, DataLine } from '@element-plus/icons-vue'
import MacroChartCard from '@/views/macroData/components/MacroChartCard.vue'
import BaseCharts from '@/components/baseCharts/index.vue'
import ShiborKpiCard from './components/ShiborKpiCard.vue'
import { ShiborAPI } from '@/api/macroData/monetary/shibor'
import type { ShiborOverview, ShiborTrend, ShiborCurve } from '@/api/macroData/monetary/types'
import { MONTHS_OPTIONS } from './utils/moduleOptions'
import { useTrendOption, useCurveOption } from './utils/chartOptions'

// ==================== 状态 ====================
const months = ref(12)
const overview = ref<ShiborOverview | null>(null)
const trend = ref<ShiborTrend | null>(null)
const curve = ref<ShiborCurve | null>(null)

// ==================== ECharts 配置 ====================
const trendOption = computed(() => useTrendOption(trend.value))
const curveOption = computed(() => useCurveOption(curve.value))

// ==================== 数据加载 ====================
async function fetchAll() {
  const m = months.value
  const [ov, tr, cv] = await Promise.allSettled([
    ShiborAPI.getOverview(),
    ShiborAPI.getTrend(m),
    ShiborAPI.getCurve(),
  ])
  if (ov.status === 'fulfilled') overview.value = ov.value as unknown as ShiborOverview
  if (tr.status === 'fulfilled') trend.value = tr.value as unknown as ShiborTrend
  if (cv.status === 'fulfilled') curve.value = cv.value as unknown as ShiborCurve
}

onMounted(() => { fetchAll() })
</script>
