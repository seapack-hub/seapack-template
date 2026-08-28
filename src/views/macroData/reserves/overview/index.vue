<template>
  <div class="flex flex-col gap-16px">
    <!-- ==================== Header ==================== -->
    <div class="flex items-center justify-between box-border p-x-24 p-y-16 rounded-12px bg-white border border-[var(--el-border-color-lighter)] shadow-sm">
      <div class="flex items-center gap-12px">
        <div class="w-40px h-40px rounded-10px bg-[#fdf6ec] flex items-center justify-center">
          <el-icon :size="22" color="#E6A23C"><Coin /></el-icon>
        </div>
        <div class="flex flex-col">
          <span class="text-18px font-700 color-[var(--el-text-color-primary)] leading-24px">中国官方储备资产监控看板</span>
          <span class="text-12px color-[var(--el-text-color-secondary)] leading-18px">Official Reserve Assets Dashboard</span>
        </div>
      </div>
      <div class="flex items-center gap-8px">
        <span class="text-14px color-[var(--el-text-color-secondary)]">时间筛选：</span>
        <el-select v-model="months" style="width: 120px" @change="fetchAll">
          <el-option v-for="opt in MONTHS_OPTIONS" :key="opt.value" :label="opt.label" :value="opt.value" />
        </el-select>
        <span v-if="overview" class="text-12px color-[var(--el-text-color-placeholder)]">数据截至 {{ overview.date }}</span>
        <el-button :icon="Refresh" circle @click="fetchAll" />
      </div>
    </div>

    <!-- ==================== 1. KPI 卡片区（2行×3列） ==================== -->
    <div class="grid grid-cols-6 gap-16px">
      <RaKpiCard
        v-for="card in KPI_CARDS"
        :key="card.key"
        :label="card.label"
        :value="getKpiValue(card.key)"
        :change="getKpiChange(card.key)"
        :unit="card.unit"
        :icon="card.icon"
        :color="card.color"
        :status="card.status"
      />
    </div>

    <!-- ==================== 2. 预警信号栏 ==================== -->
    <RaAlertBar :alerts="overview?.alerts ?? []" />

    <!-- ==================== 3. 外汇储备趋势图 ==================== -->
    <RaForexTrend :trend="trend" />

    <!-- ==================== 4. 构成图（堆叠面积 + 饼图） ==================== -->
    <RaComposition :trend="trend" />

    <!-- ==================== 5. 黄金分析 + 去美元化（双列） ==================== -->
    <div class="flex gap-16px">
      <RaGoldAnalysis :trend="trend" class="flex-1 min-w-0" />
      <RaDeDollar :trend="trend" class="flex-1 min-w-0" />
    </div>

    <!-- ==================== 6. 明细数据表 ==================== -->
    <div class="rounded-12px bg-white border border-[var(--el-border-color-lighter)] shadow-sm overflow-hidden">
      <div class="flex items-center justify-between p-x-20 p-y-12 border-b border-[var(--el-border-color-lighter)]">
        <span class="text-15px font-600 color-[var(--el-text-color-primary)]">历史明细数据</span>
        <el-button text @click="showDetail = !showDetail">
          {{ showDetail ? '收起' : '展开明细' }}
          <el-icon class="m-l-4px"><ArrowDown v-if="!showDetail" /><ArrowUp v-else /></el-icon>
        </el-button>
      </div>
      <div v-show="showDetail" class="p-x-10 p-y-10">
        <SpTable :columns="DETAIL_COLUMNS" :data="detailRecords" :show-empty="true" size="small" height="400px" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Refresh, Coin, ArrowDown, ArrowUp } from '@element-plus/icons-vue'
import SpTable from '@/components/baseComponents/SpTable/index.vue'
import { ReserveAssetsAPI } from '@/api/macroData/reserves/reserveAssets'
import type { RaOverview, RaTrend, RaDetail } from '@/api/macroData/reserves/types'
import { MONTHS_OPTIONS, KPI_CARDS, DETAIL_COLUMNS } from './utils/moduleOptions'
import RaKpiCard from './components/RaKpiCard.vue'
import RaAlertBar from './components/RaAlertBar.vue'
import RaForexTrend from './components/RaForexTrend.vue'
import RaComposition from './components/RaComposition.vue'
import RaGoldAnalysis from './components/RaGoldAnalysis.vue'
import RaDeDollar from './components/RaDeDollar.vue'

// ==================== 状态 ====================
const months = ref(120)
const overview = ref<RaOverview | null>(null)
const trend = ref<RaTrend | null>(null)
const detail = ref<RaDetail | null>(null)
const showDetail = ref(false)

// ==================== KPI 取值 ====================
const overviewMap = computed(() => {
  if (!overview.value) return {} as Record<string, any>
  return overview.value
})

function getKpiValue(key: string): number {
  return (overviewMap.value as any)?.[key] ?? 0
}

function getKpiChange(key: string): number {
  return (overviewMap.value as any)?.[key + 'Change'] ?? 0
}

const detailRecords = computed(() => [...(detail.value?.records ?? [])].reverse())

// ==================== 数据加载 ====================
async function fetchAll() {
  const m = months.value
  const [ov, tr, dt] = await Promise.allSettled([
    ReserveAssetsAPI.getOverview(),
    ReserveAssetsAPI.getTrend(m),
    ReserveAssetsAPI.getDetail(m),
  ])
  if (ov.status === 'fulfilled') overview.value = ov.value as unknown as RaOverview
  if (tr.status === 'fulfilled') trend.value = tr.value as unknown as RaTrend
  if (dt.status === 'fulfilled') detail.value = dt.value as unknown as RaDetail
}

onMounted(() => { fetchAll() })
</script>
