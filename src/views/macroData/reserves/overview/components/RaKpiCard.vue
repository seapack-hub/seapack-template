<template>
  <div
    class="box-border p-x-20 p-y-16 rounded-12px bg-white shadow-sm hover:shadow-md transition-shadow"
    :style="{ borderTop: `3px solid ${color}` }"
  >
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-8px">
        <div class="w-32px h-32px rounded-8px flex items-center justify-center" :style="{ backgroundColor: color + '15' }">
          <el-icon :size="18" :color="color"><component :is="iconComp" /></el-icon>
        </div>
        <span class="text-14px font-500 color-[var(--el-text-color-secondary)]">{{ label }}</span>
      </div>
      <el-tag :type="statusType" size="small" effect="plain">{{ status }}</el-tag>
    </div>
    <div class="m-t-14px flex items-baseline gap-4px">
      <span class="text-26px font-800" :style="{ color }">{{ formattedValue }}</span>
      <span class="text-13px font-400 color-[var(--el-text-color-secondary)]">{{ unit }}</span>
    </div>
    <div class="m-t-8px flex items-center gap-6px">
      <span :class="change >= 0 ? 'color-[#67C23A]' : 'color-[#F56C6C]'" class="text-13px font-500">
        {{ change >= 0 ? '↑' : '↓' }} {{ change >= 0 ? '+' : '' }}{{ formattedChange }}
      </span>
      <span class="text-12px color-[var(--el-text-color-placeholder)]">环比</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Wallet, Coin, OfficeBuilding, Document, FirstAidKit } from '@element-plus/icons-vue'

const ICON_MAP: Record<string, any> = { Wallet, Coin, OfficeBuilding, Document, FirstAidKit }

const props = defineProps<{
  label: string
  value: number
  change: number
  unit: string
  icon: string
  color: string
  status: string
}>()

const iconComp = computed(() => ICON_MAP[props.icon] || Coin)

const formattedValue = computed(() => {
  if (props.value == null) return '--'
  return props.value.toLocaleString('zh-CN', { maximumFractionDigits: 2 })
})

const formattedChange = computed(() => {
  if (props.change == null) return '0'
  return Math.abs(props.change).toLocaleString('zh-CN', { maximumFractionDigits: 2 })
})

const statusType = computed(() => {
  if (props.status === '稳定') return 'success'
  if (props.status === '增持中') return 'warning'
  return 'info'
})
</script>
