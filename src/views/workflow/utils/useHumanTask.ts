/**
 * useHumanTask — 人工任务管理 composable
 */
import { HumanTaskAPI } from '@/api/workflow/humanTask'
import type { HumanTask } from '@/api/workflow/types'
import { useDictionaryStore } from '@/store/modules/dictionary'

export function useHumanTask() {
  const loading = ref(false)
  const tableData = ref<HumanTask[]>([])
  const total = ref(0)
  const processVisible = ref(false)
  const currentTask = ref<HumanTask | null>(null)

  const dictStore = useDictionaryStore()

  // 任务类型选项（用于筛选，由字典动态加载）
  const taskTypeOptions = ref<Array<{ label: string; value: string }>>([])
  // 任务状态选项（用于筛选，由字典动态加载）
  const statusOptions = ref<Array<{ label: string; value: number }>>([])
  // 任务类型标签映射（由字典动态加载）
  const taskTypeLabelMap = ref<Record<string, string>>({})
  // 任务状态标签映射（由字典动态加载）
  const statusLabelMap = ref<Record<number, string>>({})

  // 任务状态标签类型（UI 视觉色，不来自字典）
  const statusTagTypeMap: Record<number, string> = {
    0: 'warning',
    1: 'warning',
    2: 'success',
    3: 'danger',
    4: 'warning',
    5: 'info',
  }
  // 任务类型标签类型（UI 视觉色）
  const taskTypeTagTypeMap: Record<string, string> = {
    approval: 'danger',
    review: 'warning',
    annotation: 'success',
    feedback: 'info',
    input: 'info',
  }

  const statusLabel = (s?: number) => statusLabelMap.value[s ?? 0] || '未知'
  const statusTagType = (s?: number) => (statusTagTypeMap[s ?? 0] || 'info') as 'info' | 'warning' | 'success' | 'danger'
  const taskTypeLabel = (t?: string) => taskTypeLabelMap.value[t || 'approval'] || t
  const taskTypeTagType = (t?: string) => (taskTypeTagTypeMap[t || 'approval'] || 'info') as 'info' | 'warning' | 'success' | 'danger'

  const queryParams = reactive({
    keyword: '',
    taskType: undefined as string | undefined,
    status: undefined as number | undefined,
    pageNum: 1,
    pageSize: 20,
  })

  async function handleQuery() {
    loading.value = true
    try {
      const res = await HumanTaskAPI.page(queryParams)
      tableData.value = res.list || []
      total.value = res.total || 0
    } finally {
      loading.value = false
    }
  }

  function handleReset() {
    queryParams.keyword = ''
    queryParams.taskType = undefined
    queryParams.status = undefined
    queryParams.pageNum = 1
    handleQuery()
  }

  function handleProcess(row: HumanTask) {
    currentTask.value = row
    processVisible.value = true
  }

  function handleView(row: HumanTask) {
    currentTask.value = row
    processVisible.value = true
  }

  async function loadDictData() {
    taskTypeOptions.value = await dictStore.getDictOptions('human_task_type')

    const [statusList, typeList] = await Promise.all([
      dictStore.getDictionaryList('human_task_status'),
      dictStore.getDictionaryList('human_task_type'),
    ])
    statusOptions.value = statusList.map((item: any) => ({ label: item.label, value: Number(item.value) }))
    statusLabelMap.value = Object.fromEntries(statusList.map((item: any) => [Number(item.value), item.label]))
    taskTypeLabelMap.value = Object.fromEntries(typeList.map((item: any) => [item.value, item.label]))
  }

  return {
    loading,
    tableData,
    total,
    queryParams,
    processVisible,
    currentTask,
    taskTypeOptions,
    statusOptions,
    statusLabel,
    statusTagType,
    taskTypeLabel,
    taskTypeTagType,
    handleQuery,
    handleReset,
    handleProcess,
    handleView,
    loadDictData,
  }
}
