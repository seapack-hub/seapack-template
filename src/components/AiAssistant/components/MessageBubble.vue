<!--
  AiAssistant/MessageBubble.vue — 消息气泡

  职责：
    1. 显示用户/助手消息
    2. 显示 LLM 步骤时间线（仅最后一条助手消息）
    3. 显示 Token 使用统计 + 链路按钮
    4. 显示结果操作按钮

  Props：
    - message: 消息对象
    - index: 消息索引
    - isLast: 是否是最后一条消息
    - displayName: 显示名称
    - isSceneMode: 是否处于场景模式
    - llmSteps: LLM 步骤列表
    - resultHandlers: 结果处理器列表

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

      <!-- LLM 步骤时间线 -->
      <div v-if="message.role === 'assistant' && llmSteps.length > 0" class="mb-6px">
        <div class="step-timeline">
          <div v-for="(step, si) in llmSteps" :key="`step-${si}`" class="step-item">
            <div class="step-dot-col">
              <div class="step-dot" :class="'step-dot--' + step.status">
                <el-icon v-if="step.status === 'running'" class="is-loading" :size="16"><Loading /></el-icon>
                <el-icon v-else-if="step.status === 'success'" :size="16"><CircleCheckFilled /></el-icon>
                <el-icon v-else-if="step.status === 'fail'" :size="16"><CircleCloseFilled /></el-icon>
                <el-icon v-else :size="16"><RemoveFilled /></el-icon>
              </div>
              <div v-if="si < llmSteps.length - 1" class="step-line" />
            </div>

            <div class="step-content">
              <div class="step-info">
                <span class="step-name" :class="{ 'step-name--running': step.status === 'running' }">{{ step.stepName }}</span>
                <span v-if="step.status === 'running'" class="step-status-label">执行中</span>
                <span v-else-if="step.durationMs != null" class="step-duration">{{ step.durationMs }}ms</span>
              </div>

              <div v-if="step.progressList && step.progressList.length > 0" class="step-progress-list">
                <div v-for="(msg, pi) in step.progressList" :key="pi" class="step-progress-item">
                  <el-icon :size="14" class="shrink-0 mt-2px text-[var(--el-color-info)]"><InfoFilled /></el-icon>
                  <span class="step-progress-text">{{ msg }}</span>
                </div>
              </div>

              <div v-if="step.detailList && step.detailList.length > 0" class="step-detail-list">
                <div v-for="(detail, di) in step.detailList" :key="di" class="step-detail-item">
                  <template v-if="detail.detailType === 'agent_prompt'">
                    <div class="detail-header">
                      <el-tag size="small" type="primary" effect="plain">基础提示词</el-tag>
                      <span v-if="detail.data?.contentLength" class="detail-sub">{{ detail.data.contentLength }} 字符</span>
                    </div>
                    <pre v-if="detail.data?.content" class="detail-code">{{ truncateText(detail.data.content, 200) }}</pre>
                  </template>

                  <template v-else-if="detail.detailType === 'template_loaded'">
                    <div class="detail-header">
                      <el-tag size="small" type="success" effect="plain">模板</el-tag>
                      <span class="detail-name">{{ detail.data?.templateName }}</span>
                      <span v-if="detail.data?.contentLength" class="detail-sub">{{ detail.data.contentLength }} 字符</span>
                    </div>
                    <pre v-if="detail.data?.contentPreview" class="detail-code">{{ detail.data.contentPreview }}</pre>
                  </template>

                  <template v-else-if="detail.detailType === 'knowledge_result'">
                    <div class="detail-header">
                      <el-tag size="small" type="warning" effect="plain">知识库</el-tag>
                      <span class="detail-name">{{ detail.data?.knowledgeName }}</span>
                      <span v-if="detail.data?.foundCount != null" class="detail-sub">命中 {{ detail.data.foundCount }} 条</span>
                    </div>
                    <div v-if="detail.data?.chunks && detail.data.chunks.length > 0" class="knowledge-chunks">
                      <div v-for="(chunk, ci) in detail.data.chunks" :key="ci" class="knowledge-chunk">
                        <div class="chunk-preview">{{ chunk.contentPreview }}</div>
                        <div v-if="chunk.score != null" class="chunk-score">相关度: {{ (chunk.score * 100).toFixed(1) }}%</div>
                      </div>
                    </div>
                  </template>

                  <template v-else-if="detail.detailType === 'skill_params'">
                    <div class="detail-header">
                      <el-tag size="small" type="warning" effect="plain">参数</el-tag>
                      <span class="detail-name">{{ detail.data?.skillName }}</span>
                    </div>
                    <pre v-if="detail.data?.params" class="detail-code">{{ formatJson(detail.data.params) }}</pre>
                  </template>

                  <template v-else-if="detail.detailType === 'skill_result' && detail.data?.status === 'success'">
                    <div class="detail-header">
                      <el-tag size="small" type="success" effect="plain">结果</el-tag>
                      <span class="detail-name">{{ detail.data?.skillName }}</span>
                      <el-tag
                        v-if="detail.data?.httpMethod && detail.data?.url"
                        size="small" type="success" effect="plain"
                        class="detail-url"
                        :title="detail.data.httpMethod + ' ' + detail.data.url"
                      >
                        {{ detail.data.httpMethod }} {{ detail.data.url }}
                      </el-tag>
                    </div>
                    <pre v-if="detail.data?.resultPreview" class="detail-code">{{ detail.data.resultPreview }}</pre>
                  </template>

                  <template v-else-if="detail.detailType === 'skill_result' && detail.data?.status === 'failed'">
                    <div class="detail-header">
                      <el-tag size="small" type="danger" effect="plain">失败</el-tag>
                      <span class="detail-name">{{ detail.data?.skillName }}</span>
                    </div>
                    <div v-if="detail.data?.errorMessage" class="detail-error">{{ detail.data.errorMessage }}</div>
                  </template>

                  <template v-else>
                    <div class="detail-header">
                      <el-tag size="small" effect="plain">{{ detail.detailType }}</el-tag>
                    </div>
                    <pre class="detail-code">{{ formatJson(detail.data) }}</pre>
                  </template>
                </div>
              </div>
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

      <!-- Token 使用统计 + 链路按钮（终止时不显示） -->
      <div v-if="message.role === 'assistant' && message.tokensPrompt != null && !message.content?.includes('对话已终止')" class="msg-meta-row">
        <span class="tabular-nums">
          Token {{ message.tokensPrompt }}/{{ message.tokensCompletion }}
        </span>
        <el-button v-if="isLast" link type="primary" size="small" class="!text-11px !p-0" @click="emit('viewTrace', message.requestId)">
          <el-icon :size="12" style="vertical-align: -2px; margin-right: 2px"><Connection /></el-icon>
          追踪链路
        </el-button>
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { Loading, CopyDocument, Connection, CircleCheckFilled, CircleCloseFilled, RemoveFilled, InfoFilled } from '@element-plus/icons-vue'
import MarkdownRenderer from '@/components/MarkdownRenderer/MarkdownRenderer.vue'
import Icon from '@/components/Icon/index.vue'
import type { ChatMessage } from '@/api/ai/index'
import type { ResultHandler } from '@/store/modules/chat'
import type { StepProgress } from '@/hooks/useChatExecution'

// ===== Props =====
defineProps<{
  message: ChatMessage
  index: number
  isLast: boolean
  displayName: string
  isSceneMode: boolean
  llmSteps: StepProgress[]
  resultHandlers: ResultHandler[]
}>()

// ===== Emits =====
const emit = defineEmits<{
  copy: [content: string]
  callHandler: [name: string, msg: ChatMessage]
  viewTrace: [requestId?: string]
}>()

// ===== 辅助函数 =====
function truncateText(text: string, max: number): string {
  if (!text) return ''
  return text.length > max ? text.slice(0, max) + '...' : text
}

function formatJson(data: any): string {
  if (!data) return ''
  try {
    return typeof data === 'string' ? data : JSON.stringify(data, null, 2)
  } catch {
    return String(data)
  }
}
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
  padding: 2px 0;
}
.step-item {
  display: flex;
  gap: 8px;
}
.step-dot-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 18px;
  flex-shrink: 0;
}
.step-dot {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.step-dot--running {
  background: var(--el-color-primary-light-8);
  color: var(--el-color-primary);
}
.step-dot--success {
  background: var(--el-color-success-light-8);
  color: var(--el-color-success);
}
.step-dot--fail {
  background: var(--el-color-danger-light-8);
  color: var(--el-color-danger);
}
.step-dot--skip {
  background: var(--el-color-info-light-8);
  color: var(--el-color-info);
}
.step-line {
  width: 2px;
  flex: 1;
  min-height: 6px;
  background: var(--el-border-color-lighter);
}
.step-content {
  flex: 1;
  min-width: 0;
  padding-bottom: 6px;
}
.step-info {
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 20px;
  flex-wrap: wrap;
}
.step-name {
  font-size: 12px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}
.step-name--running {
  color: var(--el-color-primary);
}
.step-status-label {
  font-size: 11px;
  color: var(--el-color-primary);
  font-weight: 500;
}
.step-duration {
  font-size: 11px;
  color: var(--el-text-color-secondary);
  font-variant-numeric: tabular-nums;
}
.step-progress-list {
  margin-top: 4px;
  padding-left: 2px;
}
.step-progress-item {
  display: flex;
  align-items: flex-start;
  gap: 4px;
  margin-bottom: 2px;
}
.step-progress-text {
  font-size: 11px;
  color: var(--el-text-color-secondary);
  line-height: 16px;
}

/* 步骤详情列表 */
.step-detail-list {
  margin-top: 4px;
  padding-left: 2px;
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.step-detail-item {
  background: var(--el-fill-color-lighter);
  border-radius: 4px;
  padding: 4px 6px;
}
.detail-header {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
}
.detail-name {
  font-size: 11px;
  color: var(--el-text-color-regular);
}
.detail-sub {
  font-size: 10px;
  color: var(--el-text-color-secondary);
}
.detail-code {
  margin: 4px 0 0;
  font-size: 11px;
  line-height: 1.5;
  color: var(--el-text-color-regular);
  background: var(--el-bg-color);
  border-radius: 3px;
  padding: 4px 6px;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-all;
}
.detail-error {
  margin-top: 4px;
  font-size: 11px;
  line-height: 1.5;
  color: var(--el-color-danger);
  padding: 4px 6px;
  background: var(--el-color-danger-light-9);
  border-radius: 3px;
}
.detail-url {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 11px;
  vertical-align: middle;
}
.knowledge-chunks {
  margin-top: 4px;
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.knowledge-chunk {
  padding: 4px 6px;
  background: var(--el-fill-color);
  border-radius: 4px;
  border: 1px solid var(--el-border-color-extra-light);
}
.chunk-preview {
  font-size: 11px;
  color: var(--el-text-color-regular);
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-all;
}
.chunk-score {
  font-size: 10px;
  color: var(--el-text-color-secondary);
  margin-top: 2px;
}
</style>
