<template>
  <div class="h-full flex flex-col bg-[#f5f7fa] overflow-hidden">
    <!-- 页面头部 -->
    <div class="shrink-0 bg-white rounded-14px border border-solid border-[#ebeef5] shadow-[0_2px_12px_rgba(0,0,0,0.04)] px-24px py-18px mb-16px">
      <div class="flex items-center gap-12px">
        <div class="w-40px h-40px rounded-10px bg-gradient-to-br from-[#409eff] to-[#66b1ff] flex items-center justify-center shadow-[0_4px_12px_rgba(64,158,255,0.3)]">
          <el-icon class="text-white text-20px"><TrendCharts /></el-icon>
        </div>
        <div>
          <h1 class="text-18px font-700 color-[#1d2129] m-0 leading-tight">金融数据中心</h1>
          <p class="text-12px color-[#86909c] m-0 mt-2px">实时行情监控 · 智能投研分析 · 基金信息管理</p>
        </div>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="flex-1 min-h-0 flex flex-col gap-16px overflow-y-auto">
      <MarketOverview />
      <FeatureGrid :features="features" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { TrendCharts } from '@element-plus/icons-vue'
import MarketOverview from './components/MarketOverview.vue'
import FeatureGrid from './components/FeatureGrid.vue'
import { features } from './data'
</script>
