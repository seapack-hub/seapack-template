/**
 * useWorkflow — 工作流定义管理 composable
 */
import { WorkflowAPI } from '@/api/workflow'
import type { WorkflowDefinition, WorkflowQuery } from '@/api/workflow/types'
import { DEFAULT_WORKFLOW_FORM } from './moduleOptions'

export function useWorkflow() {
  const router = useRouter()

  // ===== 查询状态 =====
  const queryParams = reactive<WorkflowQuery>({
    keyword: '',
    status: undefined,
    categoryId: undefined,
    pageNum: 1,
    pageSize: 12,
  })
  const tableData = ref<WorkflowDefinition[]>([])
  const total = ref(0)
  const loading = ref(false)

  async function handleQuery() {
    loading.value = true
    try {
      const res = await WorkflowAPI.page(queryParams)
      tableData.value = res.list || []
      total.value = res.total || 0
    } finally {
      loading.value = false
    }
  }

  function handleReset() {
    queryParams.keyword = ''
    queryParams.status = undefined
    queryParams.categoryId = undefined
    queryParams.pageNum = 1
    handleQuery()
  }

  // ===== 表单弹窗 =====
  const formVisible = ref(false)
  const formIsEdit = ref(false)
  const formData = ref<Partial<WorkflowDefinition>>({ ...DEFAULT_WORKFLOW_FORM })

  function openAddDialog() {
    formData.value = { ...DEFAULT_WORKFLOW_FORM }
    formIsEdit.value = false
    formVisible.value = true
  }

  function openEditDialog(row: WorkflowDefinition) {
    formData.value = { ...row }
    formIsEdit.value = true
    formVisible.value = true
  }

  async function onFormConfirm() {
    if (formIsEdit.value) {
      await WorkflowAPI.update(formData.value.id!, formData.value)
      ElMessage.success('更新成功')
    } else {
      await WorkflowAPI.insert(formData.value)
      ElMessage.success('创建成功')
    }
    formVisible.value = false
    handleQuery()
  }

  // ===== 编辑（跳转画布） =====
  function handleEdit(row: WorkflowDefinition) {
    router.push(`/workflow/editor/${row.id}`)
  }

  // ===== 复制 =====
  async function handleCopy(row: WorkflowDefinition) {
    await WorkflowAPI.copy(row.id!)
    ElMessage.success('复制成功')
    handleQuery()
  }

  // ===== 删除 =====
  async function handleDelete(row: WorkflowDefinition) {
    await WorkflowAPI.delete(row.id!)
    ElMessage.success('删除成功')
    handleQuery()
  }

  // ===== 卡片模式下拉菜单 =====
  function handleCommand(cmd: string, row: WorkflowDefinition) {
    switch (cmd) {
      case 'edit': handleEdit(row); break
      case 'copy': handleCopy(row); break
      case 'delete': handleDelete(row); break
    }
  }

  return {
    queryParams,
    tableData,
    total,
    loading,
    handleQuery,
    handleReset,
    formVisible,
    formIsEdit,
    formData,
    openAddDialog,
    openEditDialog,
    onFormConfirm,
    handleEdit,
    handleCopy,
    handleDelete,
    handleCommand,
  }
}
