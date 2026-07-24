<!--
  Agent 卡片组件
  头像+名称同一行 + 描述 + 元信息 + 操作栏
-->
<template>
  <div class="agent-card">
    <!-- 顶栏：头像 + 名称 + 状态开关 -->
    <div class="flex items-center gap-10px">
      <div class="agent-card__avatar">
        <Icon v-if="agent.avatar" :name="agent.avatar" :size="22" color="#fff" />
        <span v-else class="color-white text-14px fw-700">{{ agent.name?.charAt(0) || 'A' }}</span>
      </div>
      <span class="flex-1 truncate text-14px fw-600 color-[var(--el-text-color-primary)]">{{ agent.name }}</span>
      <el-switch
        :model-value="agent.status"
        :active-value="1"
        :inactive-value="0"
        size="small"
        @change="(val: number) => emit('statusChange', agent, val)"
      />
    </div>

    <!-- 描述 -->
    <p class="agent-card__desc">
      {{ agent.description || '暂无描述' }}
    </p>

    <!-- 元信息 -->
    <div class="agent-card__meta">
      <el-tag v-if="agent.modelCode" size="small" type="info" effect="plain" class="!text-11px">{{ agent.modelCode }}</el-tag>
      <span class="agent-card__version">v{{ agent.version || '1.0.0' }}</span>
      <span class="agent-card__usage">{{ agent.useCount || 0 }} 次使用</span>
    </div>

    <!-- 底栏 -->
    <div class="agent-card__footer">
      <span class="agent-card__type">Agent</span>
      <div class="agent-card__actions">
        <el-tooltip content="编辑" placement="top" :show-after="400">
          <button class="agent-card__action" @click="emit('edit', agent)">
            <el-icon :size="14"><Edit /></el-icon>
          </button>
        </el-tooltip>
        <el-tooltip content="配置" placement="top" :show-after="400">
          <button class="agent-card__action" @click="emit('config', agent)">
            <el-icon :size="14"><Setting /></el-icon>
          </button>
        </el-tooltip>
        <el-tooltip content="测试" placement="top" :show-after="400">
          <button class="agent-card__action" @click="emit('test', agent)">
            <el-icon :size="14"><Promotion /></el-icon>
          </button>
        </el-tooltip>
        <el-tooltip content="复制" placement="top" :show-after="400">
          <button class="agent-card__action" @click="emit('copy', agent)">
            <el-icon :size="14"><CopyDocument /></el-icon>
          </button>
        </el-tooltip>
        <div class="agent-card__divider" />
        <el-tooltip content="删除" placement="top" :show-after="400">
          <button class="agent-card__action agent-card__action--danger" @click="emit('delete', agent)">
            <el-icon :size="14"><Delete /></el-icon>
          </button>
        </el-tooltip>
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

<style lang="scss" scoped>
.agent-card {
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

  &__avatar {
    flex-shrink: 0;
    width: 36px;
    height: 36px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
    font-size: 11px;
    color: var(--el-text-color-placeholder);
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
