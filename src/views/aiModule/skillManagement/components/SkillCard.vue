<!--
  技能卡片组件
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
        <Icon v-if="skill.icon" :name="skill.icon" :size="30" color="#fff" />
        <span v-else class="color-white text-18px fw-700">{{ skill.name?.charAt(0) || 'S' }}</span>
      </div>
      <span class="flex-1 truncate text-15px fw-600 color-[var(--el-text-color-primary)]">{{ skill.name }}</span>
      <el-tag v-if="skill.skillType" size="small" :type="tagType" class="!text-12px !ml-0">{{ skillTypeLabel }}</el-tag>
      <el-switch
        :model-value="skill.status"
        :active-value="1"
        :inactive-value="0"
        size="small"
        @change="(val: number) => emit('statusChange', skill, val)"
      />
    </div>

    <!-- 描述 -->
    <p class="m-0 text-14px lh-17px color-[var(--el-text-color-secondary)] line-clamp-2 min-h-[34px]">
      {{ skill.description || '暂无描述' }}
    </p>

    <!-- 元信息 -->
    <div class="flex items-center justify-between gap-6px flex-wrap">
      <span v-if="skill.version" class="text-12px color-[var(--el-text-color-placeholder)]">v{{ skill.version }}</span>
      <span class="text-12px color-[var(--el-text-color-placeholder)]">{{ skill.useCount || 0 }} 次使用</span>
    </div>

    <!-- 底栏 -->
    <div class="flex items-center justify-between pt-10px border-t border-t-solid border-t-[var(--el-border-color-extra-light)]">
      <span class="text-12px color-[var(--el-text-color-placeholder)]">Skill</span>
      <div class="flex items-center gap-2px">
        <span class="w-26px h-26px inline-flex items-center justify-center rounded-6px color-[var(--el-text-color-secondary)] cursor-pointer transition-all-150 hover:bg-[var(--el-fill-color-light)] hover:text-[var(--el-color-primary)]" title="编辑" @click="emit('edit', skill)">
          <el-icon :size="13"><Edit /></el-icon>
        </span>
        <span class="w-26px h-26px inline-flex items-center justify-center rounded-6px color-[var(--el-text-color-secondary)] cursor-pointer transition-all-150 hover:bg-[var(--el-fill-color-light)] hover:text-[var(--el-color-primary)]" title="参数" @click="emit('params', skill)">
          <el-icon :size="13"><Setting /></el-icon>
        </span>
        <span class="w-26px h-26px inline-flex items-center justify-center rounded-6px color-[var(--el-text-color-secondary)] cursor-pointer transition-all-150 hover:bg-[var(--el-color-danger-light-9)] hover:text-[var(--el-color-danger)]" title="删除" @click="emit('delete', skill)">
          <el-icon :size="13"><Delete /></el-icon>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Edit, Setting, Delete } from '@element-plus/icons-vue'
import type { Skill } from '@/api/ai/skill'
import Icon from '@/components/Icon/index.vue'

const props = defineProps<{ skill: Skill }>()

const emit = defineEmits<{
  edit: [skill: Skill]
  params: [skill: Skill]
  delete: [skill: Skill]
  statusChange: [skill: Skill, val: number]
}>()

const SKILL_TYPE_MAP: Record<string, { label: string; type: string }> = {
  tool: { label: '工具调用', type: 'info' },
  rag: { label: '知识检索', type: 'success' },
  hybrid: { label: '混合', type: 'warning' },
  llm: { label: 'LLM', type: '' },
  function: { label: '函数', type: 'info' },
  workflow: { label: '工作流', type: 'success' },
}

const skillTypeLabel = computed(() => SKILL_TYPE_MAP[props.skill.skillType || '']?.label || props.skill.skillType || '')
const tagType = computed(() => (SKILL_TYPE_MAP[props.skill.skillType || '']?.type || 'success') as any)

/** 图标背景渐变 */
const coverGradient = computed(() => {
  const colors: Record<string, string[]> = {
    tool: ['#667eea', '#764ba2'],
    rag: ['#f093fb', '#f5576c'],
    hybrid: ['#4facfe', '#00f2fe'],
    llm: ['#43e97b', '#38f9d7'],
    function: ['#fa709a', '#fee140'],
    workflow: ['#a18cd1', '#fbc2eb'],
  }
  const pair = colors[props.skill.skillType || ''] || ['#667eea', '#764ba2']
  return `linear-gradient(135deg, ${pair[0]}, ${pair[1]})`
})
</script>
