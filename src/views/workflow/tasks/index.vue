<template>
  <div class="app-container w-100% h-100% flex flex-col">
    <el-card class="el-card-main flex-1 flex flex-col gap-10 overflow-hidden" shadow="never">
      <div class="search-bar h-50px flex items-center gap-10px">
        <el-input v-model="queryParams.keyword" placeholder="搜索任务标题" clearable style="width: 200px" @keyup.enter="handleQuery" />
        <el-select v-model="queryParams.taskType" placeholder="任务类型" clearable style="width: 140px">
          <el-option label="审批" value="approval" />
          <el-option label="审核" value="review" />
          <el-option label="标注" value="annotation" />
          <el-option label="反馈" value="feedback" />
          <el-option label="输入" value="input" />
        </el-select>
        <el-select v-model="queryParams.status" placeholder="状态" clearable style="width: 120px">
          <el-option v-for="s in statusOptions" :key="s.value" :label="s.label" :value="s.value" />
        </el-select>
        <el-button type="primary" @click="handleQuery">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>

      <div class="flex-1 flex flex-col">
        <SpTable :columns="columns" :data="tableData" :show-index="false">
          <template #taskType="{ row }">
            <el-tag size="small" :type="taskTypeTagType(row.taskType)">{{ taskTypeLabel(row.taskType) }}</el-tag>
          </template>
          <template #status="{ row }">
            <el-tag :type="statusTagType(row.status)" size="small">{{ statusLabel(row.status) }}</el-tag>
          </template>
          <template #operate="{ row }">
            <el-button v-if="row.status === 0 || row.status === 1" type="primary" link @click="handleProcess(row)">处理</el-button>
            <el-button type="info" link @click="handleView(row)">查看</el-button>
          </template>
        </SpTable>
        <Pagination v-model:total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="handleQuery" />
      </div>
    </el-card>

    <!-- 处理对话框 -->
    <el-dialog v-model="processVisible" title="处理任务" width="600px">
      <div v-if="currentTask" class="mb-16px">
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="任务标题">{{ currentTask.title }}</el-descriptions-item>
          <el-descriptions-item label="任务类型">{{ taskTypeLabel(currentTask.taskType) }}</el-descriptions-item>
          <el-descriptions-item label="工作流" :span="2">{{ currentTask.workflowName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="描述" :span="2">{{ currentTask.description || '无' }}</el-descriptions-item>
        </el-descriptions>
      </div>
      <el-form :model="processForm" label-width="80px">
        <el-form-item label="审核意见">
          <el-radio-group v-model="processForm.action">
            <el-radio value="approve">通过</el-radio>
            <el-radio value="reject">驳回</el-radio>
            <el-radio value="return">退回</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="processForm.comment" type="textarea" :rows="3" placeholder="请输入审核意见" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="processVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitProcess">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { HumanTaskAPI } from '@/api/workflow/humanTask'
import type { HumanTask } from '@/api/workflow/types'
import SpTable from '@/components/baseComponents/SpTable/index.vue'
import Pagination from '@/components/Pagination/index.vue'

const loading = ref(false)
const tableData = ref<HumanTask[]>([])
const total = ref(0)
const processVisible = ref(false)
const currentTask = ref<HumanTask | null>(null)

const statusOptions = [
  { label: '待处理', value: 0 },
  { label: '处理中', value: 1 },
  { label: '已通过', value: 2 },
  { label: '已驳回', value: 3 },
  { label: '已升级', value: 4 },
  { label: '已过期', value: 5 },
]

const statusMap: Record<number, { label: string; type: string }> = {
  0: { label: '待处理', type: 'warning' },
  1: { label: '处理中', type: 'warning' },
  2: { label: '已通过', type: 'success' },
  3: { label: '已驳回', type: 'danger' },
  4: { label: '已升级', type: 'warning' },
  5: { label: '已过期', type: 'info' },
}

const taskTypeMap: Record<string, { label: string; type: string }> = {
  approval: { label: '审批', type: 'danger' },
  review: { label: '审核', type: 'warning' },
  annotation: { label: '标注', type: 'success' },
  feedback: { label: '反馈', type: 'info' },
  input: { label: '输入', type: 'info' },
}

const statusLabel = (s?: number) => statusMap[s ?? 0]?.label || '未知'
const statusTagType = (s?: number) => statusMap[s ?? 0]?.type || 'info'
const taskTypeLabel = (t?: string) => taskTypeMap[t || 'approval']?.label || t
const taskTypeTagType = (t?: string) => taskTypeMap[t || 'approval']?.type || 'info'

const queryParams = reactive({
  keyword: '',
  taskType: undefined as string | undefined,
  status: undefined as number | undefined,
  pageNum: 1,
  pageSize: 20,
})

const processForm = reactive({
  action: 'approve' as string,
  comment: '',
})

const columns = [
  { label: '标题', prop: 'title', minWidth: 200 },
  { label: '任务类型', columnType: 'taskType', width: 100 },
  { label: '工作流', prop: 'workflowName', minWidth: 150 },
  { label: '状态', columnType: 'status', width: 100 },
  { label: '截止时间', prop: 'dueAt', width: 160 },
  { label: '创建时间', prop: 'createdAt', width: 160 },
  { label: '操作', columnType: 'operate', width: 140, fixed: 'right' },
]

const handleQuery = async () => {
  loading.value = true
  try {
    const res = await HumanTaskAPI.page(queryParams)
    tableData.value = res.records || []
    total.value = res.total || 0
  } finally {
    loading.value = false
  }
}

const handleReset = () => {
  queryParams.keyword = ''
  queryParams.taskType = undefined
  queryParams.status = undefined
  queryParams.pageNum = 1
  handleQuery()
}

const handleProcess = (row: HumanTask) => {
  currentTask.value = row
  processForm.action = 'approve'
  processForm.comment = ''
  processVisible.value = true
}

const handleView = (row: HumanTask) => {
  currentTask.value = row
  processVisible.value = true
}

const handleSubmitProcess = async () => {
  if (!currentTask.value) return
  await HumanTaskAPI.handle(currentTask.value.id!, {
    action: processForm.action,
    comment: processForm.comment,
  })
  ElMessage.success('处理成功')
  processVisible.value = false
  handleQuery()
}

onMounted(() => {
  handleQuery()
})
</script>
