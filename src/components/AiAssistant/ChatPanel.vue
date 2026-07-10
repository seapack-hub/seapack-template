<template>
  <div class="chat-panel">
    <div class="chat-header">
      <span class="header-title">AI 对话</span>
      <el-tag v-if="store.tokenCount > 0" type="info" effect="plain">
        {{ store.tokenCount }} tokens
      </el-tag>
      <el-button text :icon="Delete" @click="handleClear">清空</el-button>
    </div>

    <div ref="messageContainer" class="chat-messages">
      <div v-if="store.messages.length === 0" class="empty-state">
        <el-icon :size="40" color="#dcdfe6"><ChatLineSquare /></el-icon>
        <p>开始一段新对话</p>
        <p class="empty-hint">输入问题后按 Enter 发送</p>
      </div>

      <div
        v-for="(msg, index) in store.messages"
        :key="index"
        class="message-item"
        :class="msg.role"
      >
        <div class="message-avatar">
          <span v-if="msg.role === 'user'">👤</span>
          <span v-else>🤖</span>
        </div>
        <div class="message-bubble">
          <div class="message-role">{{ msg.role === 'user' ? '用户' : 'AI 助手' }}</div>
          <div class="message-content markdown-body" v-html="renderMarkdown(msg.content)" />
        </div>
      </div>

      <div v-if="store.loading" class="loading-indicator">
        <el-icon class="is-loading"><Loading /></el-icon>
        <span>AI 思考中...</span>
      </div>
    </div>

    <div class="chat-input-area">
      <el-input
        v-model="inputText"
        type="textarea"
        :rows="2"
        placeholder="输入问题（Enter 发送，Shift+Enter 换行）"
        :disabled="store.loading"
        resize="none"
        @keyup.enter="handleSend"
      />
      <div class="input-actions">
        <el-button type="primary" :loading="store.loading" :icon="Promotion" @click="handleSend">
          {{ store.loading ? '生成中' : '发送' }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted } from 'vue';
import { Delete, Promotion, ChatLineSquare, Loading } from '@element-plus/icons-vue';
import { useChatStore } from '@/store/modules/chat';
import { streamChat } from '@/api/ai/index';
import { ElMessageBox, ElMessage } from 'element-plus';
import MarkdownIt from 'markdown-it';

const store = useChatStore();
const md = new MarkdownIt({ html: false, linkify: true, typographer: true });

const inputText = ref('');
const messageContainer = ref<HTMLElement>();

function renderMarkdown(text: string): string {
  return md.render(text);
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
    store.namespace,
  );
}

function handleClear() {
  ElMessageBox.confirm('确定清空当前会话？', '提示', { type: 'info' })
    .then(() => { store.clearMessages(); ElMessage.success('已清空'); })
    .catch(() => {});
}

function scrollToBottom() {
  nextTick(() => {
    const el = messageContainer.value;
    if (el) el.scrollTop = el.scrollHeight;
  });
}

watch(() => store.messages.length, scrollToBottom);
watch(() => store.loading, (v) => { if (!v) scrollToBottom(); });

onMounted(() => {
  store.ensureSession();
});
</script>

<style scoped lang="scss">
.chat-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.chat-header {
  height: 44px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid #e8e8e8;
  flex-shrink: 0;
}

.header-title {
  font-size: 13px;
  font-weight: 600;
  color: #303133;
  flex: 1;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  color: #909399;
  gap: 8px;

  p { margin: 0; font-size: 14px; }
  .empty-hint { font-size: 12px; color: #c0c4cc; }
}

.message-item {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;

  &.assistant { flex-direction: row; }
  &.user { flex-direction: row-reverse; }
}

.message-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}

.message-bubble {
  max-width: calc(100% - 36px);
}

.message-role {
  font-size: 11px;
  color: #909399;
  margin-bottom: 4px;

  .user & { text-align: right; }
}

.message-content {
  font-size: 13px;
  line-height: 1.6;
  color: #303133;
  background: #f5f7fa;
  padding: 8px 12px;
  border-radius: 8px;

  .user & {
    background: #ecf5ff;
    color: #303133;
  }
}

.loading-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 0;
  font-size: 12px;
  color: #909399;
  margin-left: 36px;
}

.chat-input-area {
  padding: 8px 12px;
  border-top: 1px solid #e8e8e8;
  flex-shrink: 0;
}

.input-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 6px;
}

:deep(.markdown-body) {
  font-size: 13px; line-height: 1.6; color: #303133;
  code { background: #e8eaed; padding: 1px 4px; border-radius: 3px; font-size: 12px; font-family: 'Courier New', monospace; }
  pre { background: #f6f8fa; padding: 12px; border-radius: 6px; overflow: auto; border: 1px solid #eaeaea; margin: 8px 0; font-size: 12px; code { background: none; padding: 0; } }
  p { margin: 6px 0; }
  ul, ol { padding-left: 18px; margin: 4px 0; }
  blockquote { border-left: 3px solid #409eff; padding-left: 10px; color: #606266; margin: 8px 0; font-size: 12px; }
}
</style>
