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
    <div class="scene-bar px-12px py-8px flex items-center gap-8px" style="border-bottom: 1px solid var(--el-border-color-light)">
      <span class="text-12px color-#909399 shrink-0">场景：</span>
      <div v-if="isSceneMode" class="flex items-center gap-6px flex-1 min-w-0">
        <el-tag size="small" type="success" class="flex-1 min-w-0">
          <span class="overflow-hidden text-ellipsis whitespace-nowrap block">{{ currentSceneName }}</span>
        </el-tag>
        <el-button size="small" text type="info" @click="unbindScene">取消</el-button>
      </div>
      <div v-else class="flex-1">
        <el-popover placement="bottom-start" :width="360" trigger="click">
          <template #reference>
            <el-button class="w-full">
              <el-icon style="margin-right: 4px"><Grid /></el-icon>
              选择场景开始专业对话
            </el-button>
          </template>
          <div class="scene-list">
            <el-input
              v-model="sceneSearch"
              placeholder="搜索场景..."
              clearable
              class="mb-8px"
            />
            <div v-if="scenesLoading" class="flex justify-center py-12px">
              <el-icon class="is-loading" :size="18"><Loading /></el-icon>
            </div>
            <div v-else-if="filteredScenes.length === 0" class="text-14px color-#909399 text-center py-12px">
              暂无可用场景
            </div>
            <div v-else class="grid grid-cols-2 gap-6px max-h-200px overflow-y-auto">
              <div
                v-for="scene in filteredScenes"
                :key="scene.id"
                class="scene-option flex flex-col items-center gap-2px px-6px py-8px border rounded-6px cursor-pointer bg-#fff transition-all duration-150 hover:border-[var(--el-color-primary)] hover:bg-[var(--el-color-primary-light-9)]"
                style="border-color: var(--el-border-color-lighter)"
                @click="selectScene(scene)"
              >
                <Icon :name="scene.icon || 'ChatDotSquare'" :size="18" :color="scene.coverColor || '#409eff'" />
                <span class="text-11px font-500 color-#303133 text-center">{{ scene.name }}</span>
              </div>
            </div>
          </div>
        </el-popover>
      </div>
    </div>

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
        <div
          v-for="(msg, index) in store.messages"
          :key="index"
          class="flex gap-8px mb-16px"
          :class="msg.role === 'assistant' ? 'flex-row' : 'flex-row-reverse'"
        >
          <div
            class="w-32px h-32px rounded-full flex items-center justify-center shrink-0 mt-4px"
            :class="msg.role === 'user' ? 'bg-[var(--el-color-primary)] text-white' : 'bg-[var(--el-color-success)] text-white'"
          >
            <Icon v-if="msg.role === 'user'" name="user" size="24" />
            <Icon v-else name="robot" size="24" />
          </div>

          <div :class="msg.role === 'assistant' ? 'w-[90%]' : 'max-w-[70%]'">
            <div class="text-11px color-#909399 mb-4px" :class="msg.role === 'user' ? 'text-right' : ''">
              {{ msg.role === 'user' ? '用户' : displayName }}
            </div>

            <!-- LLM 步骤时间线：仅在最后一条 assistant 消息中展示 -->
            <div v-if="msg.role === 'assistant' && index === store.messages.length - 1 && llmSteps.length > 0" class="mb-6px">
              <div class="step-timeline">
                <div v-for="(step, si) in llmSteps" :key="si" class="flex gap-6px mb-2px">
                  <div class="flex flex-col items-center w-18px shrink-0">
                    <div class="w-18px h-18px rounded-full flex items-center justify-center" :class="'step-dot--' + step.status">
                      <el-icon v-if="step.status === 'running'" class="is-loading" :size="14"><Loading /></el-icon>
                      <el-icon v-else-if="step.status === 'success'" :size="14"><CircleCheckFilled /></el-icon>
                      <el-icon v-else-if="step.status === 'skip'" :size="14"><RemoveFilled /></el-icon>
                    </div>
                  </div>
                  <div class="min-h-20px flex items-center gap-6px">
                    <span class="text-12px font-500" :class="step.status === 'running' ? 'color-[var(--el-color-primary)]' : ''">
                      {{ step.stepName }}
                    </span>
                    <span v-if="step.status === 'running'" class="text-11px color-[var(--el-color-primary)]">执行中</span>
                    <span v-else-if="step.durationMs != null" class="text-11px color-[var(--el-text-color-secondary)] tabular-nums">{{ step.durationMs }}ms</span>
                  </div>
                </div>
              </div>
            </div>

            <div
              v-if="msg.content && msg.role === 'user'"
              class="msg-bubble user text-13px leading-[1.7]"
            >
              {{ msg.content }}
            </div>
            <MarkdownRenderer
              v-else-if="msg.content && msg.role === 'assistant'"
              :content="msg.content"
              class="msg-bubble assistant"
            />

            <!-- Token 使用统计（终止时不显示） -->
            <div v-if="msg.role === 'assistant' && msg.tokensPrompt != null && !msg.content?.includes('对话已终止')" class="msg-meta-row">
              <span class="tabular-nums">
                Token {{ msg.tokensPrompt }}/{{ msg.tokensCompletion }}
              </span>
              <el-button link size="small" class="!text-11px !p-0" @click="copyResult(msg.content)">
                <el-icon :size="12"><CopyDocument /></el-icon>
              </el-button>
            </div>

            <!-- 结果操作按钮 -->
            <div v-if="msg.role === 'assistant' && isSceneMode && msg.content && store.resultHandlers.length > 0" class="flex gap-4px mt-6px">
              <el-button
                v-for="handler in store.resultHandlers"
                :key="handler.name"
                size="small"
                type="primary"
                text
                @click="callHandler(handler.name, msg)"
              >
                {{ handler.name }}
              </el-button>
            </div>

            <!-- 查看链路按钮 -->
            <div
              v-if="msg.role === 'assistant' && index === store.messages.length - 1 && store.currentTrace"
              class="flex gap-4px mt-6px"
            >
              <el-button size="small" type="primary" text @click="emit('viewTrace')">
                <el-icon :size="12" style="vertical-align: -2px; margin-right: 2px"><Connection /></el-icon>
                查看链路
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="px-12px py-8px" style="border-top: 1px solid var(--el-border-color-light)">
      <el-input
        v-model="inputText"
        type="textarea"
        :rows="3"
        :placeholder="isSceneMode ? '向场景提问（Enter 发送）' : '输入问题（Enter 发送，Shift+Enter 换行）'"
        :disabled="store.loading"
        resize="none"
        @keyup.enter="handleSend"
      />
      <div class="flex items-center justify-between mt-6px">
        <el-button
          v-if="store.loading"
          size="small"
          @click="handleStop"
        >
          <el-icon :size="14" style="margin-right: 2px"><CircleCloseFilled /></el-icon>
          停止
        </el-button>
        <span v-else />
        <div class="flex items-center gap-6px">
          <el-button size="small" :icon="Delete" @click="handleClear">清空</el-button>
          <el-button
            type="primary"
            size="small"
            :icon="Promotion"
            :disabled="store.loading || !inputText.trim()"
            @click="handleSend"
          >
            发送
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import {
  Promotion, ChatLineSquare, Loading, User, Monitor,
  CopyDocument, Connection, Delete, Grid, CircleCloseFilled, CircleCheckFilled, RemoveFilled
} from '@element-plus/icons-vue'
import { useChatStore } from '@/store/modules/chat'
import { useChatExecution } from '@/hooks/useChatExecution'
import { useAutoScroll } from '@/hooks/useAutoScroll'
import { SceneAPI, type Scene } from '@/api/ai/scene'
import MarkdownRenderer from '@/components/MarkdownRenderer/MarkdownRenderer.vue'
import Icon from '@/components/Icon/index.vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// ===== Emits =====
const emit = defineEmits<{
  viewTrace: []
}>()

// ===== Store & Composable =====
const store = useChatStore()
const { sendMessage, abort, tokenUsage, llmSteps } = useChatExecution()

// ===== 状态 =====
const inputText = ref('')
const messageContainer = ref<HTMLElement>()

// ===== 智能滚动 =====
const { scrollToBottom } = useAutoScroll(messageContainer)

// ===== 场景列表 =====
const scenes = ref<Scene[]>([])
const scenesLoading = ref(false)
const sceneSearch = ref('')

const filteredScenes = computed(() => {
  if (!sceneSearch.value) return scenes.value
  const q = sceneSearch.value.toLowerCase()
  return scenes.value.filter(s =>
    s.name?.toLowerCase().includes(q) || s.description?.toLowerCase().includes(q)
  )
})

async function loadScenes() {
  scenesLoading.value = true
  try {
    scenes.value = await SceneAPI.list()
  } catch {
    scenes.value = []
  } finally {
    scenesLoading.value = false
  }
}

function selectScene(scene: Scene) {
  store.bindScene(scene.id!, scene.name || '')
  sceneSearch.value = ''
  document.body.click()
}

function unbindScene() {
  store.unbindScene()
}

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

onMounted(() => {
  store.ensureSession()
  if (scenes.value.length === 0) {
    loadScenes()
  }
})
</script>

<style scoped lang="scss">
.msg-bubble {
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 13px;
  line-height: 1.7;
  word-break: break-word;
  white-space: pre-wrap;
}
.msg-bubble.user {
  background: var(--el-color-primary-light-8);
  color: var(--el-text-color-primary);
  border-top-right-radius: 4px;
}
.msg-bubble.assistant {
  background: #fff;
  color: var(--el-text-color-primary);
  border-top-left-radius: 4px;
  width: 100%;
  white-space: normal;
}

.msg-meta-row {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  margin-top: 4px;
  padding: 0 4px;
  font-size: 11px;
  color: var(--el-text-color-secondary);
}

.scene-option {
  &:hover {
    border-color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
  }
}

.step-timeline {
  padding: 4px 0;
}
.step-dot--running {
  background: var(--el-color-primary-light-8);
  color: var(--el-color-primary);
}
.step-dot--success {
  background: var(--el-color-success-light-8);
  color: var(--el-color-success);
}
.step-dot--skip {
  background: var(--el-color-info-light-8);
  color: var(--el-color-info);
}
</style>
