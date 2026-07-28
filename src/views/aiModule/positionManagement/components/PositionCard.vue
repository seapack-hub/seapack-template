<!--
  位置卡片组件
  图标+名称同一行 + 描述 + 元信息标签 + 操作栏
  参考 PromptTemplateCard 的结构
-->
<template>
  <div class="pos-card">
    <!-- 顶栏：图标 + 名称 + 状态开关 -->
    <div class="flex items-center gap-10px">
      <div
        class="pos-card__icon"
        :style="{ background: moduleColor }"
      >
        <Icon :name="moduleIcon" :size="20" color="#fff" />
      </div>
      <span class="flex-1 truncate text-14px fw-600 color-[var(--el-text-color-primary)]">{{ moduleTitle }}</span>
      <el-switch
        :model-value="pos.status"
        :active-value="1"
        :inactive-value="0"
        size="small"
        @change="(val) => emit('statusChange', pos, val as number)"
      />
    </div>

    <!-- 描述 -->
    <p class="pos-card__desc">
      {{ pos.description || '暂无描述' }}
    </p>

    <!-- 元信息 -->
    <div class="pos-card__meta">
      <el-tag effect="plain" size="small" class="!text-11px">{{ pos.moduleKey }}</el-tag>
      <el-tag effect="light" size="small" class="!text-11px">{{ pos.positionKey }}</el-tag>
      <el-tag v-if="pos.component" type="info" effect="light" size="small" class="!text-11px">{{ pos.component }}</el-tag>
    </div>

    <!-- 底栏 -->
    <div class="pos-card__footer">
      <span class="pos-card__type">Position</span>
      <div class="pos-card__actions">
        <el-tooltip content="编辑" placement="top" :show-after="400">
          <button class="pos-card__action" @click="emit('edit', pos)">
            <el-icon :size="14"><Edit /></el-icon>
          </button>
        </el-tooltip>
        <div class="pos-card__divider" />
        <el-tooltip content="删除" placement="top" :show-after="400">
          <button class="pos-card__action pos-card__action--danger" @click="emit('delete', pos)">
            <el-icon :size="14"><Delete /></el-icon>
          </button>
        </el-tooltip>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Edit, Delete } from '@element-plus/icons-vue'
import type { AiPosition } from '@/api/ai/position'
import { MODULE_DEFS } from '@/config/modules'
import Icon from '@/components/Icon/index.vue'

const props = defineProps<{ pos: AiPosition }>()

const emit = defineEmits<{
  edit: [pos: AiPosition]
  delete: [pos: AiPosition]
  statusChange: [pos: AiPosition, val: number]
}>()

/** 根据 moduleKey 从 MODULE_DEFS 获取模块信息 */
const moduleDef = computed(() => MODULE_DEFS.find(m => m.key === props.pos.moduleKey))

/** 模块图标名 */
const moduleIcon = computed(() => moduleDef.value?.icon || '')

/** 模块主题色 */
const moduleColor = computed(() => moduleDef.value?.color || '#43e97b')

/** 模块中文名（用于标签展示） */
const moduleTitle = computed(() => moduleDef.value?.title || props.pos.moduleKey)
</script>

<style lang="scss" scoped>
.pos-card {
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

  &__meta {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 10px;
    border-top: 1px solid var(--el-border-color-extra-light);
  }

  &__type {
    font-size: 12px;
    color: var(--el-text-color-placeholder);
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
