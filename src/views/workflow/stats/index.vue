<template>
  <div class="app-container w-100% h-100% flex flex-col gap-16px">
    <!-- 总览卡片 -->
    <div class="grid grid-cols-4 gap-16px">
      <el-card v-for="card in overviewCards" :key="card.label" shadow="never" class="overview-card">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-12px text-gray-400 mb-4px">{{ card.label }}</div>
            <div class="text-24px font-bold">{{ card.value }}</div>
          </div>
          <el-icon :size="40" :color="card.color"><component :is="card.icon" /></el-icon>
        </div>
      </el-card>
    </div>

    <!-- 图表区域 -->
    <div class="grid grid-cols-2 gap-16px flex-1 min-h-0">
      <!-- 执行趋势 -->
      <el-card shadow="never" class="flex flex-col">
        <template #header>
          <div class="flex items-center justify-between">
            <span class="text-14px font-medium">执行趋势</span>
            <el-date-picker v-model="dateRange" type="daterange" range-separator="~" start-placeholder="开始日期" end-placeholder="结束日期" size="small" @change="loadStats" />
          </div>
        </template>
        <div ref="trendChartRef" class="flex-1 min-h-300px"></div>
      </el-card>

      <!-- 热门工作流 -->
      <el-card shadow="never" class="flex flex-col">
        <template #header>
          <span class="text-14px font-medium">热门工作流 Top 10</span>
        </template>
        <div ref="topChartRef" class="flex-1 min-h-300px"></div>
      </el-card>
    </div>

    <!-- 统计明细 -->
    <el-card shadow="never">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="text-14px font-medium">工作流统计明细</span>
          <el-button type="primary" size="small" @click="loadStats">刷新</el-button>
        </div>
      </template>
      <SpTable :columns="columns" :data="statsData" :show-index="false" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { useWorkflowStats } from '../utils/useWorkflowStats'
import { STATS_COLUMNS } from '../utils/tableColumns'
import SpTable from '@/components/baseComponents/SpTable/index.vue'

const {
  statsData,
  dateRange,
  trendChartRef,
  topChartRef,
  overviewCards,
  loadStats,
} = useWorkflowStats()

const columns = STATS_COLUMNS

// 显式引用以消除 linter 警告（模板 ref 绑定使用）
defineExpose({ trendChartRef, topChartRef })
</script>

<style lang="scss" scoped>
.overview-card {
  :deep(.el-card__body) {
    padding: 16px;
  }
}
</style>
