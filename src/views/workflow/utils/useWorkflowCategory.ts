/**
 * useWorkflowCategory — 工作流分类管理 composable
 */
import { WorkflowCategoryAPI } from '@/api/workflow'
import type { WorkflowCategory } from '@/api/workflow/types'

export function useWorkflowCategory() {
  const loading = ref(false)
  const tableData = ref<WorkflowCategory[]>([])
  const total = ref(0)
  const categoryTree = ref<WorkflowCategory[]>([])

  // 表单状态
  const formVisible = ref(false)
  const formIsEdit = ref(false)
  const formData = ref<Partial<WorkflowCategory>>({})

  const queryParams = reactive({
    keyword: '',
    status: undefined as number | undefined,
    pageNum: 1,
    pageSize: 20,
  })

  async function handleQuery() {
    loading.value = true
    try {
      const res = await WorkflowCategoryAPI.list()
      let list = res || []

      if (queryParams.keyword) {
        const kw = queryParams.keyword.toLowerCase()
        list = list.filter((item: WorkflowCategory) => item.name.toLowerCase().includes(kw))
      }
      if (queryParams.status !== undefined) {
        list = list.filter((item: WorkflowCategory) => item.status === queryParams.status)
      }

      tableData.value = list
      total.value = list.length
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

  async function loadCategoryTree() {
    try {
      categoryTree.value = await WorkflowCategoryAPI.tree()
    } catch {}
  }

  function handleAdd() {
    formIsEdit.value = false
    formData.value = { name: '', parentId: undefined, sortOrder: 0, status: 1 }
    formVisible.value = true
  }

  function handleEdit(row: WorkflowCategory) {
    formIsEdit.value = true
    formData.value = { ...row }
    formVisible.value = true
  }

  async function handleStatusChange(row: WorkflowCategory) {
    try {
      await WorkflowCategoryAPI.updateStatus(row.id!, row.status!)
    } catch {
      row.status = row.status === 1 ? 0 : 1
    }
  }

  async function handleDelete(row: WorkflowCategory) {
    await ElMessageBox.confirm(
      `确定删除分类「${row.name}」吗？删除后分类下的工作流将变为未分类。`,
      '提示',
      { type: 'warning' },
    )
    await WorkflowCategoryAPI.delete(row.id!)
    ElMessage.success('删除成功')
    handleQuery()
  }

  async function onFormConfirm() {
    if (formIsEdit.value) {
      await WorkflowCategoryAPI.update(formData.value.id!, formData.value)
      ElMessage.success('更新成功')
    } else {
      await WorkflowCategoryAPI.insert(formData.value)
      ElMessage.success('创建成功')
    }
    formVisible.value = false
    handleQuery()
  }

  return {
    loading,
    tableData,
    total,
    queryParams,
    categoryTree,
    formVisible,
    formIsEdit,
    formData,
    handleQuery,
    handleReset,
    loadCategoryTree,
    handleAdd,
    handleEdit,
    handleStatusChange,
    handleDelete,
    onFormConfirm,
  }
}
