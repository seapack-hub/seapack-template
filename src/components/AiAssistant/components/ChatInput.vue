<!--
  AiAssistant/ChatInput.vue — 输入区域

  职责：
    1. 文本输入框
    2. 停止按钮（流式输出时显示）
    3. 清空按钮
    4. 发送按钮

  Props：
    - modelValue: 输入文本
    - loading: 是否正在加载
    - isSceneMode: 是否处于场景模式

  Emits：
    - update:modelValue: 更新输入文本
    - send: 发送消息
    - stop: 停止生成
    - clear: 清空会话
-->
<template>
  <div class="px-12px py-8px" style="border-top: 1px solid var(--el-border-color-light)">
    <el-input
      :model-value="modelValue"
      type="textarea"
      :rows="3"
      :placeholder="isSceneMode ? '向场景提问（Enter 发送）' : '输入问题（Enter 发送，Shift+Enter 换行）'"
      :disabled="loading"
      resize="none"
      @update:model-value="emit('update:modelValue', $event)"
      @keyup.enter="handleEnter"
    />
    <div class="flex items-center justify-between mt-6px">
      <el-button
        v-if="loading"
        size="small"
        @click="emit('stop')"
      >
        <el-icon :size="14" style="margin-right: 2px"><CircleCloseFilled /></el-icon>
        停止
      </el-button>
      <span v-else />
      <div class="flex items-center gap-6px">
        <el-button size="small" :icon="Delete" @click="emit('clear')">清空</el-button>
        <el-button
          type="primary"
          size="small"
          :icon="Promotion"
          :disabled="loading || !modelValue.trim()"
          @click="emit('send')"
        >
          发送
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Promotion, Delete, CircleCloseFilled } from '@element-plus/icons-vue'

// ===== Props =====
defineProps<{
  modelValue: string
  loading: boolean
  isSceneMode: boolean
}>()

// ===== Emits =====
const emit = defineEmits<{
  'update:modelValue': [value: string]
  send: []
  stop: []
  clear: []
}>()

// ===== 方法 =====
function handleEnter(e: KeyboardEvent) {
  if (!e.shiftKey) {
    e.preventDefault()
    emit('send')
  }
}
</script>
