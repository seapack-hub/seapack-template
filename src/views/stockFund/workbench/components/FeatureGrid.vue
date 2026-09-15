<template>
  <div class="flex-1 bg-white rounded-12px p-16px shadow-[0_1px_3px_rgba(0,0,0,0.06)] border border-solid border-[#e4e7ed] flex flex-col min-h-0">
    <div class="flex justify-between items-center mb-12px shrink-0">
      <h2 class="flex items-center gap-8px m-0 text-15px font-600 color-[#303133]">
        <el-icon class="color-[#409eff] text-16px"><Menu /></el-icon>
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
        @click="navigateTo(feat.route)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Menu } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import FeatureCardLight from './FeatureCardLight.vue'
import type { FeatureItem } from '../data'

defineProps<{
  features: FeatureItem[]
}>()

const router = useRouter()

function navigateTo(path: string) {
  router.push({ path })
}
</script>
