<!--
  知识库卡片组件
  图标+名称同一行 + 描述 + 统计数据 + 模型标签 + 操作栏
-->
<template>
  <div
    class="bg-white border border-solid border-[var(--el-border-color-lighter)] rounded-xl p-16px flex flex-col gap-12px transition-all-250 cursor-default hover:-translate-y-2px hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-[var(--el-color-primary-light-7)]"
  >
    <!-- 顶栏：图标 + 名称 + 状态开关 -->
    <div class="flex items-center gap-10px">
      <div class="flex-shrink-0 w-40px h-40px rounded-lg flex items-center justify-center shadow-[0_3px_10px_rgba(0,0,0,0.08)] bg-gradient-to-br from-[#43e97b] to-[#38f9d7]">
        <Icon v-if="kb.icon" :name="kb.icon" :size="20" color="#fff" />
        <span v-else class="color-white text-16px fw-700">{{ kb.name?.charAt(0) || 'K' }}</span>
      </div>
      <span class="flex-1 truncate text-15px fw-600 color-[var(--el-text-color-primary)]">{{ kb.name }}</span>
      <el-switch
        :model-value="kb.status"
        :active-value="1"
        :inactive-value="0"
        size="small"
        @change="(val: number) => emit('statusChange', kb, val)"
      />
    </div>

    <!-- 描述 -->
    <p class="m-0 text-12px lh-17px color-[var(--el-text-color-secondary)] line-clamp-2 min-h-[34px]">
      {{ kb.description || '暂无描述' }}
    </p>

    <!-- 统计数据 -->
    <div class="flex items-center gap-0 border-t border-t-solid border-t-[var(--el-border-color-extra-light)] pt-10px">
      <div class="flex-1 flex flex-col items-center gap-2px">
        <span class="text-16px fw-600 color-[var(--el-text-color-primary)] tabular-nums">{{ kb.documentCount || 0 }}</span>
        <span class="text-11px color-[var(--el-text-color-secondary)]">文档</span>
      </div>
      <div class="w-1px h-24px bg-[var(--el-border-color-extra-light)]" />
      <div class="flex-1 flex flex-col items-center gap-2px">
        <span class="text-16px fw-600 color-[var(--el-text-color-primary)] tabular-nums">{{ kb.chunkCount || 0 }}</span>
        <span class="text-11px color-[var(--el-text-color-secondary)]">分片</span>
      </div>
      <div class="w-1px h-24px bg-[var(--el-border-color-extra-light)]" />
      <div class="flex-1 flex flex-col items-center gap-2px">
        <span class="text-16px fw-600 color-[var(--el-text-color-primary)] tabular-nums">{{ formatTokens(kb.totalTokens) }}</span>
        <span class="text-11px color-[var(--el-text-color-secondary)]">Token</span>
      </div>
    </div>

    <!-- 模型标签 -->
    <div v-if="kb.embeddingModel" class="flex">
      <el-tag size="small" type="info" class="!text-11px">{{ kb.embeddingModel }}</el-tag>
    </div>

    <!-- 底栏 -->
    <div class="flex items-center justify-between pt-10px border-t border-t-solid border-t-[var(--el-border-color-extra-light)]">
      <span class="text-12px color-[var(--el-text-color-placeholder)]">Knowledge</span>
      <div class="flex items-center gap-2px">
        <span class="w-26px h-26px inline-flex items-center justify-center rounded-6px color-[var(--el-text-color-secondary)] cursor-pointer transition-all-150 hover:bg-[var(--el-fill-color-light)] hover:text-[var(--el-color-primary)]" title="编辑" @click="emit('edit', kb)">
          <el-icon :size="13"><Edit /></el-icon>
        </span>
        <span class="w-26px h-26px inline-flex items-center justify-center rounded-6px color-[var(--el-text-color-secondary)] cursor-pointer transition-all-150 hover:bg-[var(--el-fill-color-light)] hover:text-[var(--el-color-primary)]" title="文档" @click="emit('documents', kb)">
          <el-icon :size="13"><Document /></el-icon>
        </span>
        <span class="w-26px h-26px inline-flex items-center justify-center rounded-6px color-[var(--el-text-color-secondary)] cursor-pointer transition-all-150 hover:bg-[var(--el-fill-color-light)] hover:text-[var(--el-color-primary)]" title="分片" @click="emit('chunks', kb)">
          <el-icon :size="13"><Grid /></el-icon>
        </span>
        <span class="w-26px h-26px inline-flex items-center justify-center rounded-6px color-[var(--el-text-color-secondary)] cursor-pointer transition-all-150 hover:bg-[var(--el-fill-color-light)] hover:text-[var(--el-color-primary)]" title="检索测试" @click="emit('retrieve', kb)">
          <el-icon :size="13"><Search /></el-icon>
        </span>
        <span class="w-26px h-26px inline-flex items-center justify-center rounded-6px color-[var(--el-text-color-secondary)] cursor-pointer transition-all-150 hover:bg-[var(--el-fill-color-light)] hover:text-[var(--el-color-primary)]" title="复制" @click="emit('copy', kb)">
          <el-icon :size="13"><CopyDocument /></el-icon>
        </span>
        <span class="w-26px h-26px inline-flex items-center justify-center rounded-6px color-[var(--el-text-color-secondary)] cursor-pointer transition-all-150 hover:bg-[var(--el-color-danger-light-9)] hover:text-[var(--el-color-danger)]" title="删除" @click="emit('delete', kb)">
          <el-icon :size="13"><Delete /></el-icon>
        </span>
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
