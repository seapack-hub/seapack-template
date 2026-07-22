<!--
  对话面板组件 (ChatPanel.vue)
  ============================
  功能：Agent 测试对话的核心面板，封装了 SSE 流式对话逻辑
  结构：消息列表 + 步骤进度时间线 + 输入区域
  通信：通过 fetch + ReadableStream 实现 POST 请求的 SSE 流式接收
  事件：step_start / step_done / content / done / error
-->
<template>
  <div class="flex flex-col h-full bg-el-fill-color-blank">
    <!-- ===== 消息列表区域 ===== -->
    <div ref="messageListRef" class="flex-1 overflow-y-auto px-16px py-8px">
      <!-- 空状态：无消息时显示引导提示 -->
      <div v-if="messages.length === 0" class="flex flex-col items-center justify-center h-full">
        <el-icon :size="48" color="var(--el-color-info-light-5)"><ChatDotRound /></el-icon>
        <p class="mt-12px text-13px text-el-text-color-secondary">发送消息开始与 Agent 对话测试</p>
      </div>

      <!-- 消息列表：遍历渲染每条消息气泡 -->
      <MessageBubble
        v-for="(msg, i) in messages"
        :key="i"
        :msg="msg"
        :steps="i === messages.length - 1 ? steps : []"
        :show-steps="msg.role === 'assistant' && i === messages.length - 1"
        @view-trace="$emit('viewTrace', $event)"
      />

      <!-- 加载中动画：当正在聊天、最后一条消息无内容、且无步骤时显示三点跳动 -->
      <div v-if="chatting && !lastMessageHasContent && steps.length === 0" class="flex gap-8px mb-8px px-4px">
        <div class="w-28px h-28px rounded-full flex items-center justify-center shrink-0 bg-el-color-success text-white">
          <el-icon :size="16"><Monitor /></el-icon>
        </div>
        <div class="self-center px-12px py-8px rounded-12px rounded-tl-4px bg-el-fill-color-light">
          <div class="flex gap-4px">
            <span v-for="n in 3" :key="n" class="w-5px h-5px rounded-full bg-el-text-color-secondary animate-bounce" :style="{ animationDelay: `${(n - 1) * 0.2}s` }" />
          </div>
        </div>
      </div>
    </div>

    <!-- ===== 输入区域 ===== -->
    <div class="input-area">
      <el-input
        v-model="inputMessage"
        type="textarea"
        :rows="2"
        placeholder="输入消息测试 Agent... (Ctrl+Enter 发送)"
        :disabled="chatting"
        resize="none"
        @keydown.enter.ctrl="sendMessage"
      />
      <div class="flex justify-end gap-8px mt-8px">
        <!-- 取消按钮：仅在生成中显示 -->
        <el-button v-if="chatting" size="small" @click="cancelChat">取消</el-button>
        <!-- 发送/生成中按钮 -->
        <el-button type="primary" size="small" :loading="chatting" :disabled="!inputMessage.trim() && !chatting" @click="sendMessage">
          <el-icon v-if="!chatting"><Promotion /></el-icon> {{ chatting ? '生成中...' : '发送' }}
        </el-button>
        <!-- 清空按钮 -->
        <el-button size="small" :disabled="chatting" @click="clearMessages">清空</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * ChatPanel - 对话面板组件
 *
 * 核心职责：
 * 1. 管理消息列表（用户消息 + 助手回复）
 * 2. 通过 fetch + ReadableStream 实现 SSE 流式接收后端事件
 * 3. 解析 SSE 事件并更新 UI（步骤进度、消息内容、token 统计等）
 * 4. 提供取消对话、清空消息等操作
 *
 * SSE 事件类型：
 * - step_start: 后端开始执行某个步骤（提示词组装/知识库检索/技能调用/LLM调用）
 * - step_done:  某个步骤执行完成，包含状态和耗时
 * - content:    LLM 流式输出的文本片段
 * - done:       对话完成，包含 token 统计和链路追踪快照
 * - error:      执行出错
 */
import { ChatDotRound, Promotion, Monitor } from '@element-plus/icons-vue'
import { type AgentTraceSnapshot, type AgentTestChatSSEEvent } from '@/api/ai/agent'
import CacheKey from '@/constants/cache-key'
import MessageBubble from './MessageBubble.vue'
import type { ChatMessage } from './MessageBubble.vue'
import type { StepProgress } from './StepTimeline.vue'

/** 父组件传入的 Agent ID */
const props = defineProps<{
  agentId: number
}>()

/** 向父组件发射的事件 */
const emit = defineEmits<{
  /** 查看链路追踪详情 */
  viewTrace: [snapshot: AgentTraceSnapshot]
  /** 链路数据更新（done 事件触发时） */
  traceUpdate: [snapshot: AgentTraceSnapshot]
}>()

// ===== 响应式状态 =====

/** 消息列表，包含用户消息和助手回复 */
const messages = ref<ChatMessage[]>([])
/** 输入框内容 */
const inputMessage = ref('')
/** 是否正在生成回复（控制按钮状态和输入禁用） */
const chatting = ref(false)
/** 当前对话的步骤进度列表（流式更新） */
const steps = ref<StepProgress[]>([])
/** 消息列表 DOM 引用（用于自动滚动） */
const messageListRef = ref<HTMLElement>()

/**
 * 计算属性：最后一条 assistant 消息是否已有内容
 * 用于判断是否显示加载动画（有内容时不显示三点动画）
 */
const lastMessageHasContent = computed(() => {
  const last = messages.value[messages.value.length - 1]
  return last?.role === 'assistant' && !!last.content
})

/** 标记：后端业务 done 事件是否已收到（用于主动跳出流读取循环） */
const streamCompleted = ref(false)

/** 当前请求的 AbortController，用于取消进行中的请求 */
let currentAbortController: AbortController | null = null

// ===== 工具函数 =====

/**
 * 平滑滚动到消息列表底部
 * 使用 nextTick 确保 DOM 更新完成后再滚动
 */
function scrollToBottom() {
  nextTick(() => {
    if (messageListRef.value) {
      messageListRef.value.scrollTop = messageListRef.value.scrollHeight
    }
  })
}

// ===== 核心对话逻辑 =====

/**
 * 发送消息并启动 SSE 流式接收
 *
 * 流程：
 * 1. 将用户消息添加到消息列表
 * 2. 创建占位的 assistant 消息（后续流式填充内容）
 * 3. 使用 fetch 发起 POST 请求，通过 ReadableStream 读取 SSE 事件
 * 4. 解析每个 SSE 事件并更新 UI
 * 5. 流结束后在 finally 块中做兜底处理
 */
async function sendMessage() {
  const msg = inputMessage.value.trim()
  if (!msg || chatting.value) return

  // 添加用户消息到列表
  messages.value.push({ role: 'user', content: msg })
  inputMessage.value = ''
  chatting.value = true
  steps.value = []
  scrollToBottom()

  // 创建占位 assistant 消息，后续通过 handleSSEEvent 填充内容
  // 注意：必须通过 messages.value[messages.value.length - 1] 获取 reactive 代理
  messages.value.push({ role: 'assistant', content: '' })

  // 构建对话历史（排除刚添加的空 assistant 消息）
  const history = messages.value.slice(0, -1).map(m => ({ role: m.role, content: m.content }))

  // 取消之前的请求（如果有）
  currentAbortController?.abort()
  currentAbortController = new AbortController()

  try {
    // 手动注入 token（fetch 不经过 axios 拦截器）
    const token = localStorage.getItem(CacheKey.TOKEN)
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = `Bearer ${token}`

    // 发起 POST 请求，后端返回 SSE 流
    const response = await fetch('/api/ai/agents/test-chat', {
      method: 'POST',
      headers,
      body: JSON.stringify({ agentId: props.agentId, message: msg, history }),
      signal: currentAbortController.signal,
    })

    if (!response.ok) throw new Error(`请求失败: ${response.status}`)
    if (!response.body) throw new Error('响应体为空，无法读取流')

    // 获取流式读取器
    const reader = response.body.getReader()
    const decoder = new TextDecoder('utf-8')
    // 重置业务完成标记
    streamCompleted.value = false
    let buffer = '' // 缓冲区，处理不完整的 SSE 行

    // 循环读取流数据
    while (true) {
      // 如果已收到业务 done 事件，主动退出循环（不依赖浏览器流关闭信号）
      if (streamCompleted.value) break

      const { done, value } = await reader.read()
      if (done) break // 流结束

      // 解码二进制数据并追加到缓冲区
      buffer += decoder.decode(value, { stream: true })

      // 按换行符分割，最后一段可能不完整，保留到下次循环
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      // 解析每一行 SSE 事件
      for (const line of lines) {
        const trimmed = line.trim()
        // SSE 格式：data:{json}\n\n
        if (trimmed.startsWith('data:')) {
          const jsonStr = trimmed.replace(/^data:\s*/, '')
          if (!jsonStr) continue
          try {
            handleSSEEvent(JSON.parse(jsonStr))
          } catch { /* 忽略解析失败的行 */ }
        }
      }
    }

    // 主动取消读取器，释放底层流连接（后端可能未关闭连接）
    try { reader.cancel() } catch { /* ignore */ }

    // 处理缓冲区中剩余的数据
    if (buffer.trim().startsWith('data:')) {
      const jsonStr = buffer.trim().replace(/^data:\s*/, '')
      if (jsonStr) {
        try { handleSSEEvent(JSON.parse(jsonStr)) } catch { /* ignore */ }
      }
    }
  } catch (e: any) {
    // 错误处理
    const lastMsg = messages.value[messages.value.length - 1]

    // 如果业务 done 事件已处理完毕，忽略后续流关闭错误
    if (streamCompleted.value) {
      // done 事件已处理，消息内容完整，不做覆盖
    } else if (e.name === 'AbortError') {
      // 用户主动取消
      if (lastMsg?.role === 'assistant') lastMsg.content += '\n\n[已取消]'
    } else {
      // 其他错误（网络异常、后端报错等）
      if (lastMsg?.role === 'assistant') lastMsg.content = '调用失败，请检查 Agent 配置'
      console.error(e)
    }
  } finally {
    // ===== 兜底逻辑 =====
    // 即使 done 事件未触发，也要确保 UI 状态正确恢复
    // 1. 将仍在 running 的步骤（LLM 调用）标记为成功
    const llmStep = steps.value.find(s => s.status === 'running')
    if (llmStep) {
      llmStep.status = 'success'
    }
    // 2. 确保 assistant 消息有 durationMs（避免元信息区域不显示）
    const lastMsg = messages.value[messages.value.length - 1]
    if (lastMsg?.role === 'assistant' && !lastMsg.durationMs) {
      lastMsg.durationMs = 0
    }
    
    // 3. 恢复按钮状态
    chatting.value = false
    scrollToBottom()
  }
}

/**
 * 处理单个 SSE 事件
 *
 * 根据 event.type 分发处理：
 * - step_start: 新增一个 running 状态的步骤到时间线
 * - step_done:  更新最后一个步骤的状态和耗时
 * - content:    将文本片段追加到 assistant 消息内容
 * - done:       对话完成，设置 token 统计、链路快照，通知父组件
 * - error:      将错误信息追加到消息内容
 *
 * 注意：整个函数体包裹在 try-catch 中，防止解析错误阻塞流读取循环
 */
function handleSSEEvent(event: AgentTestChatSSEEvent) {
  try {
    // 获取最后一条 assistant 消息（必须通过 value 访问以获取 reactive 代理）
    const lastMsg = messages.value[messages.value.length - 1]
    if (lastMsg?.role !== 'assistant') return

    switch (event.type) {
      // 后端开始执行某个步骤
      case 'step_start':
        steps.value.push({ stepName: event.stepName || '', status: 'running' })
        scrollToBottom()
        break

      // 某个步骤执行完成
      case 'step_done': {
        const last = steps.value[steps.value.length - 1]
        if (last) {
          // skip 状态映射为 success（跳过≠失败）
          last.status = event.status === 'skip' ? 'success' : (event.status as any) || 'success'
          last.durationMs = event.durationMs
        }
        scrollToBottom()
        break
      }

      // LLM 流式输出的文本片段
      case 'content':
        lastMsg.content += event.text || ''
        scrollToBottom()
        break

      // 对话完成
      case 'done': {
        // 标记流完成，通知 while 循环主动退出
        streamCompleted.value = true
        // LLM 调用没有 step_done 事件，需要在 done 时手动标记为成功
        const llmStep = steps.value.find(s => s.status === 'running')
        if (llmStep) {
          llmStep.status = 'success'
          llmStep.durationMs = event.totalDurationMs
        }
        // 设置消息元信息
        lastMsg.durationMs = event.durationMs ?? event.totalDurationMs
        // 兼容两种 token 格式：扁平 tokensPrompt 或嵌套 tokens.prompt
        lastMsg.tokensPrompt = event.tokensPrompt ?? event.tokens?.prompt
        lastMsg.tokensCompletion = event.tokensCompletion ?? event.tokens?.completion
        // 解析链路追踪快照（可能是 JSON 字符串或已解析的对象）
        if (event.traceSnapshot) {
          const raw = event.traceSnapshot
          lastMsg.traceSnapshot = typeof raw === 'string' ? JSON.parse(raw) : raw
          // 通知父组件更新链路数据
          emit('traceUpdate', lastMsg.traceSnapshot!)
        }
        break
      }

      // 后端报错
      case 'error':
        lastMsg.content += `\n\n错误: ${event.message}`
        scrollToBottom()
        break
    }
  } catch (e) {
    // 防止单个事件处理错误阻塞整个流读取循环
    console.error('handleSSEEvent error:', e)
  }
}

/**
 * 取消当前进行中的对话
 * 通过 AbortController 中断 fetch 请求
 */
function cancelChat() {
  currentAbortController?.abort()
  currentAbortController = null
}

/**
 * 清空消息列表和步骤进度
 */
function clearMessages() {
  messages.value = []
  steps.value = []
}

// ===== 生命周期 =====

/** 组件卸载时取消进行中的请求，避免内存泄漏 */
onUnmounted(() => {
  currentAbortController?.abort()
  currentAbortController = null
})
</script>

<style scoped>
/* 输入区域样式 */
.input-area {
  padding: 10px 16px 12px;
  border-top: 1px solid var(--el-border-color-lighter);
  background: var(--el-fill-color-blank);
}
</style>
