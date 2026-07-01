<!--
  执行日志弹窗
  分页展示技能执行日志列表，支持按状态筛选
  行点击打开详情抽屉（基本信息、错误信息、输入参数、输出结果）
-->
<template>
  <el-dialog v-model="visible" title="执行日志" width="1000px" @closed="onClosed">
    <!-- 搜索栏 -->
    <div class="search-bar mb-10">
      <el-form :inline="true" :model="queryParams" size="small">
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="全部" clearable style="width: 110px">
            <el-option label="全部" value="" />
            <el-option label="成功" value="success" />
            <el-option label="失败" value="fail" />
            <el-option label="超时" value="timeout" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="search" @click="handleQuery">搜索</el-button>
          <el-button icon="refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <!-- 日志列表（使用 SpTable 封装组件） -->
    <SpTable
      :loading="false"
      :data="logs"
      :columns="columns"
      show-index
      height="400"
      size="small"
      @row-click="onRowClick"
    >
      <!-- 状态列：成功/失败/超时标签着色 -->
      <template #logStatus>
        <el-table-column label="状态" prop="status" width="70" align="center" slot-name="logStatus">
          <template #default="{ row }">
            <el-tag :type="row.status === 'success' ? 'success' : row.status === 'fail' ? 'danger' : 'warning'" size="small">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
      </template>
      <!-- Token 消耗列 -->
      <template #tokenCost>
        <el-table-column label="Token 消耗" width="130" align="center" slot-name="tokenCost">
          <template #default="{ row }">
            <span class="text-12px text-[var(--el-text-color-secondary)]">
              P:{{ row.tokensPrompt || '-' }} / C:{{ row.tokensCompletion || '-' }}
            </span>
          </template>
        </el-table-column>
      </template>
      <!-- 耗时列 -->
      <template #duration>
        <el-table-column prop="durationMs" label="耗时" width="80" align="center" slot-name="duration">
          <template #default="{ row }">
            {{ row.durationMs ? `${row.durationMs}ms` : '-' }}
          </template>
        </el-table-column>
      </template>
    </SpTable>
    <div class="mt-10">
      <Pagination v-model:total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="handleQuery" />
    </div>

    <!-- 日志详情抽屉 -->
    <el-drawer
      v-model="detailVisible"
      title="日志详情"
      size="500px"
      append-to-body
    >
      <template v-if="detail">
        <div class="detail-section mb-16">
          <div class="text-13px font-semibold mb-6 text-[var(--el-text-color-secondary)]">基本信息</div>
          <el-descriptions :column="1" border size="small">
            <el-descriptions-item label="技能编码">{{ detail.skillCode }}</el-descriptions-item>
            <el-descriptions-item label="来源模块">{{ detail.moduleKey || '-' }}</el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="detail.status === 'success' ? 'success' : 'danger'" size="small">{{ detail.status }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="Token">
              P:{{ detail.tokensPrompt || '-' }} / C:{{ detail.tokensCompletion || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="耗时">{{ detail.durationMs ? `${detail.durationMs}ms` : '-' }}</el-descriptions-item>
            <el-descriptions-item label="执行时间">{{ detail.createdAt }}</el-descriptions-item>
          </el-descriptions>
        </div>
        <div v-if="detail.errorMessage" class="detail-section mb-16">
          <div class="text-13px font-semibold mb-6 text-[var(--el-text-color-secondary)]">错误信息</div>
          <el-alert :title="detail.errorMessage" type="error" show-icon :closable="false" />
        </div>
        <div class="detail-section mb-16">
          <div class="text-13px font-semibold mb-6 text-[var(--el-text-color-secondary)]">输入参数</div>
          <pre class="json-view">{{ formatJSON(detail.inputParams) }}</pre>
        </div>
        <div class="detail-section">
          <div class="text-13px font-semibold mb-6 text-[var(--el-text-color-secondary)]">输出结果</div>
          <pre class="json-view">{{ detail.outputResult }}</pre>
        </div>
      </template>
    </el-drawer>
  </el-dialog>
</template>

<script setup lang="ts">
import { SkillExecutionAPI, type SkillExecutionLog, type ExecutionLogQuery } from '@/api/ai/skillExecution';
import { LOG_LIST_COLUMNS } from '../utils';

const visible = defineModel<boolean>('visible', { required: true })
const props = defineProps<{ skillId?: number }>()

const queryParams = reactive<ExecutionLogQuery>({ pageNum: 1, pageSize: 10, status: '' })
const logs = ref<SkillExecutionLog[]>([])
const total = ref(0)

/** SpTable 列配置 */
const columns = LOG_LIST_COLUMNS

watch(visible, async (val) => {
  if (val) {
    if (props.skillId) queryParams.skillId = props.skillId
    await handleQuery()
  }
})

async function handleQuery() {
  const res = await SkillExecutionAPI.page(queryParams)
  logs.value = res.list || []
  total.value = res.total || 0
}

function handleReset() {
  queryParams.pageNum = 1
  queryParams.status = ''
  handleQuery()
}

function onClosed() {
  logs.value = []
  total.value = 0
}

// ===== 日志详情 =====
const detailVisible = ref(false)
const detail = ref<SkillExecutionLog | null>(null)

async function onRowClick(row: SkillExecutionLog) {
  detail.value = null
  detailVisible.value = true
  try {
    const res = await SkillExecutionAPI.getById(row.id)
    detail.value = res
  } catch {
    // fallback: 使用行数据
    detail.value = row
  }
}

function formatJSON(obj: any): string {
  try {
    return JSON.stringify(obj, null, 2)
  } catch {
    return String(obj || '')
  }
}
</script>

<style scoped lang="scss">
.json-view {
  background: #f5f7fa;
  border-radius: 4px;
  padding: 12px;
  font-size: 12px;
  font-family: 'Courier New', monospace;
  line-height: 1.6;
  max-height: 300px;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
