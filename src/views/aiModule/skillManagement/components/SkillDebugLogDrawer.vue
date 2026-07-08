<!--
  Skill 调试日志查看器
  分页查询调试日志 + 查看详情（含完整请求/响应）
-->
<template>
  <el-drawer
    v-model="visible"
    title="调试日志"
    size="800px"
    @opened="onOpened"
  >
    <!-- 搜索栏 -->
    <div class="flex items-center gap-8px mb-12px">
      <el-select v-model="queryParams.status" placeholder="状态" clearable size="default" style="width: 120px">
        <el-option label="成功" value="success" />
        <el-option label="失败" value="fail" />
        <el-option label="超时" value="timeout" />
      </el-select>
      <el-button type="primary" icon="search" size="default" @click="fetchLogs">搜索</el-button>
    </div>

    <!-- 日志列表 -->
    <SpTable
      v-loading="loading"
      :data="logs"
      :columns="logColumns"
      :show-index="true"
      size="small"
      @row-click="onRowClick"
    >
      <template #status>
        <el-table-column label="状态" prop="status" width="80" align="center" slot-name="status">
          <template #default="{ row }">
            <el-tag :type="row.status === 'success' ? 'success' : row.status === 'fail' ? 'danger' : 'warning'" size="small">
              {{ row.status === 'success' ? '成功' : row.status === 'fail' ? '失败' : '超时' }}
            </el-tag>
          </template>
        </el-table-column>
      </template>
      <template #operate>
        <el-table-column label="操作" width="100" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click.stop="onRowClick(row)">详情</el-button>
            <el-button link type="danger" size="small" @click.stop="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </template>
    </SpTable>

    <div class="h-40px mt-10px">
      <Pagination
        v-model:total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="fetchLogs"
      />
    </div>

    <!-- 详情弹窗 -->
    <el-dialog
      v-model="detailVisible"
      title="调试日志详情"
      width="750px"
      append-to-body
      class="debug-detail-dialog"
    >
      <div v-if="detail" class="detail-content">
        <!-- 汇总 -->
        <div class="detail-summary">
          <div class="summary-item">
            <span class="summary-label">模型</span>
            <span class="summary-value">{{ detail.llmModel || '-' }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">状态</span>
            <el-tag :type="detail.status === 'success' ? 'success' : 'danger'" size="small">
              {{ detail.status === 'success' ? '成功' : '失败' }}
            </el-tag>
          </div>
          <div class="summary-item">
            <span class="summary-label">总耗时</span>
            <span class="summary-value tabular-nums">{{ formatDuration(detail.durationMs) }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">LLM 耗时</span>
            <span class="summary-value tabular-nums">{{ formatDuration(detail.durationLlmMs) }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Token</span>
            <span class="summary-value tabular-nums">{{ detail.tokensPrompt }} / {{ detail.tokensCompletion }}</span>
          </div>
        </div>

        <el-tabs v-model="detailTab" class="detail-tabs">
          <!-- 输入参数 -->
          <el-tab-pane name="params">
            <template #label><span class="text-12px">输入参数</span></template>
            <pre class="code-block">{{ formatJson(detail.inputParams) }}</pre>
            <div v-if="detail.userMessage" class="mt-8px">
              <div class="text-11px font-600 color-[var(--el-text-color-secondary)] mb-4px">补充指令</div>
              <div class="text-13px color-[var(--el-text-color-primary)] bg-[var(--el-fill-color)] rounded-6 p-10px">{{ detail.userMessage }}</div>
            </div>
          </el-tab-pane>

          <!-- Prompt 渲染 -->
          <el-tab-pane name="prompt">
            <template #label><span class="text-12px">Prompt 渲染</span></template>
            <div class="prompt-compare">
              <div class="compare-col">
                <div class="compare-label">原始模板</div>
                <pre class="code-block">{{ detail.rawPromptTemplate || '无' }}</pre>
              </div>
              <div class="compare-col">
                <div class="compare-label">渲染结果</div>
                <pre class="code-block">{{ detail.renderedPrompt || '无' }}</pre>
              </div>
            </div>
          </el-tab-pane>

          <!-- LLM 请求 -->
          <el-tab-pane name="request">
            <template #label><span class="text-12px">LLM 请求</span></template>
            <pre class="code-block full">{{ formatJson(detail.llmRequestBody) }}</pre>
          </el-tab-pane>

          <!-- LLM 响应 -->
          <el-tab-pane name="response">
            <template #label><span class="text-12px">LLM 响应</span></template>
            <pre class="code-block full">{{ formatJson(detail.llmResponseBody) }}</pre>
          </el-tab-pane>

          <!-- 输出 -->
          <el-tab-pane name="output">
            <template #label><span class="text-12px">输出结果</span></template>
            <pre class="code-block full output-block">{{ detail.outputResult || '无' }}</pre>
          </el-tab-pane>

          <!-- 错误 -->
          <el-tab-pane v-if="detail.errorMessage" name="error">
            <template #label>
              <span class="text-12px text-[var(--el-color-danger)]">错误信息</span>
            </template>
            <pre class="code-block full error-block">{{ detail.errorMessage }}</pre>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-dialog>
  </el-drawer>
</template>

<script setup lang="ts">
import { ElMessageBox } from 'element-plus'
import { SkillAPI, type SkillDebugLog } from '@/api/ai/skill'

const visible = defineModel<boolean>('visible', { required: true })

const props = defineProps<{
  skillId: number
}>()

const loading = ref(false)
const logs = ref<SkillDebugLog[]>([])
const total = ref(0)
const queryParams = reactive({
  pageNum: 1,
  pageSize: 15,
  status: '' as string,
})

const logColumns = [
  { prop: 'createdAt', label: '时间', width: 160 },
  { prop: 'llmModel', label: '模型', width: 120 },
  { prop: 'tokensPrompt', label: 'Prompt Token', width: 110, align: 'center' as const },
  { prop: 'tokensCompletion', label: 'Completion Token', width: 130, align: 'center' as const },
  { prop: 'durationMs', label: '耗时', width: 90, align: 'center' as const },
  { prop: 'status', label: '状态', width: 80, align: 'center' as const },
]

function onOpened() {
  queryParams.pageNum = 1
  fetchLogs()
}

async function fetchLogs() {
  loading.value = true
  try {
    const res = await SkillAPI.getDebugLogs({
      ...queryParams,
      skillId: props.skillId,
      status: queryParams.status || undefined,
    })
    logs.value = res.list || []
    total.value = res.total || 0
  } finally {
    loading.value = false
  }
}

// ===== 详情 =====
const detailVisible = ref(false)
const detail = ref<SkillDebugLog | null>(null)
const detailTab = ref('params')

async function onRowClick(row: SkillDebugLog) {
  try {
    detail.value = await SkillAPI.getDebugLogDetail(row.id!)
    detailTab.value = 'params'
    detailVisible.value = true
  } catch {
    ElMessage.error('获取详情失败')
  }
}

async function handleDelete(row: SkillDebugLog) {
  await ElMessageBox.confirm('确认删除该调试日志？', '提示', { type: 'warning' })
  await SkillAPI.deleteDebugLog(row.id!)
  ElMessage.success('删除成功')
  await fetchLogs()
}

function formatDuration(ms?: number): string {
  if (!ms) return '0ms'
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(2)}s`
}

function formatJson(obj: any): string {
  if (!obj) return '无'
  try {
    return JSON.stringify(obj, null, 2)
  } catch {
    return String(obj)
  }
}
</script>

<style scoped>
.detail-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  padding: 12px 16px;
  background: var(--el-fill-color-lighter);
  border-radius: 8px;
}
.summary-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.summary-label {
  font-size: 11px;
  color: var(--el-text-color-secondary);
}
.summary-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.detail-tabs :deep(.el-tabs__header) {
  margin: 0;
}
.detail-tabs :deep(.el-tabs__nav-wrap::after) {
  height: 1px;
}

.prompt-compare {
  display: flex;
  gap: 12px;
  height: 320px;
}
.compare-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.compare-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.code-block {
  font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
  font-size: 12px;
  line-height: 1.6;
  background: var(--el-fill-color);
  border: 1px solid var(--el-border-color-extra-light);
  border-radius: 6px;
  padding: 10px 12px;
  margin: 0;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-all;
  flex: 1;
  color: var(--el-text-color-primary);
}
.code-block.full {
  height: 320px;
}
.output-block {
  background: var(--el-color-success-light-9);
  border-color: var(--el-color-success-light-5);
}
.error-block {
  background: var(--el-color-danger-light-9);
  border-color: var(--el-color-danger-light-5);
  color: var(--el-color-danger);
}

.tabular-nums {
  font-variant-numeric: tabular-nums;
}
</style>

<style lang="scss">
.debug-detail-dialog .el-dialog__body {
  padding: 16px 20px !important;
  max-height: 60vh;
  overflow-y: auto;
}
</style>
