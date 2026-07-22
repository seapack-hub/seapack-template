<!--
  链路面板组件 (TracePanel.vue)
  ============================
  功能：展示 Agent 执行的链路追踪详情 + 历史测试记录列表
  数据来源：
    - trace: 来自 ChatPanel 的 done 事件或点击历史记录加载
    - sessions: 来自后端 API 查询的历史测试会话列表
  布局：上半部分为当前会话链路详情，下半部分为历史记录列表（可展开/收起）
-->
<template>
  <div class="h-full overflow-y-auto p-16px">
    <!-- ===== 当前会话链路追踪 ===== -->
    <div v-if="trace" class="mb-16px">
      <!-- 标题栏：标题 + 来源标签 -->
      <div class="flex items-center justify-between mb-12px">
        <span class="text-14px font-600">会话链路</span>
        <!-- 来源标签：区分当前对话 vs 历史记录 -->
        <el-tag v-if="activeSessionId" size="small" type="info">历史记录</el-tag>
        <el-tag v-else size="small" type="success">最近一次</el-tag>
      </div>
      <!-- 链路详情组件：展示步骤时间线、耗时、token 统计 -->
      <AgentTraceDetail :snapshot="trace" />
    </div>

    <!-- 空状态：无链路数据时显示引导提示 -->
    <div v-else class="flex flex-col items-center justify-center py-40 text-center">
      <el-icon :size="40" color="var(--el-color-info-light-5)"><Connection /></el-icon>
      <p class="mt-12px text-13px text-el-text-color-secondary">发送消息后自动记录调用链路</p>
    </div>

    <!-- ===== 历史测试记录列表 ===== -->
    <el-divider v-if="trace" content-position="left">
      <span class="text-12px text-el-text-color-secondary">历史测试记录</span>
    </el-divider>

    <div v-if="sessions.length > 0" class="flex flex-col gap-10px pb-30px">
      <!-- 单条历史记录 -->
      <div
        v-for="session in displaySessions"
        :key="session.id"
        class="session-item flex items-center gap-10 p-10 rounded-6px cursor-pointer transition-all hover:bg-el-fill-color-lighter"
        :class="{ 'is-active': activeSessionId === session.id }"
        @click="$emit('loadSession', session)"
      >
        <div class="flex-1 min-w-0">
          <!-- 用户消息（截断显示） -->
          <div class="text-13px color-el-text-color-primary truncate">{{ session.userMessage }}</div>
          <!-- 元信息行：状态 / 模型 / 耗时 / Token / 重试次数 / 时间 -->
          <div class="flex items-center gap-8px mt-4px flex-wrap">
            <!-- 执行状态标签 -->
            <el-tag :type="session.status === 'success' ? 'success' : 'danger'" size="small">
              {{ session.status === 'success' ? '成功' : session.status === 'timeout' ? '超时' : '失败' }}
            </el-tag>
            <!-- 使用的模型名称 -->
            <span v-if="session.modelName" class="text-11px text-el-text-color-secondary">{{ session.modelName }}</span>
            <!-- 执行耗时 -->
            <span class="text-11px text-el-text-color-secondary tabular-nums">{{ formatDuration(session.totalDurationMs) }}</span>
            <!-- Token 消耗总数 -->
            <span class="text-11px text-el-text-color-secondary">Token: {{ session.tokensTotal || ((session.tokensPrompt || 0) + (session.tokensCompletion || 0)) }}</span>
            <!-- 重试次数（仅显示 > 0 时） -->
            <span v-if="session.retryCount && session.retryCount > 0" class="text-11px text-el-color-warning">重试{{ session.retryCount }}次</span>
            <!-- 创建时间 -->
            <span class="text-11px text-el-text-color-secondary">{{ session.createdAt }}</span>
          </div>
          <!-- 错误信息（仅失败时显示） -->
          <div v-if="session.errorMessage" class="mt-4px text-11px text-el-color-danger truncate">
            {{ session.errorMessage }}
          </div>
        </div>
        <!-- 删除按钮：阻止事件冒泡避免触发父元素点击 -->
        <el-button link type="danger" size="small" @click.stop="$emit('deleteSession', session)">
          <el-icon><Delete /></el-icon>
        </el-button>
      </div>

      <!-- 展开/收起按钮：当记录数超过限制时显示 -->
      <div v-if="sessions.length > limit" class="session-toggle" @click="showAll = !showAll">
        <span class="text-12px">{{ showAll ? '收起' : `查看全部 (${sessions.length})` }}</span>
        <el-icon :class="{ 'rotate-180': showAll }" class="transition-transform"><ArrowDown /></el-icon>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * TracePanel - 链路面板组件
 *
 * 职责：
 * 1. 展示当前会话的链路追踪详情（通过 AgentTraceDetail 组件）
 * 2. 展示历史测试记录列表（从后端 API 加载）
 * 3. 支持点击历史记录加载对应的链路详情
 * 4. 支持删除历史记录
 *
 * 数据流：
 * - trace 由父组件 AgentTestDrawer 通过 done 事件或 loadSessionDetail 设置
 * - sessions 由父组件通过 fetchTestSessions 从 API 加载
 */
import { Delete, Connection, ArrowDown } from '@element-plus/icons-vue'
import type { AgentTraceSnapshot, AgentTestSession } from '@/api/ai/agent'
import AgentTraceDetail from '../AgentTraceDetail.vue'

/** 组件属性 */
const props = defineProps<{
  /** 当前链路追踪快照（null 时显示空状态） */
  trace: AgentTraceSnapshot | null
  /** 历史测试会话列表 */
  sessions: AgentTestSession[]
  /** 当前选中的历史会话 ID（用于高亮） */
  activeSessionId?: number
  /** 默认显示的记录数限制（超出部分需展开） */
  limit?: number
}>()

/** 组件事件 */
defineEmits<{
  /** 加载历史会话详情：父组件调用 API 获取 trace 并展示 */
  loadSession: [session: AgentTestSession]
  /** 删除历史会话：父组件调用 API 删除并刷新列表 */
  deleteSession: [session: AgentTestSession]
}>()

/** 是否展开显示全部历史记录 */
const showAll = ref(false)

/** 计算属性：默认显示数量限制（默认 5 条） */
const limit = computed(() => props.limit || 5)

/**
 * 计算属性：实际展示的历史记录列表
 * - 展开时显示全部
 * - 收起时显示前 limit 条
 */
const displaySessions = computed(() => {
  if (showAll.value) return props.sessions
  return props.sessions.slice(0, limit.value)
})

/**
 * 格式化耗时显示
 * - < 1000ms: 显示 "xxxms"
 * - >= 1000ms: 显示 "xx.xxs"
 */
function formatDuration(ms?: number): string {
  if (!ms) return '0ms'
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(2)}s`
}
</script>

<style scoped>
/* 历史记录项样式 */
.session-item {
  border: 1px solid var(--el-border-color-lighter);
}
.session-item:hover {
  border-color: var(--el-border-color);
}
/* 选中状态：蓝色边框 + 浅蓝背景 */
.session-item.is-active {
  border-color: var(--el-color-primary-light-5);
  background: var(--el-color-primary-light-9);
}

/* 展开/收起按钮 */
.session-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px;
  cursor: pointer;
  border-radius: 6px;
  color: var(--el-color-primary);
  transition: background 0.15s;
}
.session-toggle:hover {
  background: var(--el-fill-color-lighter);
}
</style>
