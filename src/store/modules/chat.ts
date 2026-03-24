import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ChatMessage } from '@/api/ai/index'

export const useChatStore = defineStore('chat',()=>{
  //消息列表
  const messages = ref<ChatMessage[]>([]);
  //加载状态
  const loading = ref(false);

  //添加消息
  const addMessage = (msg:ChatMessage)=>{
    messages.value.push(msg);
  }

  //更新最后一条消息
  const updateLastMessage = (text:string)=>{
    const lastMsg = messages.value[messages.value.length-1];
    if(lastMsg && lastMsg.role === 'assistant'){
      lastMsg.content += text;
    }
  }

  //清空对话
  const clearHistory = ()=>{
    messages.value = [];
  }

  return {messages, loading, addMessage, updateLastMessage, clearHistory}
})