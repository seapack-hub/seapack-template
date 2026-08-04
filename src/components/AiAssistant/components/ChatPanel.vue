<!--
  AiAssistant/ChatPanel.vue — 对话面板

  职责：
    1. 顶部场景选择器（选择场景后后端自动路由 Agent）
    2. 消息列表 + 输入框

  数据流：
    用户选择场景 → bindScene(sceneId) → 后续对话走场景通道
    用户直接对话 → 走通用 LLM 通道
-->
<template>
  <div class="chat-panel h-full flex flex-col bg-[#f5f7fa]">
    <!-- 场景选择器 -->
    <SceneSelector
      :is-scene-mode="isSceneMode"
      :scene-name="currentSceneName"
      @select="selectScene"
      @unbind="unbindScene"
    />

    <!-- 消息列表 -->
    <div ref="messageContainer" class="flex-1 overflow-y-auto px-12px">
      <div class="py-8px">
        <!-- 空状态 -->
        <div v-if="store.messages.length === 0" class="flex flex-col items-center justify-center py-60px color-#909399 gap-8px">
          <el-icon :size="40" color="#dcdfe6"><ChatLineSquare /></el-icon>
          <p class="m-0 text-14px">{{ isSceneMode ? '开始场景对话' : '开始一段新对话' }}</p>
          <p class="m-0 text-12px color-#c0c4cc">输入问题后按 Enter 发送</p>
        </div>

        <!-- 消息气泡 -->
        <MessageBubble
          v-for="(msg, index) in store.messages"
          :key="index"
          :message="msg"
          :index="index"
          :is-last="index === store.messages.length - 1"
          :display-name="displayName"
          :is-scene-mode="isSceneMode"
          :llm-steps="llmSteps"
          :result-handlers="store.resultHandlers"
          @copy="copyResult"
          @call-handler="callHandler"
          @view-trace="(requestId?: string) => emit('viewTrace', requestId)"
        />
      </div>
    </div>

    <!-- 输入区域 -->
    <ChatInput
      v-model="inputText"
      :loading="store.loading"
      :is-scene-mode="isSceneMode"
      @send="handleSend"
      @stop="handleStop"
      @clear="handleClear"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { ChatLineSquare } from '@element-plus/icons-vue'
import { useChatStore } from '@/store/modules/chat'
import { useChatExecution } from '@/hooks/useChatExecution'
import { useAutoScroll } from '@/hooks/useAutoScroll'
import type { Scene } from '@/api/ai/scene'
import SceneSelector from './SceneSelector.vue'
import MessageBubble from './MessageBubble.vue'
import ChatInput from './ChatInput.vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// ===== Emits =====
const emit = defineEmits<{
  viewTrace: [requestId?: string]
}>()

// ===== Store & Composable =====
const store = useChatStore()
const { sendMessage, abort, llmSteps } = useChatExecution()

// ===== 状态 =====
const inputText = ref('')
const messageContainer = ref<HTMLElement>()

// ===== 智能滚动 =====
const { scrollToBottom } = useAutoScroll(messageContainer as Ref<HTMLElement | null>)

// ===== 计算属性 =====
const isSceneMode = computed(() => store.isSceneMode)

const currentSceneName = computed(() => {
  return store.currentSceneBinding?.sceneName || ''
})

const displayName = computed(() => {
  if (isSceneMode.value && currentSceneName.value) {
    return currentSceneName.value
  }
  return 'AI 助手'
})

// ===== 场景操作 =====
function selectScene(scene: Scene) {
  store.bindScene(scene.id!, scene.name || '')
}

function unbindScene() {
  store.unbindScene()
}

// ===== 操作 =====
function copyResult(content: string) {
  navigator.clipboard.writeText(content)
  ElMessage.success('已复制到剪贴板')
}

function callHandler(name: string, msg: { content: string }) {
  store.callResultHandler(name, {
    content: msg.content,
    sceneName: currentSceneName.value,
    elapsedMs: 0,
  })
}

async function handleSend() {
  const text = inputText.value.trim()
  if (!text || store.loading) return
  inputText.value = ''
  await sendMessage(text)
}

function handleStop() {
  abort()
}

function handleClear() {
  ElMessageBox.confirm('确定清空当前会话的所有消息吗？', '提示', { type: 'info' })
    .then(() => { store.clearMessages(); ElMessage.success('会话已清空') })
    .catch(() => {})
}

// ===== 自动滚动 =====
// 监听新消息添加
watch(() => store.messages.length, () => scrollToBottom())

// 监听最后一条消息的内容变化（流式响应时内容会持续更新）
watch(
  () => {
    const msgs = store.messages
    if (msgs.length === 0) return ''
    return msgs[msgs.length - 1].content
  },
  () => scrollToBottom()
)

// 监听 loading 状态变化（流结束时确保滚动到底部）
watch(() => store.loading, (v) => { if (!v) scrollToBottom() })

// 监听 LLM 步骤时间线变化（步骤新增、进度更新、状态变化时滚动到底部）
watch(() => llmSteps.value.length, () => scrollToBottom())
watch(
  () => {
    const steps = llmSteps.value
    if (steps.length === 0) return ''
    const last = steps[steps.length - 1]
    return `${last.status}-${last.progressList?.length}-${last.detailList?.length}`
  },
  () => scrollToBottom()
)

onMounted(() => {
  store.ensureSession()
})
</script>
