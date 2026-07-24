<!--
  提示词模板卡片组件
  图标+名称同一行 + 描述 + 元信息 + 操作栏
-->
<template>
  <div class="tpl-card">
    <!-- 顶栏：图标 + 名称 + 类型标签 + 状态开关 -->
    <div class="flex items-center gap-10px">
      <div
        class="tpl-card__icon"
        :style="{ background: coverGradient }"
      >
        <el-icon :size="20" color="#fff"><Document /></el-icon>
      </div>
      <span class="flex-1 truncate text-14px fw-600 color-[var(--el-text-color-primary)]">{{ tpl.name }}</span>
      <el-tag v-if="tpl.type === 1" size="small" type="warning" effect="light" class="!text-11px !ml-0">系统预设</el-tag>
      <el-switch
        :model-value="tpl.status"
        :active-value="1"
        :inactive-value="0"
        size="small"
        @change="(val: number) => emit('statusChange', tpl, val)"
      />
    </div>

    <!-- 描述 -->
    <p class="tpl-card__desc">
      {{ tpl.description || '暂无描述' }}
    </p>

    <!-- 元信息 -->
    <div class="tpl-card__meta">
      <el-tag :type="categoryTagType(tpl.category) as any" effect="light" class="!text-11px">{{ categoryLabel(tpl.category) }}</el-tag>
      <el-tag v-if="tpl.outputFormat" type="" effect="light" class="!text-11px">{{ tpl.outputFormat }}</el-tag>
      <span class="tpl-card__usage">{{ tpl.useCount || 0 }} 次使用</span>
    </div>

    <!-- 底栏 -->
    <div class="tpl-card__footer">
      <span class="tpl-card__type">Template</span>
      <div class="tpl-card__actions">
        <el-tooltip content="编辑" placement="top" :show-after="400">
          <button class="tpl-card__action" @click="emit('edit', tpl)">
            <el-icon :size="14"><Edit /></el-icon>
          </button>
        </el-tooltip>
        <el-tooltip content="预览" placement="top" :show-after="400">
          <button class="tpl-card__action" @click="emit('preview', tpl)">
            <el-icon :size="14"><View /></el-icon>
          </button>
        </el-tooltip>
        <el-tooltip content="复制" placement="top" :show-after="400">
          <button class="tpl-card__action" @click="emit('copy', tpl)">
            <el-icon :size="14"><CopyDocument /></el-icon>
          </button>
        </el-tooltip>
        <div class="tpl-card__divider" />
        <el-tooltip content="删除" placement="top" :show-after="400">
          <button class="tpl-card__action tpl-card__action--danger" @click="emit('delete', tpl)">
            <el-icon :size="14"><Delete /></el-icon>
          </button>
        </el-tooltip>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Document, Edit, View, CopyDocument, Delete } from '@element-plus/icons-vue'
import type { PromptTemplate } from '@/api/ai/promptTemplate'
import { categoryLabel, categoryTagType } from '../utils/moduleOptions'

const props = defineProps<{ tpl: PromptTemplate }>()

const emit = defineEmits<{
  edit: [tpl: PromptTemplate]
  preview: [tpl: PromptTemplate]
  copy: [tpl: PromptTemplate]
  delete: [tpl: PromptTemplate]
  statusChange: [tpl: PromptTemplate, val: number]
}>()

const coverGradient = computed(() => {
  const colors: Record<string, string[]> = {
    stock_analysis: ['#f093fb', '#f5576c'],
    content_gen: ['#667eea', '#764ba2'],
    data_qa: ['#4facfe', '#00f2fe'],
    general: ['#43e97b', '#38f9d7'],
  }
  const pair = colors[props.tpl.category || ''] || ['#a18cd1', '#fbc2eb']
  return `linear-gradient(135deg, ${pair[0]}, ${pair[1]})`
})
</script>

<style lang="scss" scoped>
.tpl-card {
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
  }

  &__usage {
    font-size: 11px;
    color: var(--el-text-color-placeholder);
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
