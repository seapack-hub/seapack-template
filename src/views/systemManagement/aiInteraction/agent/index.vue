<template>
  <div class="agent-container h-[100%] w-[100%] px-20 py-0 flex flex-col gap-20 box-border">
    <!-- 顶部输入区 -->
    <el-card shadow="hover" class="input-section h-[90px]">
      <div class="input-wrapper">
        <el-input
          v-model="userInput"
          placeholder="请输入任务..."
          size="large"
          :disabled="isGenerating"
          @keyup.enter="handleStart"
        >
          <template #append>
            <el-button
              type="primary"
              :loading="isGenerating"
              icon="Promotion"
              @click="handleStart"
            >
              {{ isGenerating ? '生成中...' : '开始生成' }}
            </el-button>
          </template>
        </el-input>
      </div>
    </el-card>

    <!-- 进度与结果展示区 -->
    <el-card v-if="hasStarted" shadow="never" class="result-section flex-[1] flex flex-col">
      <div class="status-header box-border border-b border-gray-300 pb-4">
        <h3>任务执行进度</h3>
        <el-steps :active="currentStepIndex" finish-status="success" simple>
          <el-step title="理解需求" />
          <el-step title="搜索资料" />
          <el-step title="整理文档" />
          <el-step title="完成" />
        </el-steps>
      </div>
      <el-divider />

      <!-- 实时日志输出区，绑定 ref 用于自动滚动 -->
      <div ref="outputContainer" class="console-output flex-1 bg-[#f8f9fa] rounded p-15px overflow-y-auto font-[Consolas,monospace] leading-1.6 whitespace-pre-wrap">
        <div
          v-for="(log, index) in logs"
          :key="index"
          class="log-item mb-5px break-all"
          :class="log.type"
        >
          <span v-if="log.type === 'system'" class="system-msg text-[#409eff] font-bold block my-10px">
            <el-icon><InfoFilled /></el-icon> {{ log.content }}
          </span>
          <span v-else-if="log.type === 'content'" class="ai-text text-[#303133] font-bold block my-10px">
            {{ log.content }}
          </span>
          <span v-else-if="log.type === 'error'" class="error-msg text-[#f56c6c] font-bold block my-10px">
            <el-icon><CircleCloseFilled /></el-icon> 发生错误: {{ log.content }}
          </span>
        </div>
      </div>
    </el-card>
    <el-card v-else shadow="never" class="result-section flex-[1]">
      <div class="status-header">
        <span>暂无任务</span>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {InfoFilled, CircleCloseFilled } from '@element-plus/icons-vue'
import { useChatStream } from '@/hooks/useChatStream' // 引入刚才封装的 Hook

const userInput = ref('')
const outputContainer = ref<HTMLElement | null>(null)

// 直接解构使用 Hook 返回的所有状态和方法
const { 
  logs, 
  isGenerating, 
  hasStarted, 
  currentStepIndex, 
  startStream 
} = useChatStream({
  url: '/api/agent/run-agent',
  scrollContainerRef: outputContainer // 传入自动滚动的容器 ref
})

const handleStart = () => {
  if (!userInput.value.trim()) return
  startStream(userInput.value)
}
</script>

<style scoped>
.console-output { flex: 1; background-color: #f8f9fa; border-radius: 4px; padding: 15px; height: 400px; overflow-y: auto; font-family: 'Consolas', monospace; line-height: 1.6; white-space: pre-wrap; }
.log-item { margin-bottom: 5px; word-break: break-all; }
.system-msg { color: #409eff; font-weight: bold; display: block; margin: 10px 0; }
.ai-text { color: #303133; }
.error-msg { color: #f56c6c; display: block; }
</style>