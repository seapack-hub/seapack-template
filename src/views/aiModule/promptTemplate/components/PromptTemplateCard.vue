<!--
  提示词模板卡片组件
  图标+名称同一行 + 描述 + 元信息 + 操作栏
-->
<template>
  <div
    class="bg-white border border-solid border-[var(--el-border-color-lighter)] rounded-xl p-16px flex flex-col gap-12px transition-all-250 cursor-default hover:-translate-y-2px hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-[var(--el-color-primary-light-7)]"
  >
    <!-- 顶栏：图标 + 名称 + 类型标签 + 状态开关 -->
    <div class="flex items-center gap-10px">
      <div
        class="flex-shrink-0 w-40px h-40px rounded-lg flex items-center justify-center shadow-[0_3px_10px_rgba(0,0,0,0.08)]"
        :style="{ background: coverGradient }"
      >
        <el-icon :size="30" color="#fff"><Document /></el-icon>
      </div>
      <span class="flex-1 truncate text-15px fw-600 color-[var(--el-text-color-primary)]">{{ tpl.name }}</span>
      <el-tag v-if="tpl.type === 1" size="small" type="warning" class="!text-11px !ml-0">系统预设</el-tag>
      <el-switch
        :model-value="tpl.status"
        :active-value="1"
        :inactive-value="0"
        size="small"
        @change="(val: number) => emit('statusChange', tpl, val)"
      />
    </div>

    <!-- 描述 -->
    <p class="m-0 text-12px lh-17px color-[var(--el-text-color-secondary)] line-clamp-2 min-h-[34px]">
      {{ tpl.description || '暂无描述' }}
    </p>

    <!-- 元信息 -->
    <div class="flex items-center gap-6px flex-wrap">
      <el-tag :type="categoryTagType(tpl.category) as any" class="!text-11px">{{ categoryLabel(tpl.category) }}</el-tag>
      <el-tag v-if="tpl.outputFormat" type="" class="!text-11px">{{ tpl.outputFormat }}</el-tag>
      <span class="text-11px color-[var(--el-text-color-placeholder)]">{{ tpl.useCount || 0 }} 次使用</span>
    </div>

    <!-- 底栏 -->
    <div class="flex items-center justify-between pt-10px border-t border-t-solid border-t-[var(--el-border-color-extra-light)]">
      <span class="text-12px color-[var(--el-text-color-placeholder)]">Template</span>
      <div class="flex items-center gap-2px">
        <span class="w-26px h-26px inline-flex items-center justify-center rounded-6px color-[var(--el-text-color-secondary)] cursor-pointer transition-all-150 hover:bg-[var(--el-fill-color-light)] hover:text-[var(--el-color-primary)]" title="编辑" @click="emit('edit', tpl)">
          <el-icon :size="13"><Edit /></el-icon>
        </span>
        <span class="w-26px h-26px inline-flex items-center justify-center rounded-6px color-[var(--el-text-color-secondary)] cursor-pointer transition-all-150 hover:bg-[var(--el-fill-color-light)] hover:text-[var(--el-color-primary)]" title="预览" @click="emit('preview', tpl)">
          <el-icon :size="13"><View /></el-icon>
        </span>
        <span class="w-26px h-26px inline-flex items-center justify-center rounded-6px color-[var(--el-text-color-secondary)] cursor-pointer transition-all-150 hover:bg-[var(--el-fill-color-light)] hover:text-[var(--el-color-primary)]" title="复制" @click="emit('copy', tpl)">
          <el-icon :size="13"><CopyDocument /></el-icon>
        </span>
        <span class="w-26px h-26px inline-flex items-center justify-center rounded-6px color-[var(--el-text-color-secondary)] cursor-pointer transition-all-150 hover:bg-[var(--el-color-danger-light-9)] hover:text-[var(--el-color-danger)]" title="删除" @click="emit('delete', tpl)">
          <el-icon :size="13"><Delete /></el-icon>
        </span>
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
