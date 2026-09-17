<template>
  <div class="bg-white rounded-14px p-20px shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-solid border-[#ebeef5]">
    <div class="flex justify-between items-center mb-16px">
      <h2 class="flex items-center gap-8px m-0 text-16px font-700 color-[#1d2129]">
        <div class="w-4px h-16px rounded-2px bg-[#409eff]" />
        大盘指数
      </h2>
      <span class="text-12px color-[#909399] font-mono">{{ currentTime }}</span>
    </div>
    <div class="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-12px">
      <div
        v-for="item in marketData"
        :key="item.indexCode"
        class="index-card group rounded-12px px-16px py-14px text-left transition-all-250 cursor-default relative overflow-hidden bg-white border border-solid hover:(-translate-y-1px shadow-[0_6px_20px_rgba(0,0,0,0.06)])"
        :class="item.changePct != null
          ? (item.changePct >= 0 ? 'border-[rgba(245,63,63,0.15)] hover:border-[rgba(245,63,63,0.3)]' : 'border-[rgba(34,197,94,0.15)] hover:border-[rgba(34,197,94,0.3)]')
          : 'border-[#e8edf3] hover:border-[#d0d7e2]'"
      >
        <!-- 左侧彩色指示条 -->
        <div
          class="absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full transition-all-300"
          :class="item.changePct != null ? (item.changePct >= 0 ? 'bg-[#f53f3f]' : 'bg-[#00b42a]') : 'bg-[#d0d7e2]'"
        />
        <div class="flex items-center justify-between mb-8px pl-6px">
          <span class="text-13px font-500 color-[#4e5969] truncate">{{ item.indexName }}</span>
          <span
            v-if="item.changePct != null"
            class="text-11px font-600 px-5px py-1px rounded-4px"
            :class="item.changePct >= 0 ? 'bg-[rgba(245,63,63,0.08)] color-[#f53f3f]' : 'bg-[rgba(34,197,94,0.08)] color-[#00b42a]'"
          >
            {{ item.changePct >= 0 ? '+' : '' }}{{ item.changePct.toFixed(2) }}%
          </span>
          <span v-else class="text-11px font-500 color-[#a0aec0]">--</span>
        </div>
        <div class="text-22px font-700 color-[#0f172a] font-['DIN_Alternate',monospace] leading-tight pl-6px">
          {{ item.latestPrice != null ? item.latestPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '--' }}
        </div>
        <div class="mt-6px pl-6px">
          <span v-if="item.changeAmt != null" class="text-12px font-500" :class="item.changeAmt >= 0 ? 'color-[#f53f3f]' : 'color-[#00b42a]'">
            {{ item.changeAmt >= 0 ? '+' : '' }}{{ item.changeAmt.toFixed(2) }}
          </span>
          <span v-else class="text-12px font-500 color-[#a0aec0]">暂无涨跌数据</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { IndexSpotAPI, type IndexSpot } from '@/api/stockFund/stock/indexSpot.ts'

const marketData = ref<IndexSpot[]>([])

/** 加载大盘指数 */
async function loadData() {
  try {
    marketData.value = await IndexSpotAPI.list()
  } catch { /* 静默失败 */ }
}

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
  loadData()
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>
