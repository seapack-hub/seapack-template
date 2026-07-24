<!--
  场景卡片组件
  图标+名称同一行 + 描述 + 操作栏
-->
<template>
  <div class="scene-card">
    <!-- 顶栏：图标 + 名称 + 状态开关 -->
    <div class="flex items-center gap-10px">
      <div
        class="scene-card__icon"
        :style="{ background: coverGradient }"
      >
        <Icon v-if="scene.icon" :name="scene.icon" :size="22" color="#fff" />
        <span v-else class="color-white text-14px fw-700">{{ scene.name?.charAt(0) || 'S' }}</span>
      </div>
      <span class="flex-1 truncate text-14px fw-600 color-[var(--el-text-color-primary)]">{{ scene.name }}</span>
      <el-switch
        :model-value="scene.status"
        :active-value="1"
        :inactive-value="0"
        size="small"
        @change="(val: number) => emit('statusChange', scene, val)"
      />
    </div>

    <!-- 描述 -->
    <p class="scene-card__desc">
      {{ scene.description || '暂无描述' }}
    </p>

    <!-- 部署位置标签 -->
    <div v-if="scene.deployments?.length" class="scene-card__tags">
      <el-tag
        v-for="d in scene.deployments"
        :key="d.id"
        size="small"
        :type="d.status === 0 ? 'info' : ''"
        effect="plain"
        :class="{ 'is-disabled': d.status === 0 }"
      >
        {{ getPositionLabel(d.moduleKey, d.positionKey) }}
      </el-tag>
    </div>

    <!-- 底栏 -->
    <div class="scene-card__footer">
      <span class="scene-card__usage">
        <el-icon :size="12"><View /></el-icon>
        {{ scene.useCount || 0 }} 次使用
      </span>
      <div class="scene-card__actions">
        <el-tooltip content="编辑" placement="top" :show-after="400">
          <button class="scene-card__action" @click="emit('edit', scene)">
            <el-icon :size="14"><Edit /></el-icon>
          </button>
        </el-tooltip>
        <el-tooltip content="配置" placement="top" :show-after="400">
          <button class="scene-card__action" @click="emit('config', scene)">
            <el-icon :size="14"><Setting /></el-icon>
          </button>
        </el-tooltip>
        <el-tooltip content="复制" placement="top" :show-after="400">
          <button class="scene-card__action" @click="emit('copy', scene)">
            <el-icon :size="14"><CopyDocument /></el-icon>
          </button>
        </el-tooltip>
        <div class="scene-card__divider" />
        <el-tooltip content="删除" placement="top" :show-after="400">
          <button class="scene-card__action scene-card__action--danger" @click="emit('delete', scene)">
            <el-icon :size="14"><Delete /></el-icon>
          </button>
        </el-tooltip>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { View, Edit, Setting, CopyDocument, Delete } from '@element-plus/icons-vue'
import type { Scene } from '@/api/ai/scene'
import { getPositionLabel } from '@/config/aiPositions'
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

<style lang="scss" scoped>
.scene-card {
  background: #fff;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: default;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
    border-color: var(--el-color-primary-light-7);
  }

  &__icon {
    flex-shrink: 0;
    width: 36px;
    height: 36px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  &__desc {
    margin: 0;
    font-size: 12px;
    line-height: 18px;
    color: var(--el-text-color-secondary);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    min-height: 36px;
  }

  &__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;

    .el-tag {
      font-size: 11px;

      &.is-disabled {
        opacity: 0.5;
      }
    }
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 10px;
    border-top: 1px solid var(--el-border-color-extra-light);
  }

  &__usage {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 2px;
  }

  &__action {
    width: 28px;
    height: 28px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    border: none;
    background: transparent;
    color: var(--el-text-color-secondary);
    cursor: pointer;
    transition: all 0.15s ease;

    &:hover {
      background: var(--el-fill-color-light);
      color: var(--el-color-primary);
    }

    &--danger:hover {
      background: var(--el-color-danger-light-9);
      color: var(--el-color-danger);
    }
  }

  &__divider {
    width: 1px;
    height: 12px;
    background: var(--el-border-color-lighter);
    margin: 0 2px;
  }
}
</style>
