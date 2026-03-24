<template>
  <div class="chat-layout flex flex-col h-100% bg-[#f7f7f8]">
    <!--顶部标题-->
    <header class="chat-header p-x-20 p-y-15 bg-[#fff] flex items-center justify-between border-color-[#e5e5e5]">
       <h2>DeepSeek Chat (Vue 3.5)</h2>
       <el-button @click="store.clearHistory" class="clear-btn">清空历史</el-button>
    </header>
    <!-- 消息列表区域 -->
     <!-- 消息列表区域 -->
    <main class="message-container flex-1 flex p-20 flex-col overflow-y-auto" ref="messageContainer">
      <div 
        v-for="(msg, index) in store.messages" 
        :key="index" 
        class="message-row flex gap-15 w-100% m-y-0"
        :class="msg.role"
      >
        <div class="avatar">
          {{ msg.role === 'user' ? '👤' : '🤖' }}
        </div>
        <div class="message-content">
          <!-- 用户消息直接显示文本 -->
          <div v-if="msg.role === 'user'" class="user-text">{{ msg.content }}</div>
          
          <!-- AI 消息渲染 Markdown -->
          <div 
            v-else 
            class="ai-text markdown-body" 
            v-html="renderMarkdown(msg.content)"
          ></div>
        </div>
      </div>

      <!-- 加载状态提示 -->
      <div v-if="store.loading" class="loading-indicator">
        <span>DeepSeek 正在思考...</span>
      </div>
    </main>

    <!-- 底部输入区域 -->
    <footer class="input-area">
      <div class="input-wrapper">
        <textarea 
          v-model="inputText" 
          placeholder="输入消息，Shift + Enter 换行..."
          @keydown.enter.prevent="handleEnter"
          :disabled="store.loading"
        ></textarea>
        <button 
          @click="handleSend" 
          :disabled="!inputText.trim() || store.loading"
          class="send-btn"
        >
          {{ store.loading ? '生成中...' : '发送' }}
        </button>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { useChatStore } from '@/store/modules/chat'
import { streamChat } from '@/api/ai/index.ts'
// @ts-ignore  // 忽略类型检查，解决缺少声明文件的问题
import MarkdownIt from 'markdown-it'

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
    }
  )
}

</script>

<style lang="scss" scoped>
.chat-layout{
  border: 1px solid #d3d3d3;
  box-sizing: border-box;
  border-radius: 10px;
  .chat-header h2 { 
    margin: 0; 
    font-size: 1.2rem; 
  }
  .clear-btn { 
    background: none; 
    border: 1px solid #ddd; 
    padding: 5px 10px; 
    cursor: pointer; 
    border-radius: 4px; 
  }
}

/* 消息列表 */

/*.message-row {
  display: flex;
  gap: 15px;
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
} */
.message-row.user { flex-direction: row-reverse; }

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #eee;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.message-content {
  padding: 10px 15px;
  border-radius: 8px;
  line-height: 1.6;
  font-size: 1rem;
  overflow-x: auto;
}

.user-text { white-space: pre-wrap; }
.message-row.user .message-content { background: #f0f0f0; }
.message-row.assistant .message-content { background: #fff; border: 1px solid #e5e5e5; }

/* 输入区域 */
.input-area {
  padding: 20px;
  background: #fff;
  border-top: 1px solid #e5e5e5;
}
.input-wrapper {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  gap: 10px;
}
textarea {
  flex: 1;
  padding: 12px;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  resize: none;
  height: 50px;
  font-family: inherit;
  outline: none;
}
textarea:focus { border-color: #007bff; }
.send-btn {
  padding: 0 20px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
}
.send-btn:disabled { background: #ccc; cursor: not-allowed; }

/* Markdown 样式微调 */
:deep(.markdown-body pre) {
  background: #f6f8fa;
  padding: 10px;
  border-radius: 6px;
  overflow-x: auto;
}
:deep(.markdown-body code) {
  font-family: Consolas, monospace;
  background: #f6f8fa;
  padding: 2px 4px;
  border-radius: 4px;
}
</style>