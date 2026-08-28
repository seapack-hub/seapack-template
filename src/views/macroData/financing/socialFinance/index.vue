<template>
  <div class="h-full flex flex-col gap-16px">
    <!-- ==================== 1. Header ==================== -->
    <SfHeader v-model:months="months" @refresh="fetchAll" />

    <!-- ==================== 2. KPI 卡片区 ==================== -->
    <SfKpiBar :overview="overview" />

    <!-- ==================== 3. Tab 分层：第一层 / 第二层 / 第三层 ==================== -->
    <el-tabs v-model="activeTab">
      <!-- ===== 第一层：宏观总览 ===== -->
      <el-tab-pane label="宏观总览" name="overview" class="">
        <SfTrendChart :trend="trend" />
        <div class="flex gap-16px">
          <SfStructurePie :structure="structure" class="w-[50%]" />
          <SfCreditPulse :trend="trend" class="w-[50%]" />
        </div>
      </el-tab-pane>

      <!-- ===== 第二层：结构下钻 ===== -->
      <el-tab-pane label="结构分析" name="structure" class="flex-1 min-h-0 flex flex-col gap-16px">
        <SfStructureArea :trend="trend" />
      </el-tab-pane>

      <!-- ===== 第三层：高级工具 ===== -->
      <el-tab-pane label="高级工具" name="advanced" class="flex-1 min-h-0 flex flex-col gap-16px">
        <SfCreditPulse :trend="trend" />
        <SfQuadrant :trend="trend" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { SocialFinanceAPI } from '@/api/macroData/financing/socialFinance'
import type { SfOverview, SfTrend, SfStructure } from '@/api/macroData/financing/types'
import SfHeader from './components/SfHeader.vue'
import SfKpiBar from './components/SfKpiBar.vue'
import SfTrendChart from './components/SfTrendChart.vue'
import SfStructurePie from './components/SfStructurePie.vue'
import SfStructureArea from './components/SfStructureArea.vue'
import SfCreditPulse from './components/SfCreditPulse.vue'
import SfQuadrant from './components/SfQuadrant.vue'

// ==================== 状态 ====================
const months = ref(36)
const activeTab = ref('overview')
const overview = ref<SfOverview | null>(null)
const trend = ref<SfTrend | null>(null)
const structure = ref<SfStructure | null>(null)

// ==================== 数据加载 ====================
async function fetchAll() {
  const m = months.value
  const [ov, tr, st] = await Promise.allSettled([
    SocialFinanceAPI.getOverview(),
    SocialFinanceAPI.getTrend(m),
    SocialFinanceAPI.getStructure(m),
  ])
  if (ov.status === 'fulfilled') overview.value = ov.value as unknown as SfOverview
  if (tr.status === 'fulfilled') trend.value = tr.value as unknown as SfTrend
  if (st.status === 'fulfilled') structure.value = st.value as unknown as SfStructure
}

onMounted(() => { fetchAll() })
</script>

<style scoped>
:deep(.el-tabs__content) {
  flex: 1;
  min-height: 0;
}
:deep(.el-tab-pane) {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow: auto;
}
</style>
