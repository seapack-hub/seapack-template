<template>
  <div class="app-container w-100% h-100% flex flex-col">
    <el-card class="el-card-main flex-1 flex flex-col gap-10 overflow-hidden" shadow="never">
      <div class="search-bar h-50px flex items-center gap-10px">
        <el-input v-model="queryParams.keyword" placeholder="搜索调度名称" clearable style="width: 200px" @keyup.enter="handleQuery" />
        <el-select v-model="queryParams.status" placeholder="状态" clearable style="width: 120px">
          <el-option label="启用" :value="1" />
          <el-option label="禁用" :value="0" />
        </el-select>
        <el-button type="primary" @click="handleQuery">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>

      <div class="h-40px flex justify-between items-center">
        <el-button type="primary" @click="handleAdd"><el-icon><Plus /></el-icon>新建调度</el-button>
      </div>

      <div class="flex-1 flex flex-col">
        <SpTable :columns="columns" :data="tableData" :show-index="false">
          <template #status="{ row }">
            <el-switch v-model="row.status" :active-value="1" :inactive-value="0" @change="handleStatusChange(row)" />
          </template>
          <template #scheduleType="{ row }">
            <el-tag size="small">{{ scheduleTypeLabel(row.scheduleType) }}</el-tag>
          </template>
          <template #operate="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="success" link @click="handleTrigger(row)">立即执行</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </SpTable>
        <Pagination v-model:total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="handleQuery" />
      </div>
    </el-card>

    <!-- 新建/编辑对话框 -->
    <el-dialog v-model="formVisible" :title="formIsEdit ? '编辑调度' : '新建调度'" width="600px">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="调度名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入调度名称" />
        </el-form-item>
        <el-form-item label="关联工作流" prop="workflowId">
          <el-select v-model="formData.workflowId" placeholder="选择工作流" filterable style="width: 100%">
            <el-option v-for="wf in workflowList" :key="wf.id" :label="wf.name" :value="wf.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="调度类型" prop="scheduleType">
          <el-select v-model="formData.scheduleType" style="width: 100%">
            <el-option label="Cron表达式" value="cron" />
            <el-option label="固定间隔" value="interval" />
            <el-option label="单次执行" value="once" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="formData.scheduleType === 'cron'" label="Cron表达式" prop="cronExpression">
          <el-input v-model="formData.cronExpression" placeholder="例: 0 0/30 * * * ?" />
        </el-form-item>
        <el-form-item v-if="formData.scheduleType === 'interval'" label="间隔(秒)" prop="intervalSeconds">
          <el-input-number v-model="formData.intervalSeconds" :min="60" :max="86400" controls-position="right" />
        </el-form-item>
        <el-form-item v-if="formData.scheduleType === 'once'" label="执行时间" prop="scheduledTime">
          <el-date-picker v-model="formData.scheduledTime" type="datetime" placeholder="选择执行时间" style="width: 100%" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="formData.description" type="textarea" :rows="2" placeholder="调度描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="formVisible = false">取消</el-button>
        <el-button type="primary" @click="handleFormConfirm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { ScheduleAPI } from '@/api/workflow/schedule'
import { WorkflowAPI } from '@/api/workflow'
import type { WorkflowSchedule } from '@/api/workflow/types'
import SpTable from '@/components/baseComponents/SpTable/index.vue'
import Pagination from '@/components/Pagination/index.vue'

const loading = ref(false)
const tableData = ref<WorkflowSchedule[]>([])
const total = ref(0)
const formVisible = ref(false)
const formIsEdit = ref(false)
const formRef = ref()
const workflowList = ref<Array<{ id: number; name: string }>>([])

const queryParams = reactive({
  keyword: '',
  status: undefined as number | undefined,
  pageNum: 1,
  pageSize: 20,
})

const formData = reactive<Partial<WorkflowSchedule>>({
  name: '',
  workflowId: undefined,
  scheduleType: 'cron',
  cronExpression: '',
  intervalSeconds: 300,
  scheduledTime: '',
  description: '',
})

const formRules = {
  name: [{ required: true, message: '请输入调度名称', trigger: 'blur' }],
  workflowId: [{ required: true, message: '请选择工作流', trigger: 'change' }],
  scheduleType: [{ required: true, message: '请选择调度类型', trigger: 'change' }],
}

const scheduleTypeMap: Record<string, string> = { cron: 'Cron', interval: '固定间隔', once: '单次' }
const scheduleTypeLabel = (t?: string) => scheduleTypeMap[t || 'cron'] || t

const columns = [
  { label: '调度名称', prop: 'name', minWidth: 150 },
  { label: '工作流', prop: 'workflowName', minWidth: 150 },
  { label: '类型', columnType: 'scheduleType', width: 100 },
  { label: '表达式', prop: 'cronExpression', minWidth: 150, formatter: (row: WorkflowSchedule) => row.scheduleType === 'cron' ? row.cronExpression : row.scheduleType === 'interval' ? `${row.intervalSeconds}秒` : row.scheduledTime || '-' },
  { label: '上次执行', prop: 'lastRunAt', width: 160 },
  { label: '下次执行', prop: 'nextRunAt', width: 160 },
  { label: '执行次数', prop: 'runCount', width: 90 },
  { label: '状态', columnType: 'status', width: 80 },
  { label: '操作', columnType: 'operate', width: 180, fixed: 'right' },
]

const handleQuery = async () => {
  loading.value = true
  try {
    const res = await ScheduleAPI.page(queryParams)
    tableData.value = res.records || []
    total.value = res.total || 0
  } finally {
    loading.value = false
  }
}

const handleReset = () => {
  queryParams.keyword = ''
  queryParams.status = undefined
  queryParams.pageNum = 1
  handleQuery()
}

const handleAdd = () => {
  formIsEdit.value = false
  Object.assign(formData, { name: '', workflowId: undefined, scheduleType: 'cron', cronExpression: '', intervalSeconds: 300, scheduledTime: '', description: '' })
  formVisible.value = true
}

const handleEdit = (row: WorkflowSchedule) => {
  formIsEdit.value = true
  Object.assign(formData, row)
  formVisible.value = true
}

const handleDelete = async (row: WorkflowSchedule) => {
  await ElMessageBox.confirm(`确定删除调度「${row.name}」吗？`, '提示', { type: 'warning' })
  await ScheduleAPI.delete(row.id!)
  ElMessage.success('删除成功')
  handleQuery()
}

const handleStatusChange = async (row: WorkflowSchedule) => {
  await ScheduleAPI.updateStatus(row.id!, row.status!)
  ElMessage.success('状态已更新')
}

const handleTrigger = async (row: WorkflowSchedule) => {
  await ElMessageBox.confirm(`确定立即执行「${row.name}」吗？`, '提示', { type: 'warning' })
  await ScheduleAPI.trigger(row.id!)
  ElMessage.success('已触发执行')
}

const handleFormConfirm = async () => {
  await formRef.value?.validate()
  if (formIsEdit.value) {
    await ScheduleAPI.update(formData.id!, formData)
    ElMessage.success('更新成功')
  } else {
    await ScheduleAPI.insert(formData)
    ElMessage.success('创建成功')
  }
  formVisible.value = false
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
