<template>
  <div class="flex-1 bg-white rounded-14px p-20px shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-solid border-[#ebeef5] flex flex-col min-h-0">
    <div class="flex justify-between items-center mb-16px shrink-0">
      <h2 class="flex items-center gap-8px m-0 text-16px font-700 color-[#1d2129]">
        <div class="w-4px h-16px rounded-2px bg-[#722ed1]" />
        功能模块
      </h2>
    </div>
    <div class="flex-1 min-h-0 grid grid-cols-3 gap-12px max-lg:grid-cols-2 max-md:grid-cols-1 content-start auto-rows-min">
      <FeatureCardLight
        v-for="(feat, idx) in features"
        :key="feat.name"
        :icon="feat.icon"
        :title="feat.title"
        :desc="feat.desc"
        :color="feat.color"
        :stat="feat.stat"
        :style="{ animationDelay: `${idx * 0.08}s` }"
        @click="navigateTo(feat)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/modules/user'
import FeatureCardLight from './FeatureCardLight.vue'
import type { FeatureItem } from '../data'

defineProps<{
  features: FeatureItem[]
}>()

const router = useRouter()
const userStore = useUserStore()

const featureNameMap: Record<string, string> = {
  stockQuote: '股票实时行情',
  aiStockAnalysis: 'AI 个股诊断',
  stockPool: '股票池管理',
  dividendData: '分红数据维护',
  dashboardView: '股票监控池',
  alertHistory: '告警历史记录',
  fundBaseInfo: '基金信息',
}

function navigateTo(feat: FeatureItem) {
  if (feat.permKey && !userStore.menuPermKeys.includes(feat.permKey)) {
    ElMessage.warning(`暂无「${featureNameMap[feat.name] ?? feat.title}」模块的访问权限，请联系管理员开通`)
    return
  }
  router.push({ path: feat.route })
}
</script>
