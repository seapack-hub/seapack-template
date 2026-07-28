/**
 * usePosition — 位置管理 composable
 *
 * 封装位置列表的分页查询、CRUD 操作、状态切换等业务逻辑，
 * 供 index.vue 消费。
 */
import { PositionAPI, type AiPosition, type AiPositionQuery } from '@/api/ai/position'
import { useAiPositionsStore } from '@/store/modules/aiPositions'

export function usePosition() {
  const positionsStore = useAiPositionsStore()

  // ===== 查询状态 =====
  const queryParams = reactive<AiPositionQuery>({
    pageNum: 1,
    pageSize: 10,
  })
  const tableData = ref<AiPosition[]>([])
  const total = ref(0)
  const loading = ref(false)

  /** 分页查询位置列表 */
  async function handleQuery() {
    loading.value = true
    try {
      const res = await PositionAPI.page(queryParams)
      tableData.value = res.list || []
      total.value = res.total || 0
    } finally {
      loading.value = false
    }
  }

  /** 重置搜索条件并重新查询 */
  function handleReset() {
    queryParams.moduleKey = ''
    queryParams.keyword = ''
    queryParams.status = undefined
    queryParams.pageNum = 1
    handleQuery()
  }

  // ===== 表单弹窗 =====
  const formVisible = ref(false)
  const formIsEdit = ref(false)
  const formData = ref<Partial<AiPosition>>({
    moduleKey: '',
    positionKey: '',
    label: '',
    description: '',
    component: '',
    status: 1,
    sortOrder: 0,
  })

  /** 打开新增弹窗 */
  function openAddDialog() {
    formIsEdit.value = false
    formData.value = {
      moduleKey: '',
      positionKey: '',
      label: '',
      description: '',
      component: '',
      status: 1,
      sortOrder: 0,
    }
    formVisible.value = true
  }

  /** 打开编辑弹窗 */
  function openEditDialog(row: AiPosition) {
    formIsEdit.value = true
    formData.value = { ...row }
    formVisible.value = true
  }

  /** 表单提交回调 */
  async function onFormConfirm(data: Partial<AiPosition>) {
    if (formIsEdit.value && data.id) {
      await PositionAPI.update(data.id, data)
    } else {
      await PositionAPI.insert(data)
    }
    ElMessage.success(formIsEdit.value ? '更新成功' : '新增成功')
    formVisible.value = false
    await handleQuery()
    await positionsStore.refreshPositions()
  }

  // ===== 删除 =====
  async function handleDelete(row: AiPosition) {
    await PositionAPI.delete(row.id!)
    ElMessage.success('删除成功')
    await handleQuery()
    await positionsStore.refreshPositions()
  }

  // ===== 状态切换 =====
  async function onStatusChange(row: AiPosition, val: number) {
    try {
      await PositionAPI.updateStatus(row.id!, val)
      row.status = val
      ElMessage.success(val === 1 ? '已启用' : '已禁用')
      await positionsStore.refreshPositions()
    } catch { /* handled by axios interceptor */ }
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
    handleDelete,
    onStatusChange,
  }
}
