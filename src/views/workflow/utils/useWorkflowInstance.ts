/**
 * useWorkflowInstance — 工作流实例管理 composable
 */
import { WorkflowInstanceAPI } from '@/api/workflow/instance'
import { WorkflowAPI } from '@/api/workflow'
import type { WorkflowInstance } from '@/api/workflow/types'
import { useDictionaryStore } from '@/store/modules/dictionary'

export function useWorkflowInstance() {
  const router = useRouter()
  const loading = ref(false)
  const tableData = ref<WorkflowInstance[]>([])
  const total = ref(0)
  const workflowList = ref<Array<{ id: number; name: string }>>([])

  const dictStore = useDictionaryStore()

  // 实例状态选项（用于筛选，由字典动态加载）
  const statusOptions = ref<Array<{ label: string; value: number }>>([])
  // 实例状态标签映射（由字典动态加载）
  const statusLabelMap = ref<Record<number, string>>({})
  // 触发方式标签映射（由字典动态加载）
  const triggerLabelMap = ref<Record<string, string>>({})

  // 实例状态标签类型（UI 视觉色，不来自字典）
  const statusTagTypeMap: Record<number, string> = {
    0: 'info',
    1: 'warning',
    2: 'success',
    3: 'danger',
    4: 'warning',
    5: 'info',
  }

  const statusLabel = (status?: number) => statusLabelMap.value[status ?? 0] || '未知'
  const statusTagType = (status?: number) => (statusTagTypeMap[status ?? 0] || 'info') as 'info' | 'warning' | 'success' | 'danger'
  const triggerLabel = (type?: string) => triggerLabelMap.value[type || 'manual'] || type || ''

  const queryParams = reactive({
    keyword: '',
    status: undefined as number | undefined,
    workflowId: undefined as number | undefined,
    pageNum: 1,
    pageSize: 20,
  })

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

  async function handleQuery() {
    loading.value = true
    try {
      const res = await WorkflowInstanceAPI.page(queryParams)
      tableData.value = res.list || []
      total.value = res.total || 0
    } finally {
      loading.value = false
    }
  }

  function handleReset() {
    queryParams.keyword = ''
    queryParams.status = undefined
    queryParams.workflowId = undefined
    queryParams.pageNum = 1
    handleQuery()
  }

  function handleDetail(row: WorkflowInstance) {
    router.push(`/workflow/instances/${row.id}`)
  }

  async function handlePause(row: WorkflowInstance) {
    await ElMessageBox.confirm('确定暂停该实例吗？', '提示', { type: 'warning' })
    await WorkflowInstanceAPI.pause(row.id!)
    ElMessage.success('已暂停')
    handleQuery()
  }

  async function handleResume(row: WorkflowInstance) {
    await WorkflowInstanceAPI.resume(row.id!)
    ElMessage.success('已恢复')
    handleQuery()
  }

  async function handleCancel(row: WorkflowInstance) {
    await ElMessageBox.confirm('确定取消该实例吗？', '提示', { type: 'warning' })
    await WorkflowInstanceAPI.cancel(row.id!)
    ElMessage.success('已取消')
    handleQuery()
  }

  async function loadWorkflows() {
    try {
      const res = await WorkflowAPI.list()
      workflowList.value = (res || []).map((w: any) => ({ id: w.id, name: w.name }))
    } catch { /* ignored */ }
  }

  async function loadDictData() {
    const [statusList, triggerList] = await Promise.all([
      dictStore.getDictionaryList('workflow_instance_status'),
      dictStore.getDictionaryList('workflow_trigger_type'),
    ])
    statusOptions.value = statusList.map((item: any) => ({ label: item.label, value: Number(item.value) }))
    statusLabelMap.value = Object.fromEntries(statusList.map((item: any) => [Number(item.value), item.label]))
    triggerLabelMap.value = Object.fromEntries(triggerList.map((item: any) => [item.value, item.label]))
  }

  return {
    loading,
    tableData,
    total,
    workflowList,
    queryParams,
    statusOptions,
    statusLabel,
    statusTagType,
    triggerLabel,
    getProgress,
    formatDuration,
    handleQuery,
    handleReset,
    handleDetail,
    handlePause,
    handleResume,
    handleCancel,
    loadWorkflows,
    loadDictData,
  }
}
