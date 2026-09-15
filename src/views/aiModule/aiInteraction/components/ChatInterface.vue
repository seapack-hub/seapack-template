<template>
  <div class="h-full flex flex-col relative overflow-hidden">
    <!-- 头部 -->
    <el-header class="border-b border-b-solid border-[#e8e8e8] flex items-center justify-between px-5 h-[100px]">
      <div class="flex items-center gap-2.5">
        <h2 class="text-16px font-600 color-[#303133] m-0">AI 大模型对话</h2>
        <el-tag v-if="store.tokenCount > 0" size="small" type="info" effect="plain">
          {{ store.tokenCount }} tokens
        </el-tag>
        <el-tag v-if="props.selectedKnowledgeId" size="small" type="success" effect="plain">
          <el-icon :size="12"><Collection /></el-icon>
          知识库检索中
        </el-tag>
      </div>
      <div class="flex items-center gap-2">
        <!-- 系统提示词设置 -->
        <el-popover placement="bottom-end" :width="400" trigger="click" @show="fetchSystemPrompt">
          <template #reference>
            <el-button text :icon="Setting">
              {{ systemPromptShort }}
            </el-button>
          </template>
          <div class="p-2">
            <h4 class="m-0 mb-1 text-14px color-[#303133]">系统提示词（System Prompt）</h4>
            <p class="m-0 mb-3 text-12px color-[#909399]">设置 AI 助手的角色和行为规则</p>
            <el-input
              v-model="editSystemPrompt"
              type="textarea"
              :rows="6"
              placeholder="例如：你是一个专业的前端开发工程师..."
            />
            <div class="flex justify-end gap-2 mt-3">
              <el-button @click="resetSystemPrompt">恢复默认</el-button>
              <el-button type="primary" @click="saveSystemPrompt">保存</el-button>
            </div>
          </div>
        </el-popover>
        <el-button text :icon="Delete" @click="handleClear">清空会话</el-button>
      </div>
    </el-header>

    <!-- 消息列表 -->
    <el-main class="flex-1 p-0 overflow-hidden">
      <el-scrollbar ref="scrollbarRef" class="h-full" view-class="p-5 overflow-x-hidden!">
        <div class="max-w-full box-border p-6 overflow-hidden">
          <div v-if="store.messages.length === 0" class="flex flex-col items-center justify-center color-[#909399] gap-2">
            <el-icon :size="48" color="#dcdfe6"><ChatLineSquare /></el-icon>
            <p class="m-0">开始一段新对话</p>
            <p class="m-0 text-12px color-[#c0c4cc]">输入问题后按 Enter 发送，或按 🎤 使用语音输入</p>
          </div>

          <div
            v-for="(msg, index) in store.messages"
            :key="index"
            class="mb-20"
            :class="msg.role === 'user' ? 'flex justify-end gap-2' : 'flex gap-2'"
          >
            <!-- AI 头像 -->
            <div v-if="msg.role === 'assistant'" class="w-32px h-32px rounded-full flex items-center justify-center shrink-0 mt-4px bg-[var(--el-color-success)] text-white">
              <Icon name="robot" size="24" />
            </div>

            <div :class="msg.role === 'user' ? 'max-w-[70%]' : 'flex-1 min-w-0'">
              <!-- 角色名称 -->
              <div class="text-11px color-[#909399] mb-4px" :class="msg.role === 'user' ? 'text-right' : ''">
                {{ msg.role === 'user' ? '用户' : 'AI 助手' }}
              </div>

              <!-- 消息气泡 -->
              <div
                v-if="msg.role === 'user'"
                class="msg-bubble user text-13px leading-[1.7]"
              >
                {{ msg.content }}
              </div>
              <div
                v-else
                class="markdown-body msg-bubble assistant"
                v-html="renderMarkdown(msg.content)"
              />
              <span v-if="msg.role === 'assistant' && index === store.messages.length - 1 && store.loading" class="streaming-indicator text-12px color-[#409eff]">正在生成...</span>
            </div>

            <!-- 用户头像 -->
            <div v-if="msg.role === 'user'" class="w-32px h-32px rounded-full flex items-center justify-center shrink-0 mt-4px bg-[var(--el-color-primary)] text-white">
              <Icon name="user" size="24" />
            </div>
          </div>

          <div v-if="store.loading && store.messages[store.messages.length - 1]?.role === 'user'" class="mb-4 flex gap-2">
            <div class="w-32px h-32px rounded-full flex items-center justify-center shrink-0 mt-4px bg-[var(--el-color-success)] text-white">
              <Icon name="robot" size="24" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-11px color-[#909399] mb-4px">AI 助手</div>
              <el-card shadow="never" class="card-assistant">
                <el-skeleton animated>
                  <template #template>
                    <el-skeleton-item variant="text" style="width: 60%" />
                    <el-skeleton-item variant="text" style="width: 80%" />
                    <el-skeleton-item variant="text" style="width: 40%" />
                  </template>
                </el-skeleton>
              </el-card>
            </div>
          </div>
        </div>
      </el-scrollbar>
    </el-main>

    <!-- 输入区域 -->
    <el-footer class="h-auto! px-5 pt-4 pb-5 border-t border-t-solid border-[#f0f0f0] bg-white flex-shrink-0">
      <div class="max-w-960px mx-auto">
        <div class="input-box m-t-20 mb-20 h-[50px] flex items-end gap-2.5 bg-[#f7f8fa] border border-solid border-[#e4e7ed] rounded-xl p-3.5 px-4.5 transition-all duration-250 hover:border-[#c0c4cc]">
          <el-input
            v-model="inputText"
            class="flex-1 chat-input"
            type="textarea"
            :rows="3"
            :autosize="{ minRows: 2, maxRows: 8 }"
            placeholder="请输入您的问题（Enter 发送，Shift+Enter 换行）..."
            :disabled="store.loading"
            resize="none"
            @keyup.enter="handleEnter"
          />
          <div class="flex h-full items-center gap-1.5 flex-shrink-0 pb-0.5">
            <el-tooltip :content="voiceTooltip" placement="top">
              <el-button
                v-if="voice.isSupported"
                :class="[{ 'is-listening': voice.status.value === 'listening' }, 'voice-btn', 'action-btn']"
                :type="voice.status.value === 'listening' ? 'danger' : 'default'"
                :icon="Microphone"
                circle
                @click="voice.toggle"
              />
              <el-tooltip v-else content="当前浏览器不支持语音输入" placement="top">
                <el-button class="action-btn voice-btn" :icon="Microphone" circle disabled />
              </el-tooltip>
            </el-tooltip>
            <el-button
              class="action-btn"
              type="primary"
              :loading="store.loading"
              :icon="Promotion"
              circle
              @click="handleSend"
            />
          </div>
        </div>
      </div>
    </el-footer>

    <VoiceInputTip
      :status="voice.status.value"
      :interim-text="voice.interimText.value"
      :error-message="voice.errorMessage.value"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted, onUnmounted } from 'vue';
import { Delete, Setting, Promotion, Microphone, ChatLineSquare, Collection } from '@element-plus/icons-vue';
import { useChatStore } from '@/store/modules/chat';
import { executeLlmStream } from '@/api/ai/chatExecute';
import { KnowledgeBaseAPI } from '@/api/ai/knowledgeBase';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useAutoScroll } from '@/hooks/useAutoScroll';
import VoiceInputTip from './VoiceInputTip.vue';
import Icon from '@/components/Icon/index.vue';
import emitter from '@/utils/bus';
// @ts-ignore
import MarkdownIt from 'markdown-it';
import { ElMessageBox, ElMessage } from 'element-plus';

const props = defineProps<{ selectedKnowledgeId?: number | null }>();

const store = useChatStore();

const md = new MarkdownIt({ html: false, linkify: true, typographer: true });

function renderMarkdown(text: string): string {
  return md.render(text);
}

const inputText = ref('');
const scrollbarRef = ref();

// ===== 智能滚动 =====
const { containerRef, scrollToBottom } = useAutoScroll();

// 将 el-scrollbar 的 wrapRef 绑定到 useAutoScroll
watch(scrollbarRef, (val) => {
  if (val?.wrapRef) {
    containerRef.value = val.wrapRef;
  }
});

// ===== 系统提示词编辑 =====
const editSystemPrompt = ref('');
const systemPromptShort = ref('提示词');

function fetchSystemPrompt() {
  editSystemPrompt.value = store.systemPrompt;
  systemPromptShort.value = store.systemPrompt.length > 10
    ? store.systemPrompt.slice(0, 10) + '...'
    : store.systemPrompt;
}

function saveSystemPrompt() {
  store.systemPrompt = editSystemPrompt.value;
  ElMessage.success('系统提示词已更新');
  systemPromptShort.value = store.systemPrompt.length > 10
    ? store.systemPrompt.slice(0, 10) + '...'
    : store.systemPrompt;
}

function resetSystemPrompt() {
  editSystemPrompt.value = '你是一个智能助手，请基于提供的上下文准确回答用户问题。';
}

// ===== 语音输入 =====
const voice = useSpeechRecognition({
  onResult: (text: string) => {
    inputText.value = text;
    nextTick(() => {
      const textarea = document.querySelector('.chat-input textarea');
      if (textarea) (textarea as HTMLTextAreaElement).focus();
    });
  },
  onError: (error: string) => { ElMessage.error(error); },
});

const voiceTooltip = ref('语音输入');
watch(() => voice.status, (status) => {
  const tips: Record<string, string> = {
    idle: '点击开始语音输入',
    listening: '点击停止录音',
    recognizing: '正在识别...',
    error: voice.errorMessage.value,
  };
  voiceTooltip.value = tips[status as any] || '语音输入';
});

// ===== 消息发送 =====
function handleEnter(e: KeyboardEvent) {
  if (!e.shiftKey) { e.preventDefault(); handleSend(); }
}

async function handleSend() {
  const text = inputText.value.trim();
  if (!text || store.loading) return;

  store.addMessage({ role: 'user', content: text });
  inputText.value = '';
  store.loading = true;
  store.addMessage({ role: 'assistant', content: '' });

  // 如果选中了知识库，先检索相关内容注入上下文
  let contextMessages = store.getContextMessages();
  if (props.selectedKnowledgeId) {
    try {
      const results = await KnowledgeBaseAPI.retrieve(props.selectedKnowledgeId, {
        query: text,
        topK: 5,
      });
      if (results && results.length > 0) {
        const knowledgeContext = results
          .map((r, i) => `[${i + 1}] ${r.content}`)
          .join('\n\n');
        // 在系统提示词后追加检索到的知识库内容
        const kbPrompt = `\n\n--- 以下是知识库中检索到的相关内容，请基于这些内容回答用户问题 ---\n${knowledgeContext}\n--- 知识库内容结束 ---`;
        if (contextMessages.length > 0 && contextMessages[0].role === 'system') {
          contextMessages[0] = {
            ...contextMessages[0],
            content: contextMessages[0].content + kbPrompt,
          };
        } else {
          contextMessages.unshift({ role: 'system', content: `你是一个智能助手。${kbPrompt}` });
        }
      }
    } catch (err: any) {
      console.warn('知识库检索失败，将直接与大模型对话:', err.message);
    }
  }

  await executeLlmStream(
    contextMessages,
    store.currentSession?.namespace || '',
    (event) => {
      if (event.type === 'content' && event.text) {
        store.updateLastMessage(event.text);
      } else if (event.type === 'done') {
        store.loading = false;
        if (event.tokens) {
          store.setLastMessageTokens(event.tokens.prompt, event.tokens.completion);
        }
      } else if (event.type === 'error' && event.message) {
        store.updateLastMessage(`\n\n[错误: ${event.message}]`);
        store.loading = false;
      }
    },
  );
}

function handleClear() {
  ElMessageBox.confirm('确定清空当前会话的所有消息吗？', '提示', { type: 'info' })
    .then(() => { store.clearMessages(); ElMessage.success('会话已清空'); })
    .catch(() => {});
}

// ===== 自动滚动 =====
// 监听新消息添加
watch(() => store.messages.length, () => scrollToBottom());

// 监听最后一条消息的内容变化（流式响应时内容会持续更新）
watch(
  () => {
    const msgs = store.messages;
    if (msgs.length === 0) return '';
    return msgs[msgs.length - 1].content;
  },
  () => scrollToBottom()
);

// 监听 loading 状态变化（流结束时确保滚动到底部）
watch(() => store.loading, (v) => { if (!v) scrollToBottom(); });

// ===== 命名空间监听 =====
function setNamespace(ns: string) {
  if (store.currentSession) { store.currentSession.namespace = ns; }
}

onMounted(() => {
  store.ensureSession();
  emitter.on('update-namespace', setNamespace);
  // 注入页面上下文，供全局 AI 助手使用
  store.setPageContext({
    pageName: 'AI 大模型对话',
    moduleKey: 'aiModule',
    data: { source: 'chat-interface' },
  });
});

onUnmounted(() => {
  store.setPageContext(null);
});
</script>

<style scoped>
@keyframes blink {
  50% { opacity: 0.5; }
}

.streaming-indicator {
  animation: blink 1s step-end infinite;
}

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
  border: 1px solid #f0f0f0;
  border-top-left-radius: 4px;
  box-sizing: border-box;
  width: 100%;
  white-space: normal;
  overflow-x: hidden;
}

.card-assistant {
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  background: #fafbfc;
  overflow: hidden;
}
.card-assistant :deep(.el-card__body) {
  overflow-x: auto;
}

.markdown-body {
  font-size: 14px;
  line-height: 1.7;
  color: #303133;
}
.markdown-body :deep(code) {
  background-color: #f1f2f4;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 13px;
}
.markdown-body :deep(pre) {
  background-color: #f6f8fa;
  padding: 16px;
  border-radius: 8px;
  overflow: auto;
  border: 1px solid #eaeaea;
  margin: 12px 0;
  max-width: 100%;
  box-sizing: border-box;
}
.markdown-body :deep(pre code) {
  background: none;
  padding: 0;
}
.markdown-body :deep(p) { margin: 8px 0; }
.markdown-body :deep(ul),
.markdown-body :deep(ol) { padding-left: 20px; }
.markdown-body :deep(blockquote) {
  border-left: 4px solid #409eff;
  padding-left: 12px;
  color: #606266;
  margin: 12px 0;
}
.markdown-body :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 12px 0;
  display: block;
  overflow-x: auto;
  box-sizing: border-box;
  max-width: 100%;
}
.markdown-body :deep(th),
.markdown-body :deep(td) {
  border: 1px solid #ebeef5;
  padding: 8px 12px;
  text-align: left;
  white-space: nowrap;
}
.markdown-body :deep(th) {
  background: #f5f7fa;
  font-weight: 600;
}
.markdown-body :deep(tr:hover) {
  background: #f5f7fa;
}

.input-box:focus-within {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.12);
}

.chat-input :deep(textarea) {
  background: transparent;
  border: none;
  box-shadow: none;
  padding: 0;
  line-height: 1.6;
  font-size: 14px;
}
.chat-input :deep(textarea:focus) {
  box-shadow: none;
}
.chat-input :deep(.el-textarea__inner) {
  background: transparent;
  border: none;
  box-shadow: none;
  padding: 0;
}
.chat-input :deep(.el-textarea__inner:focus) {
  box-shadow: none;
}

.action-btn {
  width: 34px;
  height: 34px;
  font-size: 16px;
  transition: all 0.2s;
}
.voice-btn:hover:not(.is-disabled) {
  color: #409eff;
  background: #ecf5ff;
}
</style>
