<!--
  消息气泡组件 (MessageBubble.vue)
  ================================
  功能：展示单条对话消息，包含头像、内容气泡、步骤时间线和元信息
  布局：用户消息右对齐（蓝色气泡），助手消息左对齐（灰色气泡）
  元信息：耗时、token 消耗、链路追踪入口（仅助手消息且有 durationMs 时显示）
-->
<template>
  <!-- 消息行：根据角色决定排列方向 -->
  <div class="msg-row" :class="msg.role">
    <!-- 头像：用户蓝色，助手绿色 -->
    <div class="msg-avatar" :class="msg.role">
      <el-icon :size="16">
        <User v-if="msg.role === 'user'" />
        <Monitor v-else />
      </el-icon>
    </div>

    <!-- 内容区域 -->
    <div class="msg-body" :class="msg.role">
      <!-- 步骤时间线：仅在最后一条 assistant 消息中展示，与正文共存 -->
      <StepTimeline v-if="showSteps && steps && steps.length > 0" :steps="steps!" :show-divider="!!msg.content" />

      <!-- 消息正文：用户纯文本，助手 Markdown 渲染 -->
      <div v-if="msg.content && msg.role === 'user'" class="msg-bubble user">{{ msg.content }}</div>
      <MarkdownRenderer v-else-if="msg.content && msg.role === 'assistant'" :content="msg.content" class="msg-bubble assistant" />

      <!-- 元信息行：耗时 / token 消耗 / 复制 / 查看链路 -->
      <div v-if="msg.role === 'assistant' && msg.durationMs" class="msg-meta">
        <span class="tabular-nums">{{ formatDuration(msg.durationMs) }}</span>
        <span v-if="msg.tokensPrompt" class="tabular-nums"> | Token {{ msg.tokensPrompt }}/{{ msg.tokensCompletion }}</span>
        <el-button v-if="msg.traceSnapshot" link type="primary" size="small" class="!text-11px !p-0" @click="$emit('viewTrace', msg.traceSnapshot!)">
          查看链路
        </el-button>
        <el-button link type="text" size="small" class="!text-11px !p-0" @click="copyContent">
          <el-icon :size="12"><CopyDocument /></el-icon>
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * MessageBubble - 消息气泡组件
 *
 * 职责：
 * 1. 根据消息角色（user/assistant）渲染不同样式的头像和气泡
 * 2. 在最后一条 assistant 消息中嵌入步骤时间线
 * 3. 显示执行元信息（耗时、token、链路入口）
 *
 * 类型定义：
 * - ChatMessage: 消息数据结构，包含角色、内容、元信息
 * - StepProgress: 步骤进度数据结构（来自 StepTimeline.vue）
 */
import { CopyDocument } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { AgentTraceSnapshot } from '@/api/ai/agent'
import MarkdownRenderer from '@/components/MarkdownRenderer/MarkdownRenderer.vue'
import StepTimeline from './StepTimeline.vue'
import type { StepProgress } from './StepTimeline.vue'

/**
 * 聊天消息数据结构
 * 导出供 ChatPanel.vue 使用
 */
export interface ChatMessage {
  /** 消息角色：user=用户，assistant=AI 助手 */
  role: 'user' | 'assistant'
  /** 消息内容（支持 HTML） */
  content: string
  /** 执行耗时（毫秒），仅 assistant 消息有值 */
  durationMs?: number
  /** 提示词 token 数 */
  tokensPrompt?: number
  /** 补全 token 数 */
  tokensCompletion?: number
  /** 链路追踪快照 */
  traceSnapshot?: AgentTraceSnapshot
}

/** 组件属性 */
const props = defineProps<{
  /** 消息数据 */
  msg: ChatMessage
  /** 步骤进度列表（仅最后一条 assistant 消息传入） */
  steps?: StepProgress[]
  /** 是否展示步骤时间线 */
  showSteps?: boolean
}>()

/** 组件事件 */
defineEmits<{
  /** 查看链路追踪：切换到 TraceTab 并展示对应快照 */
  viewTrace: [snapshot: AgentTraceSnapshot]
}>()

/**
 * 格式化耗时显示
 * - < 1000ms: 显示 "xxxms"
 * - >= 1000ms: 显示 "x.xs"
 */
function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

async function copyContent() {
  try {
    await navigator.clipboard.writeText(props.msg.content)
    ElMessage.success('已复制到剪贴板')
  } catch {
    ElMessage.error('复制失败')
  }
}
</script>

<style scoped>
/* ===== 消息行布局 ===== */
.msg-row {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}
/* 用户消息：反向排列（头像在右，气泡在左） */
.msg-row.user {
  flex-direction: row-reverse;
}

/* ===== 头像样式 ===== */
.msg-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 4px;
}
/* 用户头像：主色调 */
.msg-avatar.user {
  background: var(--el-color-primary);
  color: #fff;
}
/* 助手头像：成功色（绿色） */
.msg-avatar.assistant {
  background: var(--el-color-success);
  color: #fff;
}

/* ===== 内容区域 ===== */
.msg-body {
  min-width: 0;
}
/* 用户消息：右对齐，宽度由内容决定 */
.msg-body.user {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  width: fit-content;
  max-width: 70%;
}
/* 助手消息：固定宽度占比 */
.msg-body.assistant {
  width: 90%;
}

/* ===== 气泡样式 ===== */
.msg-bubble {
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 13px;
  line-height: 1.7;
  word-break: break-word;
  white-space: pre-wrap;
  box-sizing: border-box;
}
/* 用户气泡：蓝色背景，右上角小圆角 */
.msg-bubble.user {
  background: var(--el-color-primary);
  color: #fff;
  border-top-right-radius: 4px;
}
/* 助手气泡：浅灰背景，左上角小圆角 */
.msg-bubble.assistant {
  background: var(--el-fill-color-light);
  color: var(--el-text-color-primary);
  border-top-left-radius: 4px;
  width: 100%;
  white-space: normal;
}

/* ===== 元信息行（耗时/token/链路） ===== */
.msg-meta {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  margin-top: 4px;
  padding: 0 4px;
  font-size: 11px;
  color: var(--el-text-color-secondary);
}
.msg-meta :deep(.el-button) {
  margin-left: 4px;
  padding: 0 !important;
}
</style>
