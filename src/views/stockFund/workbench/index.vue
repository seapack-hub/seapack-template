<template>
  <div class="h-full flex flex-col bg-[#f5f7fa] overflow-hidden">
    <!-- 页面头部 -->
    <div class="shrink-0 bg-gradient-to-r from-white to-[#f8f9fa] rounded-12px border border-solid border-[#e4e7ed] px-24px py-16px mb-16px">
      <h1 class="text-18px font-700 color-[#303133] m-0 mb-4px tracking-0.5px">金融数据中心</h1>
      <p class="text-12px color-[#909399] m-0 tracking-0.3px">实时行情监控 · 智能投研分析 · 基金信息管理</p>
    </div>

    <!-- 内容区域 -->
    <div class="flex-1 min-h-0 flex flex-col gap-16px overflow-y-auto">
      <MarketOverview :market-data="marketData" />
      <FeatureGrid :features="features" />
    </div>
  </div>
</template>

<script setup lang="ts">
import MarketOverview from './components/MarketOverview.vue'
import FeatureGrid from './components/FeatureGrid.vue'
import { marketData, features } from './data'
</script>
