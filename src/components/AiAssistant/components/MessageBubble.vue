<!--
  AiAssistant/MessageBubble.vue — 消息气泡

  职责：
    1. 显示用户/助手消息
    2. 显示 LLM 步骤时间线（仅最后一条助手消息）
    3. 显示 Token 使用统计
    4. 显示结果操作按钮
    5. 显示查看链路按钮

  Props：
    - message: 消息对象
    - index: 消息索引
    - isLast: 是否是最后一条消息
    - displayName: 显示名称
    - isSceneMode: 是否处于场景模式
    - llmSteps: LLM 步骤列表
    - resultHandlers: 结果处理器列表
    - hasTrace: 是否有链路数据

  Emits：
    - copy: 复制消息内容
    - callHandler: 调用结果处理器
    - viewTrace: 查看链路
-->
<template>
  <div class="flex gap-8px mb-16px" :class="message.role === 'assistant' ? 'flex-row' : 'flex-row-reverse'">
    <!-- 头像 -->
    <div
      class="w-32px h-32px rounded-full flex items-center justify-center shrink-0 mt-4px"
      :class="message.role === 'user' ? 'bg-[var(--el-color-primary)] text-white' : 'bg-[var(--el-color-success)] text-white'"
    >
      <Icon v-if="message.role === 'user'" name="user" size="24" />
      <Icon v-else name="robot" size="24" />
    </div>

    <!-- 消息内容 -->
    <div :class="message.role === 'assistant' ? 'w-[90%]' : 'max-w-[70%]'">
      <!-- 角色名称 -->
      <div class="text-11px color-#909399 mb-4px" :class="message.role === 'user' ? 'text-right' : ''">
        {{ message.role === 'user' ? '用户' : displayName }}
      </div>

      <!-- LLM 步骤时间线：仅在最后一条 assistant 消息中展示 -->
      <div v-if="message.role === 'assistant' && isLast && llmSteps.length > 0" class="mb-6px">
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

      <!-- 消息气泡 -->
      <div
        v-if="message.content && message.role === 'user'"
        class="msg-bubble user text-13px leading-[1.7]"
      >
        {{ message.content }}
      </div>
      <MarkdownRenderer
        v-else-if="message.content && message.role === 'assistant'"
        :content="message.content"
        class="msg-bubble assistant"
      />

      <!-- Token 使用统计（终止时不显示） -->
      <div v-if="message.role === 'assistant' && message.tokensPrompt != null && !message.content?.includes('对话已终止')" class="msg-meta-row">
        <span class="tabular-nums">
          Token {{ message.tokensPrompt }}/{{ message.tokensCompletion }}
        </span>
        <el-button link size="small" class="!text-11px !p-0" @click="emit('copy', message.content || '')">
          <el-icon :size="12"><CopyDocument /></el-icon>
        </el-button>
      </div>

      <!-- 结果操作按钮 -->
      <div v-if="message.role === 'assistant' && isSceneMode && message.content && resultHandlers.length > 0" class="flex gap-4px mt-6px">
        <el-button
          v-for="handler in resultHandlers"
          :key="handler.name"
          size="small"
          type="primary"
          text
          @click="emit('callHandler', handler.name, message)"
        >
          {{ handler.name }}
        </el-button>
      </div>

      <!-- 查看链路按钮 -->
      <div
        v-if="message.role === 'assistant' && isLast && hasTrace"
        class="flex gap-4px mt-6px"
      >
        <el-button size="small" type="primary" text @click="emit('viewTrace')">
          <el-icon :size="12" style="vertical-align: -2px; margin-right: 2px"><Connection /></el-icon>
          查看链路
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Loading, CopyDocument, Connection, CircleCheckFilled, RemoveFilled } from '@element-plus/icons-vue'
import MarkdownRenderer from '@/components/MarkdownRenderer/MarkdownRenderer.vue'
import Icon from '@/components/Icon/index.vue'
import type { ChatMessage, ResultHandler, StepProgress } from '@/store/modules/chat'

// ===== Props =====
defineProps<{
  message: ChatMessage
  index: number
  isLast: boolean
  displayName: string
  isSceneMode: boolean
  llmSteps: StepProgress[]
  resultHandlers: ResultHandler[]
  hasTrace: boolean
}>()

// ===== Emits =====
const emit = defineEmits<{
  copy: [content: string]
  callHandler: [name: string, msg: ChatMessage]
  viewTrace: []
}>()
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
