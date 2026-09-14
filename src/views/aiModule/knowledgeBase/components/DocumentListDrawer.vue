<!--
  文档管理抽屉
  上传文档 + 消息日志面板 + 文档列表 + 状态管理
-->
<template>
  <el-drawer
    v-model="visible"
    :title="`文档管理 — ${knowledgeName}`"
    size="800px"
    @opened="onOpened"
  >
    <!-- 上传区域 -->
    <div class="upload-area">
      <el-upload
        ref="uploadRef"
        class="upload-wrapper"
        drag
        :auto-upload="false"
        :on-change="onFileChange"
        :limit="1"
        :on-exceed="handleExceed"
        accept=".txt,.pdf,.doc,.docx,.md"
        :disabled="uploading"
      >
        <el-icon class="el-icon--upload" :size="32"><upload-filled /></el-icon>
        <div class="el-upload__text">
          拖拽文件到这里，或 <em>点击选择</em>
        </div>
        <template #tip>
          <div class="upload-tip">支持 TXT / PDF / DOC / DOCX / MD，单次上传一个文件</div>
        </template>
      </el-upload>
    </div>

    <!-- 实时消息日志面板 -->
    <div class="log-panel">
      <div class="log-header">
        <div class="flex items-center gap-6px">
          <span class="log-title">任务日志</span>
          <el-tag v-if="activeTaskCount > 0" type="primary" size="small" effect="plain" round>
            运行中 {{ activeTaskCount }}
          </el-tag>
          <el-tag v-else-if="hasError" type="danger" size="small" effect="plain" round>
            有错误
          </el-tag>
          <el-tag v-else type="info" size="small" effect="plain" round>
            {{ logEntries.length > 0 ? '已完成' : '等待任务' }}
          </el-tag>
        </div>
        <el-button v-if="logEntries.length > 0" text type="info" size="small" @click="clearLogs">
          <el-icon><Delete /></el-icon> 清空
        </el-button>
      </div>
      <!-- 总进度条 -->
      <el-progress
        v-if="activeTaskCount > 0"
        :percentage="overallProgress"
        :stroke-width="3"
        :show-text="false"
        class="log-progress"
      />
      <div ref="logContainerRef" class="log-body">
        <!-- 空状态 -->
        <div v-if="logEntries.length === 0" class="log-empty">
          <span class="log-empty-icon">…</span>
          <span>上传或重新处理文档后，执行日志将在此展示</span>
        </div>
        <!-- 日志条目 -->
        <div
          v-for="(entry, idx) in logEntries"
          :key="idx"
          class="log-entry"
          :class="`log-entry--${entry.level}`"
        >
          <span class="log-time">{{ entry.time }}</span>
          <span class="log-icon">{{ logIcon(entry.level) }}</span>
          <span v-if="entry.fileName" class="log-file">[{{ entry.fileName }}]</span>
          <span class="log-msg">{{ entry.message }}</span>
        </div>
      </div>
    </div>

    <!-- 文档列表 -->
    <div class="flex items-center justify-between mb-12px mt-16px">
      <span class="text-14px font-600">文档列表</span>
      <el-button text type="primary" size="small" @click="fetchDocuments">
        <el-icon><Refresh /></el-icon> 刷新
      </el-button>
    </div>

    <SpTable
      v-loading="loadingDocs"
      :data="documents"
      :columns="docColumns"
      :show-index="true"
      size="small"
      class="doc-table"
    >
      <template #parseStatus>
        <el-table-column label="解析状态" prop="parseStatus" width="100" align="center" slot-name="parseStatus">
          <template #default="{ row }">
            <el-tag :type="(PARSE_STATUS_MAP[row.parseStatus]?.type as any) || 'info'" size="small">
              {{ PARSE_STATUS_MAP[row.parseStatus]?.label || '未知' }}
            </el-tag>
          </template>
        </el-table-column>
      </template>
      <template #vectorStatus>
        <el-table-column label="向量化" prop="vectorStatus" width="100" align="center" slot-name="vectorStatus">
          <template #default="{ row }">
            <el-tag :type="(VECTOR_STATUS_MAP[row.vectorStatus]?.type as any) || 'info'" size="small">
              {{ VECTOR_STATUS_MAP[row.vectorStatus]?.label || '未知' }}
            </el-tag>
          </template>
        </el-table-column>
      </template>
      <template #operate>
        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" :disabled="row.parseStatus === 1 || row.vectorStatus === 1" @click="handleReprocess(row as KnowledgeDocument)">
              重新处理
            </el-button>
            <el-button link type="danger" size="small" @click="handleDeleteDoc(row as KnowledgeDocument)">删除</el-button>
          </template>
        </el-table-column>
      </template>
    </SpTable>

    <div class="h-[40px] mt-10px">
      <Pagination
        v-model:total="docTotal"
        v-model:page="docQuery.pageNum"
        v-model:limit="docQuery.pageSize"
        @pagination="fetchDocuments"
      />
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { Delete, UploadFilled, Refresh } from '@element-plus/icons-vue'
import { ElMessageBox, type UploadInstance, type UploadProps } from 'element-plus'
import { KnowledgeBaseAPI, type KnowledgeDocument } from '@/api/ai/knowledgeBase'
import { DOCUMENT_LIST_COLUMNS } from '../utils/tableColumns'
import { PARSE_STATUS_MAP, VECTOR_STATUS_MAP } from '../utils/moduleOptions'
import CacheKey from '@/constants/cache-key'

/** 单条日志条目 */
interface LogEntry {
  time: string
  level: 'info' | 'success' | 'warn' | 'error'
  message: string
  fileName?: string
}

const visible = defineModel<boolean>('visible', { required: true })

const props = defineProps<{
  knowledgeId: number
  knowledgeName: string
}>()

const uploadRef = ref<UploadInstance>()
const uploading = ref(false)
const loadingDocs = ref(false)
const documents = ref<KnowledgeDocument[]>([])
const docTotal = ref(0)
const docQuery = reactive({ pageNum: 1, pageSize: 10 })

// --- 日志面板 ---
const logEntries = ref<LogEntry[]>([])
const logContainerRef = ref<HTMLDivElement>()
/** 运行中的任务数 */
const activeTaskCount = ref(0)
/** 是否存在错误 */
const hasError = ref(false)
/** 总进度百分比（所有活跃任务的平均值） */
const overallProgress = ref(0)

/** 活跃的 SSE 连接，组件卸载时关闭 */
const activeFetchControllers = ref<AbortController[]>([])
/** 标记任务是否已通过 SSE 消息完成（避免流结束时重复减少计数） */
const taskCompletedByMessage = ref<Map<string, boolean>>(new Map())

const docColumns = [...DOCUMENT_LIST_COLUMNS]

function formatTime() {
  const d = new Date()
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`
}

function logIcon(level: LogEntry['level']) {
  const map: Record<string, string> = { info: '\u2139\uFE0F', success: '\u2705', warn: '\u26A0\uFE0F', error: '\u274C' }
  return map[level] || ''
}

function pushLog(level: LogEntry['level'], message: string, fileName?: string) {
  logEntries.value.push({ time: formatTime(), level, message, fileName })
  // 自动滚动到底部
  nextTick(() => {
    if (logContainerRef.value) {
      logContainerRef.value.scrollTop = logContainerRef.value.scrollHeight
    }
  })
}

function clearLogs() {
  logEntries.value = []
  hasError.value = false
  overallProgress.value = 0
  activeTaskCount.value = 0
  taskCompletedByMessage.value.clear()
}

function onOpened() {
  docQuery.pageNum = 1
  fetchDocuments()
}

async function fetchDocuments() {
  loadingDocs.value = true
  try {
    const res = await KnowledgeBaseAPI.getDocuments(props.knowledgeId, docQuery)
    documents.value = res.list || []
    docTotal.value = res.total || 0
  } finally {
    loadingDocs.value = false
  }
}

/**
 * 使用 fetch + ReadableStream 订阅 SSE 进度
 * SSE 消息格式: { phase, message, progress, documentId }
 *   phase: parsing | splitting | vectorizing | saving | done | error
 */
function subscribeProgress(taskToken: string, fileName: string) {
  const token = localStorage.getItem(CacheKey.TOKEN)
  const baseUrl = import.meta.env.VITE_BASE_API || '/api'
  // 注意：后端参数名是 taskToken，不是 token
  const url = `${baseUrl}/ai/knowledge/vector-progress?taskToken=${encodeURIComponent(taskToken)}`

  const controller = new AbortController()
  activeFetchControllers.value.push(controller)

  activeTaskCount.value++
  taskCompletedByMessage.value.set(taskToken, false)
  pushLog('info', '开始处理文档...', fileName)
  startAutoRefresh() // SSE 连接建立后启动自动刷新兜底

  fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    signal: controller.signal,
  })
    .then(async (response) => {
      if (!response.ok) {
        pushLog('warn', `SSE 连接失败 (${response.status})，将通过轮询跟踪进度`, fileName)
        activeTaskCount.value = Math.max(0, activeTaskCount.value - 1)
        return
      }
      const reader = response.body?.getReader()
      if (!reader) return

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data:')) {
            const jsonStr = line.slice(5).trim()
            if (!jsonStr) continue
            try {
              const data = JSON.parse(jsonStr)
              handleSseMessage(data, taskToken, fileName)
            } catch (_e) { /* 忽略非 JSON 行 */ }
          }
        }
      }
      // SSE 流正常结束（仅在未通过消息提前减少计数时才减少）
      if (!taskCompletedByMessage.value.get(taskToken)) {
        activeTaskCount.value = Math.max(0, activeTaskCount.value - 1)
      }
      taskCompletedByMessage.value.delete(taskToken)
    })
    .catch((err) => {
      if (err.name !== 'AbortError') {
        pushLog('warn', `SSE 连接异常: ${err.message}，将通过轮询跟踪进度`, fileName)
        activeTaskCount.value = Math.max(0, activeTaskCount.value - 1)
      }
    })
    .finally(() => {
      const idx = activeFetchControllers.value.indexOf(controller)
      if (idx >= 0) activeFetchControllers.value.splice(idx, 1)
    })
}

// --- 自动刷新兜底：SSE 失败时也能刷新表格 ---
let autoRefreshTimer: ReturnType<typeof setInterval> | null = null

function startAutoRefresh() {
  if (autoRefreshTimer) return // 已在运行
  autoRefreshTimer = setInterval(() => {
    fetchDocuments()
  }, 3000)
  // 10 秒后自动停止（避免无限轮询）
  setTimeout(() => stopAutoRefresh(), 10000)
}

function stopAutoRefresh() {
  if (autoRefreshTimer) {
    clearInterval(autoRefreshTimer)
    autoRefreshTimer = null
  }
}

/** 处理单条 SSE 消息 */
function handleSseMessage(data: any, taskToken: string, fileName: string) {
  const levelMap: Record<string, LogEntry['level']> = {
    started: 'info',
    parsing: 'info',
    chunking: 'info',
    vectorizing: 'info',
    done: 'success',
    error: 'error',
  }
  const level = levelMap[data.phase] || 'info'
  pushLog(level, data.message || data.phase, fileName)

  // 更新总进度
  if (typeof data.progress === 'number' && data.progress >= 0) {
    overallProgress.value = data.progress
  }

  if (data.phase === 'error') {
    hasError.value = true
  }

  // 完成或失败时：立即减少运行中计数 + 刷新列表 + 停止轮询
  if (data.phase === 'done' || data.phase === 'error') {
    activeTaskCount.value = Math.max(0, activeTaskCount.value - 1)
    taskCompletedByMessage.value.set(taskToken, true)
    stopAutoRefresh()
    fetchDocuments()
  }
}

const onFileChange: UploadProps['onChange'] = async (file) => {
  if (!file.raw) {
    ElMessage.error('文件读取失败，请重新选择')
    return
  }
  uploading.value = true
  try {
    const res = await KnowledgeBaseAPI.uploadDocument(props.knowledgeId, file.raw) as any
    uploadRef.value?.clearFiles()

    // 将新文档插入列表顶部
    if (res?.doc) {
      documents.value.unshift(res.doc)
      docTotal.value++
    }

    // 订阅 SSE 进度
    if (res?.taskToken && res?.doc?.id) {
      subscribeProgress(res.taskToken, file.name)
    } else {
      pushLog('warn', '上传成功但未获得任务令牌，无法跟踪进度', file.name)
    }
  } catch (err: any) {
    pushLog('error', `上传失败: ${err.message}`, file.name)
  } finally {
    uploading.value = false
  }
}

const handleExceed: UploadProps['onExceed'] = () => {
  ElMessageBox.alert('只允许同时上传一个文件，请先删除再上传新文件。', '提示', { type: 'warning' })
}

async function handleReprocess(row: KnowledgeDocument) {
  await ElMessageBox.confirm(`确认重新处理文档【${row.fileName}】？`, '提示', { type: 'warning' })
  try {
    const res = await KnowledgeBaseAPI.reprocessDocument(props.knowledgeId, row.id!) as any
    if (res?.taskToken) {
      subscribeProgress(res.taskToken, row.fileName)
    } else {
      pushLog('info', '已提交重新处理任务', row.fileName)
      await fetchDocuments()
    }
  } catch (err: any) {
    pushLog('error', `重新处理失败: ${err.message}`, row.fileName)
  }
}

async function handleDeleteDoc(row: KnowledgeDocument) {
  await ElMessageBox.confirm(`确认删除文档【${row.fileName}】？关联的分片也将被删除。`, '提示', { type: 'warning' })
  await KnowledgeBaseAPI.deleteDocument(props.knowledgeId, row.id!)
  pushLog('info', '文档已删除', row.fileName)
  await fetchDocuments()
}

// 组件卸载时清理
onUnmounted(() => {
  stopAutoRefresh()
  activeFetchControllers.value.forEach((c) => c.abort())
  activeFetchControllers.value = []
})
</script>

<style scoped>
.upload-area {
  padding: 10px;
  background: var(--el-fill-color-lighter);
  border-radius: 8px;
}
.upload-wrapper :deep(.el-upload-dragger) {
  background: transparent;
  border: 1px dashed var(--el-border-color);
  border-radius: 8px;
  padding: 10px 0;
}
.upload-tip {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  text-align: center;
  margin-top: 4px;
}

.doc-table {
  height: 380px;
}

/* 日志面板 */
.log-panel {
  margin-top: 12px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  overflow: hidden;
  background: var(--el-fill-color-blank);
  height: 200px;
  display: flex;
  flex-direction: column;
}
.log-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: var(--el-fill-color-lighter);
  border-bottom: 1px solid var(--el-border-color-lighter);
  flex-shrink: 0;
}
.log-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}
.log-progress {
  padding: 8px 12px 0;
  flex-shrink: 0;
}
.log-progress :deep(.el-progress-bar__outer) {
  border-radius: 4px;
  background: var(--el-fill-color-darker);
}
.log-progress :deep(.el-progress-bar__inner) {
  border-radius: 4px;
  background: linear-gradient(90deg, var(--el-color-primary-light-3), var(--el-color-primary));
}
.log-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 8px 12px;
  font-size: 12px;
  line-height: 1.8;
  background: var(--el-fill-color-lighter);
}
.log-entry {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  white-space: nowrap;
}
.log-entry--info .log-msg { color: var(--el-text-color-regular); }
.log-entry--success .log-msg { color: var(--el-color-success); }
.log-entry--warn .log-msg { color: var(--el-color-warning); }
.log-entry--error .log-msg { color: var(--el-color-danger); font-weight: 600; }
.log-time { color: var(--el-text-color-placeholder); flex-shrink: 0; }
.log-icon { flex-shrink: 0; }
.log-file { color: var(--el-color-primary); flex-shrink: 0; }
.log-msg { color: var(--el-text-color-primary); word-break: break-all; white-space: pre-wrap; }
.log-empty {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--el-text-color-placeholder);
  font-size: 12px;
  justify-content: center;
  height: 100%;
}
.log-empty-icon {
  font-size: 16px;
  opacity: 0.5;
}
</style>
