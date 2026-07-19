<!--
  Agent 卡片组件
  头像+名称同一行 + 描述 + 元信息 + 操作栏
-->
<template>
  <div
    class="bg-white border border-solid border-[var(--el-border-color-lighter)] rounded-xl p-16px flex flex-col gap-12px transition-all-250 cursor-default hover:-translate-y-2px hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-[var(--el-color-primary-light-7)]"
  >
    <!-- 顶栏：头像 + 名称 + 状态开关 -->
    <div class="flex items-center gap-10px">
      <div class="flex-shrink-0 w-40px h-40px rounded-lg flex items-center justify-center shadow-[0_3px_10px_rgba(0,0,0,0.08)] bg-gradient-to-br from-[#667eea] to-[#764ba2]">
        <Icon v-if="agent.avatar" :name="agent.avatar" :size="30" color="#fff" />
        <span v-else class="color-white text-16px fw-700">{{ agent.name?.charAt(0) || 'A' }}</span>
      </div>
      <span class="flex-1 truncate text-15px fw-600 color-[var(--el-text-color-primary)]">{{ agent.name }}</span>
      <el-switch
        :model-value="agent.status"
        :active-value="1"
        :inactive-value="0"
        size="small"
        @change="(val: number) => emit('statusChange', agent, val)"
      />
    </div>

    <!-- 描述 -->
    <p class="m-0 text-12px lh-17px color-[var(--el-text-color-secondary)] line-clamp-2 min-h-[34px]">
      {{ agent.description || '暂无描述' }}
    </p>

    <!-- 元信息 -->
    <div class="flex items-center gap-6px flex-wrap">
      <el-tag v-if="agent.modelCode" size="small" type="info" class="!text-11px">{{ agent.modelCode }}</el-tag>
      <span class="text-11px color-[var(--el-text-color-placeholder)]">v{{ agent.version || '1.0.0' }}</span>
      <span class="text-11px color-[var(--el-text-color-placeholder)]">{{ agent.useCount || 0 }} 次使用</span>
    </div>

    <!-- 底栏 -->
    <div class="flex items-center justify-between pt-10px border-t border-t-solid border-t-[var(--el-border-color-extra-light)]">
      <span class="text-11px color-[var(--el-text-color-placeholder)]">Agent</span>
      <div class="flex items-center gap-2px">
        <span class="w-26px h-26px inline-flex items-center justify-center rounded-6px color-[var(--el-text-color-secondary)] cursor-pointer transition-all-150 hover:bg-[var(--el-fill-color-light)] hover:text-[var(--el-color-primary)]" title="编辑" @click="emit('edit', agent)">
          <el-icon :size="13"><Edit /></el-icon>
        </span>
        <span class="w-26px h-26px inline-flex items-center justify-center rounded-6px color-[var(--el-text-color-secondary)] cursor-pointer transition-all-150 hover:bg-[var(--el-fill-color-light)] hover:text-[var(--el-color-primary)]" title="配置" @click="emit('config', agent)">
          <el-icon :size="13"><Setting /></el-icon>
        </span>
        <span class="w-26px h-26px inline-flex items-center justify-center rounded-6px color-[var(--el-text-color-secondary)] cursor-pointer transition-all-150 hover:bg-[var(--el-fill-color-light)] hover:text-[var(--el-color-primary)]" title="测试" @click="emit('test', agent)">
          <el-icon :size="13"><Promotion /></el-icon>
        </span>
        <span class="w-26px h-26px inline-flex items-center justify-center rounded-6px color-[var(--el-text-color-secondary)] cursor-pointer transition-all-150 hover:bg-[var(--el-fill-color-light)] hover:text-[var(--el-color-primary)]" title="复制" @click="emit('copy', agent)">
          <el-icon :size="13"><CopyDocument /></el-icon>
        </span>
        <span class="w-26px h-26px inline-flex items-center justify-center rounded-6px color-[var(--el-text-color-secondary)] cursor-pointer transition-all-150 hover:bg-[var(--el-color-danger-light-9)] hover:text-[var(--el-color-danger)]" title="删除" @click="emit('delete', agent)">
          <el-icon :size="13"><Delete /></el-icon>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Edit, Setting, Promotion, CopyDocument, Delete } from '@element-plus/icons-vue'
import type { Agent } from '@/api/ai/agent'
import Icon from '@/components/Icon/index.vue'

defineProps<{ agent: Agent }>()

const emit = defineEmits<{
  edit: [agent: Agent]
  config: [agent: Agent]
  test: [agent: Agent]
  copy: [agent: Agent]
  delete: [agent: Agent]
  statusChange: [agent: Agent, val: number]
}>()
</script>
