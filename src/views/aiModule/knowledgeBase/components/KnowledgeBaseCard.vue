<!--
  知识库卡片组件
  图标 + 名称 + 统计 + 操作
-->
<template>
  <div class="kb-card">
    <div class="card-top">
      <div class="card-icon">{{ kb.icon || kb.name?.charAt(0) || 'K' }}</div>
      <el-switch
        :model-value="kb.status"
        :active-value="1"
        :inactive-value="0"
        size="small"
        @change="(val: number) => emit('statusChange', kb, val)"
      />
    </div>
    <div class="card-name">{{ kb.name }}</div>
    <div class="card-desc">{{ kb.description || '暂无描述' }}</div>
    <div class="card-stats">
      <div class="stat-item">
        <span class="stat-value">{{ kb.documentCount || 0 }}</span>
        <span class="stat-label">文档</span>
      </div>
      <div class="stat-divider" />
      <div class="stat-item">
        <span class="stat-value">{{ kb.chunkCount || 0 }}</span>
        <span class="stat-label">分片</span>
      </div>
      <div class="stat-divider" />
      <div class="stat-item">
        <span class="stat-value">{{ formatTokens(kb.totalTokens) }}</span>
        <span class="stat-label">Token</span>
      </div>
    </div>
    <div class="card-model">
      <el-tag size="small" type="info">{{ kb.embeddingModel }}</el-tag>
    </div>
    <div class="card-footer">
      <div class="flex gap-4px">
        <el-button link size="small" @click="emit('edit', kb)">编辑</el-button>
        <el-button link size="small" @click="emit('documents', kb)">文档</el-button>
        <el-button link size="small" @click="emit('chunks', kb)">分片</el-button>
        <el-button link size="small" @click="emit('retrieve', kb)">检索测试</el-button>
        <el-button link size="small" @click="emit('copy', kb)">复制</el-button>
        <el-button link type="danger" size="small" @click="emit('delete', kb)">删除</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { KnowledgeBase } from '@/api/ai/knowledgeBase'

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

<style scoped>
.kb-card {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: box-shadow 0.2s;
  background: white;
}
.kb-card:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}
.card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.card-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--el-color-primary-light-3), var(--el-color-primary));
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 600;
}
.card-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.card-desc {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 36px;
}
.card-stats {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  border-top: 1px solid var(--el-border-color-extra-light);
}
.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}
.stat-value {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  font-variant-numeric: tabular-nums;
}
.stat-label {
  font-size: 11px;
  color: var(--el-text-color-secondary);
  margin-top: 2px;
}
.stat-divider {
  width: 1px;
  height: 24px;
  background: var(--el-border-color-extra-light);
}
.card-model {
  display: flex;
}
.card-footer {
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid var(--el-border-color-extra-light);
  padding-top: 10px;
}
</style>
