<template>
  <div class="bg-white rounded-12px p-16px shadow-[0_1px_3px_rgba(0,0,0,0.06)] border border-solid border-[#e4e7ed]">
    <div class="flex justify-between items-center mb-12px">
      <h2 class="flex items-center gap-8px m-0 text-15px font-600 color-[#303133]">
        <el-icon class="color-[#409eff] text-16px"><DataLine /></el-icon>
        大盘指数
      </h2>
      <span class="text-12px color-[#909399]">{{ currentTime }}</span>
    </div>
    <div class="grid grid-cols-4 gap-12px max-lg:grid-cols-2 max-sm:grid-cols-1">
      <div
        v-for="item in marketData"
        :key="item.label"
        class="market-item bg-[#f8f9fa] rounded-10px p-14px text-center transition-all-300 border border-transparent hover:(-translate-y-1px shadow-[0_4px_12px_rgba(0,0,0,0.06)])"
        :class="item.change >= 0 ? 'border-[rgba(245,63,63,0.1)]' : 'border-[rgba(34,197,94,0.1)]'"
      >
        <div class="text-12px color-[#909399] mb-6px">{{ item.label }}</div>
        <div class="text-18px font-700 color-[#303133] font-['DIN_Alternate',monospace] mb-4px">{{ item.value }}</div>
        <div
          class="inline-flex items-center gap-4px text-12px font-600 px-6px py-2px rounded-4px"
          :class="item.change >= 0 ? 'color-[#f53f3f] bg-[rgba(245,63,63,0.08)]' : 'color-[#22c55e] bg-[rgba(34,197,94,0.08)]'"
        >
          <el-icon v-if="item.change >= 0"><Top /></el-icon>
          <el-icon v-else><Bottom /></el-icon>
          {{ item.change >= 0 ? '+' : '' }}{{ item.change }}%
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { DataLine, Top, Bottom } from '@element-plus/icons-vue'

defineProps<{
  marketData: Array<{
    label: string
    value: string
    change: number
  }>
}>()

const currentTime = ref('')
let timer: ReturnType<typeof setInterval> | null = null

function updateTime() {
  const now = new Date()
  currentTime.value = now.toLocaleString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

onMounted(() => {
  updateTime()
  timer = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>
