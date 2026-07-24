<!--
  技能卡片组件
  图标+名称同一行 + 描述 + 元信息 + 操作栏
-->
<template>
  <div class="skill-card">
    <!-- 顶栏：图标 + 名称 + 类型标签 + 状态开关 -->
    <div class="flex items-center gap-10px">
      <div
        class="skill-card__icon"
        :style="{ background: coverGradient }"
      >
        <Icon v-if="skill.icon" :name="skill.icon" :size="20" color="#fff" />
        <span v-else class="color-white text-14px fw-700">{{ skill.name?.charAt(0) || 'S' }}</span>
      </div>
      <span class="flex-1 truncate text-14px fw-600 color-[var(--el-text-color-primary)]">{{ skill.name }}</span>
      <el-tag v-if="skill.skillType" size="small" :type="tagType" effect="light" class="!text-11px !ml-0">{{ skillTypeLabel }}</el-tag>
      <el-switch
        :model-value="skill.status"
        :active-value="1"
        :inactive-value="0"
        size="small"
        @change="(val: number) => emit('statusChange', skill, val)"
      />
    </div>

    <!-- 描述 -->
    <p class="skill-card__desc">
      {{ skill.description || '暂无描述' }}
    </p>

    <!-- 元信息 -->
    <div class="skill-card__meta">
      <span v-if="skill.version" class="skill-card__version">v{{ skill.version }}</span>
      <span class="skill-card__usage">{{ skill.useCount || 0 }} 次使用</span>
    </div>

    <!-- 底栏 -->
    <div class="skill-card__footer">
      <span class="skill-card__type">Skill</span>
      <div class="skill-card__actions">
        <el-tooltip content="编辑" placement="top" :show-after="400">
          <button class="skill-card__action" @click="emit('edit', skill)">
            <el-icon :size="14"><Edit /></el-icon>
          </button>
        </el-tooltip>
        <el-tooltip content="参数" placement="top" :show-after="400">
          <button class="skill-card__action" @click="emit('params', skill)">
            <el-icon :size="14"><Setting /></el-icon>
          </button>
        </el-tooltip>
        <div class="skill-card__divider" />
        <el-tooltip content="删除" placement="top" :show-after="400">
          <button class="skill-card__action skill-card__action--danger" @click="emit('delete', skill)">
            <el-icon :size="14"><Delete /></el-icon>
          </button>
        </el-tooltip>
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

<style lang="scss" scoped>
.skill-card {
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
    gap: 8px;
  }

  &__version {
    font-size: 12px;
    color: var(--el-text-color-placeholder);
  }

  &__usage {
    font-size: 12px;
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
