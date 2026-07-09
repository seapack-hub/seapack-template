/**
 * useWorkflowSchedule — 工作流调度管理 composable
 */
import { ScheduleAPI } from '@/api/workflow/schedule'
import { WorkflowAPI } from '@/api/workflow'
import type { WorkflowSchedule } from '@/api/workflow/types'
import { DEFAULT_SCHEDULE_FORM, SCHEDULE_TYPE_MAP } from './moduleOptions'

export function useWorkflowSchedule() {
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

  const formData = ref<Partial<WorkflowSchedule>>({ ...DEFAULT_SCHEDULE_FORM })

  const scheduleTypeLabel = (t?: string) => SCHEDULE_TYPE_MAP[t || 'cron'] || t

  async function handleQuery() {
    loading.value = true
    try {
      const res = await ScheduleAPI.page(queryParams)
      tableData.value = res.list || []
      total.value = res.total || 0
    } finally {
      loading.value = false
    }
  }

  function handleReset() {
    queryParams.keyword = ''
    queryParams.status = undefined
    queryParams.pageNum = 1
    handleQuery()
  }

  function openAddDialog() {
    formData.value = { ...DEFAULT_SCHEDULE_FORM }
    formIsEdit.value = false
    formVisible.value = true
  }

  function openEditDialog(row: WorkflowSchedule) {
    formData.value = { ...row }
    formIsEdit.value = true
    formVisible.value = true
  }

  async function onFormConfirm() {
    if (formIsEdit.value) {
      await ScheduleAPI.update(formData.value.id!, formData.value)
      ElMessage.success('更新成功')
    } else {
      await ScheduleAPI.insert(formData.value)
      ElMessage.success('创建成功')
    }
    formVisible.value = false
    handleQuery()
  }

  async function handleDelete(row: WorkflowSchedule) {
    await ElMessageBox.confirm(`确定删除调度「${row.name}」吗？`, '提示', { type: 'warning' })
    await ScheduleAPI.delete(row.id!)
    ElMessage.success('删除成功')
    handleQuery()
  }

  async function handleStatusChange(row: WorkflowSchedule) {
    await ScheduleAPI.updateStatus(row.id!, row.status!)
    ElMessage.success('状态已更新')
  }

  async function handleTrigger(row: WorkflowSchedule) {
    await ElMessageBox.confirm(`确定立即执行「${row.name}」吗？`, '提示', { type: 'warning' })
    await ScheduleAPI.trigger(row.id!)
    ElMessage.success('已触发执行')
  }

  async function loadWorkflows() {
    try {
      const res = await WorkflowAPI.list()
      workflowList.value = (res || []).map((w: any) => ({ id: w.id, name: w.name }))
    } catch { /* ignored */ }
  }

  return {
    loading,
    tableData,
    total,
    queryParams,
    formVisible,
    formIsEdit,
    formRef,
    formData,
    workflowList,
    scheduleTypeLabel,
    handleQuery,
    handleReset,
    openAddDialog,
    openEditDialog,
    onFormConfirm,
    handleDelete,
    handleStatusChange,
    handleTrigger,
    loadWorkflows,
  }
}
