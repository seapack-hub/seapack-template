<!--
  知识库卡片组件
  图标+名称同一行 + 描述 + 统计数据 + 模型标签 + 操作栏
-->
<template>
  <div class="kb-card">
    <!-- 顶栏：图标 + 名称 + 状态开关 -->
    <div class="flex items-center gap-10px">
      <div class="kb-card__icon">
        <Icon v-if="kb.icon" :name="kb.icon" :size="20" color="#fff" />
        <span v-else class="color-white text-14px fw-700">{{ kb.name?.charAt(0) || 'K' }}</span>
      </div>
      <span class="flex-1 truncate text-14px fw-600 color-[var(--el-text-color-primary)]">{{ kb.name }}</span>
      <el-switch
        :model-value="kb.status"
        :active-value="1"
        :inactive-value="0"
        size="small"
        @change="(val: number) => emit('statusChange', kb, val)"
      />
    </div>

    <!-- 描述 -->
    <p class="kb-card__desc">
      {{ kb.description || '暂无描述' }}
    </p>

    <!-- 统计数据 -->
    <div class="kb-card__stats">
      <div class="kb-card__stat">
        <span class="kb-card__stat-value">{{ kb.documentCount || 0 }}</span>
        <span class="kb-card__stat-label">文档</span>
      </div>
      <div class="kb-card__stat-divider" />
      <div class="kb-card__stat">
        <span class="kb-card__stat-value">{{ kb.chunkCount || 0 }}</span>
        <span class="kb-card__stat-label">分片</span>
      </div>
      <div class="kb-card__stat-divider" />
      <div class="kb-card__stat">
        <span class="kb-card__stat-value">{{ formatTokens(kb.totalTokens) }}</span>
        <span class="kb-card__stat-label">Token</span>
      </div>
    </div>

    <!-- 模型标签 -->
    <div v-if="kb.embeddingModel" class="kb-card__model">
      <el-tag size="small" type="info" effect="plain" class="!text-11px">{{ kb.embeddingModel }}</el-tag>
    </div>

    <!-- 底栏 -->
    <div class="kb-card__footer">
      <span class="kb-card__type">Knowledge</span>
      <div class="kb-card__actions">
        <el-tooltip content="编辑" placement="top" :show-after="400">
          <button class="kb-card__action" @click="emit('edit', kb)">
            <el-icon :size="14"><Edit /></el-icon>
          </button>
        </el-tooltip>
        <el-tooltip content="文档" placement="top" :show-after="400">
          <button class="kb-card__action" @click="emit('documents', kb)">
            <el-icon :size="14"><Document /></el-icon>
          </button>
        </el-tooltip>
        <el-tooltip content="分片" placement="top" :show-after="400">
          <button class="kb-card__action" @click="emit('chunks', kb)">
            <el-icon :size="14"><Grid /></el-icon>
          </button>
        </el-tooltip>
        <el-tooltip content="检索测试" placement="top" :show-after="400">
          <button class="kb-card__action" @click="emit('retrieve', kb)">
            <el-icon :size="14"><Search /></el-icon>
          </button>
        </el-tooltip>
        <el-tooltip content="复制" placement="top" :show-after="400">
          <button class="kb-card__action" @click="emit('copy', kb)">
            <el-icon :size="14"><CopyDocument /></el-icon>
          </button>
        </el-tooltip>
        <div class="kb-card__divider" />
        <el-tooltip content="删除" placement="top" :show-after="400">
          <button class="kb-card__action kb-card__action--danger" @click="emit('delete', kb)">
            <el-icon :size="14"><Delete /></el-icon>
          </button>
        </el-tooltip>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Edit, Document, Grid, Search, CopyDocument, Delete } from '@element-plus/icons-vue'
import type { KnowledgeBase } from '@/api/ai/knowledgeBase'
import Icon from '@/components/Icon/index.vue'

defineProps<{ kb: KnowledgeBase }>()

const emit = defineEmits<{
  edit: [kb: KnowledgeBase]
  documents: [kb: KnowledgeBase]
  chunks: [kb: KnowledgeBase]
  retrieve: [kb: KnowledgeBase]
  copy: [kb: KnowledgeBase]
  delete: [kb: KnowledgeBase]
  statusChange: [kb: KnowledgeBase, val: number]
}>()

function formatTokens(val?: number) {
  if (!val) return '0'
  if (val >= 1000000) return (val / 1000000).toFixed(1) + 'M'
  if (val >= 1000) return (val / 1000).toFixed(1) + 'K'
  return String(val)
}
</script>

<style lang="scss" scoped>
.kb-card {
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
    background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
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

  &__stats {
    display: flex;
    align-items: center;
    padding-top: 10px;
    border-top: 1px solid var(--el-border-color-extra-light);
  }

  &__stat {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }

  &__stat-value {
    font-size: 16px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    font-variant-numeric: tabular-nums;
  }

  &__stat-label {
    font-size: 11px;
    color: var(--el-text-color-secondary);
  }

  &__stat-divider {
    width: 1px;
    height: 24px;
    background: var(--el-border-color-extra-light);
  }

  &__model {
    display: flex;
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
