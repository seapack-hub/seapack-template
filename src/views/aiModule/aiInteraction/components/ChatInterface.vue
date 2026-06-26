<template>
  <div class="chat-interface">
    <!-- 头部 -->
    <el-header class="chat-header">
      <div class="header-left">
        <h2 class="header-title">AI 大模型对话</h2>
        <el-tag v-if="store.tokenCount > 0" size="small" type="info" effect="plain">
          {{ store.tokenCount }} tokens
        </el-tag>
      </div>
      <div class="header-actions">
        <!-- 系统提示词设置 -->
        <el-popover placement="bottom-end" :width="400" trigger="click" @show="fetchSystemPrompt">
          <template #reference>
            <el-button text :icon="Setting">
              {{ systemPromptShort }}
            </el-button>
          </template>
          <div class="system-prompt-editor">
            <h4 class="editor-title">系统提示词（System Prompt）</h4>
            <p class="editor-desc">设置 AI 助手的角色和行为规则</p>
            <el-input
              v-model="editSystemPrompt"
              type="textarea"
              :rows="6"
              placeholder="例如：你是一个专业的前端开发工程师..."
            />
            <div class="editor-actions">
              <el-button @click="resetSystemPrompt">恢复默认</el-button>
              <el-button type="primary" @click="saveSystemPrompt">保存</el-button>
            </div>
          </div>
        </el-popover>
        <el-button text :icon="Delete" @click="handleClear">清空会话</el-button>
      </div>
    </el-header>

    <!-- 消息列表 -->
    <el-main class="chat-messages">
      <el-scrollbar ref="scrollbarRef" class="message-scrollbar" view-class="message-view">
        <div class="message-list">
          <div v-if="store.messages.length === 0" class="empty-state">
            <el-icon :size="48" color="#dcdfe6"><ChatLineSquare /></el-icon>
            <p>开始一段新对话</p>
            <p class="empty-hint">输入问题后按 Enter 发送，或按 🎤 使用语音输入</p>
          </div>

          <div
            v-for="(msg, index) in store.messages"
            :key="index"
            class="message-item"
            :class="msg.role === 'user' ? 'message-user' : 'message-assistant'"
          >
            <el-card shadow="never" :class="msg.role === 'user' ? 'card-user' : 'card-assistant'">
              <template #header>
                <div class="message-header">
                  <span class="role-tag">{{ msg.role === 'user' ? '👤 用户' : '🤖 AI 助手' }}</span>
                  <span v-if="msg.role === 'assistant' && index === store.messages.length - 1 && store.loading" class="streaming-indicator">正在生成...</span>
                </div>
              </template>
              <!-- eslint-disable-next-line vue/no-v-html -- MarkdownIt 已关闭 html 渲染，无 XSS 风险 -->
              <div class="markdown-body" v-html="renderMarkdown(msg.content)" />
            </el-card>
          </div>

          <div v-if="store.loading && store.messages[store.messages.length - 1]?.role === 'user'" class="loading-skeleton">
            <el-card shadow="never" class="card-assistant">
              <template #header><span class="role-tag">🤖 AI 助手</span></template>
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
      </el-scrollbar>
    </el-main>

    <!-- 输入区域 -->
    <el-footer class="chat-footer">
      <div class="input-area">
        <el-input
          v-model="inputText"
          class="chat-input"
          type="textarea"
          :rows="3"
          placeholder="请输入您的问题（Enter 发送，Shift+Enter 换行）..."
          :disabled="store.loading"
          resize="none"
          @keyup.enter="handleEnter"
        />
        <div class="input-actions">
          <el-tooltip :content="voiceTooltip" placement="top">
            <el-button
              v-if="voice.isSupported"
              :type="voice.status === 'listening' ? 'danger' : 'default'"
              :icon="Microphone"
              circle
              @click="voice.toggle"
            />
            <el-tooltip v-else content="当前浏览器不支持语音输入" placement="top">
              <el-button :icon="Microphone" circle disabled />
            </el-tooltip>
          </el-tooltip>
          <el-button type="primary" :loading="store.loading" :icon="Promotion" @click="handleSend">
            {{ store.loading ? '生成中...' : '发送' }}
          </el-button>
        </div>
      </div>
    </el-footer>

    <VoiceInputTip
      :status="voice.status"
      :interim-text="voice.interimText"
      :error-message="voice.errorMessage"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted } from 'vue';
import { Delete, Setting, Promotion, Microphone, ChatLineSquare } from '@element-plus/icons-vue';
import { useChatStore } from '@/store/modules/chat';
import { streamChat } from '@/api/ai/index';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import VoiceInputTip from './VoiceInputTip.vue';
import emitter from '@/utils/bus';
// @ts-ignore
import MarkdownIt from 'markdown-it';
import { ElMessageBox, ElMessage } from 'element-plus';

const store = useChatStore();

const md = new MarkdownIt({ html: false, linkify: true, typographer: true });

function renderMarkdown(text: string): string {
  return md.render(text);
}

const inputText = ref('');
const scrollbarRef = ref();

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
  voiceTooltip.value = tips[status] || '语音输入';
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

  const contextMessages = store.getContextMessages();

  await streamChat(
    contextMessages,
    (chunk) => store.updateLastMessage(chunk),
    () => { store.loading = false; },
    (err) => {
      store.updateLastMessage(`\n\n[错误: ${err.message}]`);
      store.loading = false;
    },
    store.currentSession?.namespace || '',
  );
}

function handleClear() {
  ElMessageBox.confirm('确定清空当前会话的所有消息吗？', '提示', { type: 'info' })
    .then(() => { store.clearMessages(); ElMessage.success('会话已清空'); })
    .catch(() => {});
}

// ===== 自动滚动 =====
watch(() => store.messages.length, () => {
  nextTick(() => {
    const scrollWrap = scrollbarRef.value?.wrapRef;
    if (scrollWrap) { scrollWrap.scrollTop = scrollWrap.scrollHeight; }
  });
});

// ===== 命名空间监听 =====
function setNamespace(ns: string) {
  if (store.currentSession) { store.currentSession.namespace = ns; }
}

onMounted(() => {
  store.ensureSession();
  emitter.on('update-namespace', setNamespace);
});
</script>

<style scoped lang="scss">
.chat-interface { height: 100%; display: flex; flex-direction: column; position: relative; overflow: hidden; }
.chat-header { height: 60px !important; display: flex; align-items: center; justify-content: space-between; padding: 0 20px; border-bottom: 1px solid #e8e8e8; flex-shrink: 0; }
.header-left { display: flex; align-items: center; gap: 10px; }
.header-title { font-size: 16px; font-weight: 600; color: #303133; margin: 0; }
.header-actions { display: flex; align-items: center; gap: 8px; }
.system-prompt-editor { padding: 8px; }
.editor-title { margin: 0 0 4px; font-size: 14px; color: #303133; }
.editor-desc { margin: 0 0 12px; font-size: 12px; color: #909399; }
.editor-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 12px; }
.chat-messages { flex: 1; padding: 0; overflow: hidden; }
.message-scrollbar { height: 100%; }
.message-view { padding: 20px; }
.message-list { max-width: 800px; margin: 0 auto; }
.empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 80px 0; color: #909399; gap: 8px; }
.empty-hint { font-size: 12px; color: #c0c4cc; }
.message-item { margin-bottom: 16px; }
.message-header { display: flex; align-items: center; justify-content: space-between; }
.role-tag { font-size: 13px; font-weight: 500; }
.streaming-indicator { font-size: 12px; color: #409eff; animation: blink 1s step-end infinite; }
@keyframes blink { 50% { opacity: 0.5; } }
.card-user { border: 1px solid #e6f0ff; border-radius: 12px; :deep(.el-card__header) { background: #f5f9ff; border-bottom: none; padding: 10px 16px; } }
.card-assistant { border: 1px solid #f0f0f0; border-radius: 12px; :deep(.el-card__header) { background: #fafafa; border-bottom: none; padding: 10px 16px; } }
:deep(.markdown-body) { font-size: 14px; line-height: 1.7; color: #303133;
  code { background-color: #f1f2f4; padding: 2px 6px; border-radius: 4px; font-family: 'Courier New', monospace; font-size: 13px; }
  pre { background-color: #f6f8fa; padding: 16px; border-radius: 8px; overflow: auto; border: 1px solid #eaeaea; margin: 12px 0; code { background: none; padding: 0; } }
  p { margin: 8px 0; } ul, ol { padding-left: 20px; }
  blockquote { border-left: 4px solid #409eff; padding-left: 12px; color: #606266; margin: 12px 0; }
}
.chat-footer { height: auto !important; padding: 12px 20px; border-top: 1px solid #e8e8e8; background: white; flex-shrink: 0; }
.input-area { max-width: 800px; margin: 0 auto; }
.chat-input { :deep(textarea) { border-radius: 8px; resize: none; } }
.input-actions { display: flex; justify-content: flex-end; align-items: center; gap: 8px; margin-top: 8px; }
.loading-skeleton { margin-bottom: 16px; }
</style>
