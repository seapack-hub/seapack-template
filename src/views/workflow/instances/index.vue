<template>
  <div class="app-container w-100% h-100% flex flex-col">
    <el-card class="el-card-main flex-1 flex flex-col gap-10 overflow-hidden" shadow="never">
      <div class="search-bar h-50px flex items-center gap-10px">
        <el-input v-model="queryParams.keyword" placeholder="搜索工作流名称" clearable style="width: 200px" @keyup.enter="handleQuery" />
        <el-select v-model="queryParams.status" placeholder="状态" clearable style="width: 120px">
          <el-option v-for="s in statusOptions" :key="s.value" :label="s.label" :value="s.value" />
        </el-select>
        <el-select v-model="queryParams.workflowId" placeholder="工作流" clearable filterable style="width: 200px">
          <el-option v-for="wf in workflowList" :key="wf.id" :label="wf.name" :value="wf.id" />
        </el-select>
        <el-button type="primary" @click="handleQuery">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>

      <div class="flex-1 flex flex-col">
        <SpTable :columns="columns" :data="tableData" :show-index="false">
          <template #status="{ row }">
            <el-tag :type="statusTagType(row.status)" size="small">{{ statusLabel(row.status) }}</el-tag>
          </template>
          <template #triggerType="{ row }">
            <el-tag size="small" type="info">{{ triggerLabel(row.triggerType) }}</el-tag>
          </template>
          <template #progress="{ row }">
            <el-progress v-if="row.status === 1" :percentage="getProgress(row)" :stroke-width="6" />
            <span v-else class="text-12px text-gray-400">{{ row.completedCount || 0 }}/{{ row.totalNodes || 0 }}</span>
          </template>
          <template #duration="{ row }">
            <span class="text-12px">{{ formatDuration(row.durationMs) }}</span>
          </template>
          <template #operate="{ row }">
            <el-button type="primary" link @click="handleDetail(row)">详情</el-button>
            <el-button v-if="row.status === 1" type="warning" link @click="handlePause(row)">暂停</el-button>
            <el-button v-if="row.status === 4" type="success" link @click="handleResume(row)">恢复</el-button>
            <el-button v-if="row.status === 0 || row.status === 1" type="danger" link @click="handleCancel(row)">取消</el-button>
          </template>
        </SpTable>
        <Pagination v-model:total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="handleQuery" />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { WorkflowInstanceAPI } from '@/api/workflow/instance'
import { WorkflowAPI } from '@/api/workflow'
import type { WorkflowInstance } from '@/api/workflow/types'
import SpTable from '@/components/baseComponents/SpTable/index.vue'
import Pagination from '@/components/Pagination/index.vue'

const router = useRouter()
const loading = ref(false)
const tableData = ref<WorkflowInstance[]>([])
const total = ref(0)
const workflowList = ref<Array<{ id: number; name: string }>>([])

const statusOptions = [
  { label: '待执行', value: 0 },
  { label: '运行中', value: 1 },
  { label: '已完成', value: 2 },
  { label: '失败', value: 3 },
  { label: '暂停', value: 4 },
  { label: '已取消', value: 5 },
]

const statusMap: Record<number, { label: string; type: string }> = {
  0: { label: '待执行', type: 'info' },
  1: { label: '运行中', type: 'warning' },
  2: { label: '已完成', type: 'success' },
  3: { label: '失败', type: 'danger' },
  4: { label: '暂停', type: 'warning' },
  5: { label: '已取消', type: 'info' },
}

const triggerMap: Record<string, string> = {
  manual: '手动',
  api: 'API',
  schedule: '定时',
  event: '事件',
}

const statusLabel = (status?: number) => statusMap[status ?? 0]?.label || '未知'
const statusTagType = (status?: number) => statusMap[status ?? 0]?.type || 'info'
const triggerLabel = (type?: string) => triggerMap[type || 'manual'] || type

const queryParams = reactive({
  keyword: '',
  status: undefined as number | undefined,
  workflowId: undefined as number | undefined,
  pageNum: 1,
  pageSize: 20,
})

const columns = [
  { label: '工作流', prop: 'workflowName', minWidth: 150 },
  { label: '版本', prop: 'workflowVersion', width: 80, formatter: (row: WorkflowInstance) => `v${row.workflowVersion || 1}` },
  { label: '状态', columnType: 'status', width: 90 },
  { label: '触发方式', columnType: 'triggerType', width: 90 },
  { label: '进度', columnType: 'progress', width: 150 },
  { label: '耗时', columnType: 'duration', width: 100 },
  { label: '开始时间', prop: 'startedAt', width: 160 },
  { label: '操作', columnType: 'operate', width: 180, fixed: 'right' },
]

const getProgress = (row: WorkflowInstance) => {
  if (!row.totalNodes) return 0
  return Math.round(((row.completedCount || 0) / row.totalNodes) * 100)
}

const formatDuration = (ms?: number) => {
  if (!ms) return '-'
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  return `${(ms / 60000).toFixed(1)}min`
}

const handleQuery = async () => {
  loading.value = true
  try {
    const res = await WorkflowInstanceAPI.page(queryParams)
    tableData.value = res.records || []
    total.value = res.total || 0
  } finally {
    loading.value = false
  }
}

const handleReset = () => {
  queryParams.keyword = ''
  queryParams.status = undefined
  queryParams.workflowId = undefined
  queryParams.pageNum = 1
  handleQuery()
}

const handleDetail = (row: WorkflowInstance) => {
  router.push(`/workflow/instances/${row.id}`)
}

const handlePause = async (row: WorkflowInstance) => {
  await ElMessageBox.confirm('确定暂停该实例吗？', '提示', { type: 'warning' })
  await WorkflowInstanceAPI.pause(row.id!)
  ElMessage.success('已暂停')
  handleQuery()
}

const handleResume = async (row: WorkflowInstance) => {
  await WorkflowInstanceAPI.resume(row.id!)
  ElMessage.success('已恢复')
  handleQuery()
}

const handleCancel = async (row: WorkflowInstance) => {
  await ElMessageBox.confirm('确定取消该实例吗？', '提示', { type: 'warning' })
  await WorkflowInstanceAPI.cancel(row.id!)
  ElMessage.success('已取消')
  handleQuery()
}

const loadWorkflows = async () => {
  try {
    const res = await WorkflowAPI.list()
    workflowList.value = (res || []).map((w: any) => ({ id: w.id, name: w.name }))
  } catch {}
}

onMounted(() => {
  loadWorkflows()
  handleQuery()
})
</script>
