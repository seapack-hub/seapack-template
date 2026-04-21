<template>
  <div class="flex flex-col gap-10 h-full border-[#e8e8e8] border-solid border-1 relative">
    <!-- 聊天头部 -->
    <el-header class="!h-[60px] flex items-center justify-center gap-20 flex-shrink-0">
      <h2 class="font-bold text-blue-500">AI大模型 RAG 助手</h2>
      <el-button type="primary" @click="handleClear" :icon="Delete">清空会话</el-button>
    </el-header>
    <!-- 消息列表 -->
    <el-main class="flex-1 overflow-y-auto p-6 scroll-smooth ">
      <el-scrollbar ref="scrollbarRef" class="h-full">
        <div class="space-y-4">
          <!-- 消息项 -->
          <div
            v-for="(msg, index) in store.messages"
            :key="index"
            class="message-item"
          >
            <el-card
              :class="msg.role === 'user' ? 'bg-blue-50 border-blue-100' : 'bg-white border-gray-100'"
              shadow="never"
            >
              <template #header>
                <span class="font-medium" :class="msg.role === 'user' ? 'text-blue-600' : 'text-green-600'">
                  {{ msg.role === 'user' ? '👤 用户' : '🤖 AI大模型' }}
                </span>
              </template>
              <div class="markdown-body" v-html="renderMarkdown(msg.content)"></div>
            </el-card>
          </div>

          <!-- 加载状态 -->
          <el-card v-if="store.loading" class="bg-gray-50 border-gray-100" shadow="never">
            <div class="flex items-center text-gray-500">
              <el-icon class="mr-2" :animation="true"><Loading /></el-icon>
              正在检索知识库并思考...
            </div>
          </el-card>
        </div>
      </el-scrollbar>
    </el-main>
    <!-- 输入区域 -->
    <el-footer class="bg-white !h-[100px] border-[#e8e8e8] border-solid border-1 p-4 flex items-center">
      <div class="w-full flex justify-between items-center">
        <el-input
          v-model="inputText"
          class="flex-1"
          type="textarea"
          :rows="3"
          placeholder="请输入您的问题（支持Shift+Enter换行）..."
          @keyup.enter="handleEnter"
          :disabled="store.loading"
          resize="none"
        />
        <div class="w-[100px] flex justify-end mt-2">
          <el-button
            type="primary"
            :loading="store.loading"
            @click="handleSend"
            size="default"
          >
            {{ store.loading ? '生成中...' : '发送提问' }}
          </el-button>
        </div>
      </div>
    </el-footer>
  </div>
</template>

<script setup lang="ts">
import { Delete } from '@element-plus/icons-vue'
import { useChatStore } from '@/store/modules/chat'
import { streamChat } from '@/api/ai/index.ts'
// @ts-ignore  // 忽略类型检查，解决缺少声明文件的问题
import MarkdownIt from 'markdown-it'
import emitter from '@/utils/bus';

const namespace = ref('');
// 初始化 Markdown 解析器
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true
})

const store = useChatStore()
const inputText = ref('')
const messageContainer = ref<HTMLElement | null>(null);

//渲染 Markdown
const renderMarkdown = (text:string) =>{
  return md.render(text);
}

//自动滚动到底部
const scrollToBottom = ()=>{
  nextTick(()=>{
    if(messageContainer.value){
      messageContainer.value.scrollTop = messageContainer.value.scrollHeight;
    }
  })
}

// 监听消息列表变化，自动滚动
watch(() => store.messages.length, scrollToBottom);

//处理回车发送
const handleEnter = (e: KeyboardEvent)=>{
  if (!e.shiftKey) {
    handleSend()
  }
}

// 发送消息核心逻辑
const handleSend = async ()=>{
  const text = inputText.value.trim();
  if(!text || store.loading) return;

  //添加用户消息
  store.addMessage({role:"user",content:text});
  inputText.value = "";
  store.loading = true;

  //预设一个空的AI消息，用于接收流式数据
  store.addMessage({role:"assistant",content:""});

  //调用API 注意：这里发送的是除了最后一条空消息之外的所有历史
  const history = store.messages.slice(0,-1);
  await streamChat(
    history,
    // onChunk: 收到文本片段
    (text)=>store.updateLastMessage(text),
    // onDone: 完成
    ()=>{ store.loading = false},
    // onError: 报错
    (err)=>{
      store.updateLastMessage(`\n\n[错误: ${err.message}]`)
      store.loading = false
    },
    //传递命名空间
    namespace.value,
  )
}

// 清空会话
const handleClear = () => {
  store.clearHistory()
  ElMessageBox.confirm('会话已清空', '提示', { type: 'info' })
}

// 设置命名空间
const setNamespace = (ns: string) => {
  namespace.value = ns;
}

onMounted(() => {
  // 订阅事件
  emitter.on('update-namespace', setNamespace);
})

onUnmounted(() => {
  // 取消订阅事件
  emitter.off('update-namespace', setNamespace);
})
</script>

<style lang="scss" scoped>
// 消息气泡圆角
.message-item {
  :deep(.el-card) {
    border-radius: 12px;
    border-width: 1px;
  }
  :deep(.el-card__header) {
    background: transparent;
    padding: 10px 16px;
    border-bottom: 1px solid rgba(0,0,0,0.05);
  }
}

// Markdown 样式微调
:deep(.markdown-body) {
  font-size: 14px;
  code {
    background-color: #f1f2f4;
    padding: 2px 6px;
    border-radius: 4px;
    font-family: 'Courier New', monospace;
  }
  pre {
    background-color: #f6f8fa;
    padding: 16px;
    border-radius: 8px;
    overflow: auto;
    border: 1px solid #eaeaea;
  }
}
</style>