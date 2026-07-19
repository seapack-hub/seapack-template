<!--
  场景卡片组件
  图标+名称同一行 + 描述 + 操作栏
-->
<template>
  <div
    class="bg-white border border-solid border-[var(--el-border-color-lighter)] rounded-xl p-16px flex flex-col gap-12px transition-all-250 cursor-default hover:-translate-y-2px hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-[var(--el-color-primary-light-7)]"
  >
    <!-- 顶栏：图标 + 名称 + 状态开关 -->
    <div class="flex items-center gap-10px">
      <div
        class="flex-shrink-0 w-40px h-40px rounded-lg flex items-center justify-center shadow-[0_3px_10px_rgba(0,0,0,0.08)]"
        :style="{ background: coverGradient }"
      >
        <Icon v-if="scene.icon" :name="scene.icon" :size="30" color="#fff" />
        <span v-else class="color-white text-16px fw-700">{{ scene.name?.charAt(0) || 'S' }}</span>
      </div>
      <span class="flex-1 truncate text-15px fw-600 color-[var(--el-text-color-primary)]">{{ scene.name }}</span>
      <el-switch
        :model-value="scene.status"
        :active-value="1"
        :inactive-value="0"
        size="small"
        @change="(val: number) => emit('statusChange', scene, val)"
      />
    </div>

    <!-- 描述 -->
    <p class="m-0 text-12px lh-17px color-[var(--el-text-color-secondary)] line-clamp-2 min-h-[34px]">
      {{ scene.description || '暂无描述' }}
    </p>

    <!-- 底栏 -->
    <div class="flex items-center justify-between pt-10px border-t border-t-solid border-t-[var(--el-border-color-extra-light)]">
      <span class="inline-flex items-center gap-4px text-12px color-[var(--el-text-color-secondary)]">
        <el-icon :size="12"><View /></el-icon>
        {{ scene.useCount || 0 }} 次使用
      </span>
      <div class="flex items-center gap-2px">
        <span class="w-26px h-26px inline-flex items-center justify-center rounded-6px color-[var(--el-text-color-secondary)] cursor-pointer transition-all-150 hover:bg-[var(--el-fill-color-light)] hover:text-[var(--el-color-primary)]" title="编辑" @click="emit('edit', scene)">
          <el-icon :size="13"><Edit /></el-icon>
        </span>
        <span class="w-26px h-26px inline-flex items-center justify-center rounded-6px color-[var(--el-text-color-secondary)] cursor-pointer transition-all-150 hover:bg-[var(--el-fill-color-light)] hover:text-[var(--el-color-primary)]" title="配置" @click="emit('config', scene)">
          <el-icon :size="13"><Setting /></el-icon>
        </span>
        <span class="w-26px h-26px inline-flex items-center justify-center rounded-6px color-[var(--el-text-color-secondary)] cursor-pointer transition-all-150 hover:bg-[var(--el-fill-color-light)] hover:text-[var(--el-color-primary)]" title="复制" @click="emit('copy', scene)">
          <el-icon :size="13"><CopyDocument /></el-icon>
        </span>
        <span class="w-26px h-26px inline-flex items-center justify-center rounded-6px color-[var(--el-text-color-secondary)] cursor-pointer transition-all-150 hover:bg-[var(--el-color-danger-light-9)] hover:text-[var(--el-color-danger)]" title="删除" @click="emit('delete', scene)">
          <el-icon :size="13"><Delete /></el-icon>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { View, Edit, Setting, CopyDocument, Delete } from '@element-plus/icons-vue'
import type { Scene } from '@/api/ai/scene'
import Icon from '@/components/Icon/index.vue'

const props = defineProps<{ scene: Scene }>()

const emit = defineEmits<{
  edit: [scene: Scene]
  config: [scene: Scene]
  copy: [scene: Scene]
  delete: [scene: Scene]
  statusChange: [scene: Scene, val: number]
}>()

/** 图标背景渐变 */
const coverGradient = computed(() => {
  const c = props.scene.coverColor
  if (!c) return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  return `linear-gradient(135deg, ${c}, ${lighten(c, 40)})`
})

function lighten(hex: string, percent: number): string {
  const n = parseInt(hex.replace('#', ''), 16)
  const r = Math.min(255, ((n >> 16) & 0xff) + Math.round(255 * percent / 100))
  const g = Math.min(255, ((n >> 8) & 0xff) + Math.round(255 * percent / 100))
  const b = Math.min(255, (n & 0xff) + Math.round(255 * percent / 100))
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
}
</script>
