/**
 * useAgent — Agent 管理 composable
 */
import { AgentAPI, type Agent, type AgentQuery } from '@/api/ai/agent'
import { DEFAULT_AGENT_FORM } from './moduleOptions'

export function useAgent() {
  // ===== 查询状态 =====
  const queryParams = reactive<AgentQuery>({
    pageNum: 1,
    pageSize: 10,
  })
  const tableData = ref<Agent[]>([])
  const total = ref(0)
  const loading = ref(false)

  async function handleQuery() {
    loading.value = true
    try {
      const res = await AgentAPI.page(queryParams)
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

  // ===== 表单弹窗 =====
  const formVisible = ref(false)
  const formIsEdit = ref(false)
  const formData = ref<Agent>({ ...DEFAULT_AGENT_FORM })

  function openAddDialog() {
    formData.value = { ...DEFAULT_AGENT_FORM }
    formIsEdit.value = false
    formVisible.value = true
  }

  async function openEditDialog(row: Agent) {
    formVisible.value = true
    formIsEdit.value = true
    try {
      const detail = await AgentAPI.getById(row.id!)
      formData.value = detail
    } catch {
      ElMessage.error('获取 Agent 详情失败')
      formVisible.value = false
    }
  }

  async function onFormConfirm(form: Agent, isEdit: boolean) {
    const api = isEdit
      ? (d: Agent) => AgentAPI.update(form.id!, d)
      : AgentAPI.insert
    await api(form)
    ElMessage.success(isEdit ? '更新成功' : '新增成功')
    formVisible.value = false
    await handleQuery()
  }

  // ===== 删除 =====
  async function handleDelete(row: Agent) {
    await AgentAPI.delete(row.id!)
    ElMessage.success('删除成功')
    await handleQuery()
  }

  // ===== 复制 =====
  async function handleCopy(row: Agent) {
    await AgentAPI.copy(row.id!)
    ElMessage.success('复制成功')
    await handleQuery()
  }

  // ===== 状态切换 =====
  async function onStatusChange(row: Agent, val: number) {
    try {
      await AgentAPI.updateStatus(row.id!, val)
      row.status = val
      ElMessage.success(val === 1 ? '已启用' : '已禁用')
    } catch { /* handled by axios interceptor */ }
  }

  // ===== 配置抽屉 =====
  const configDrawerVisible = ref(false)
  const currentAgentId = ref(0)
  const currentAgentName = ref('')

  function openConfigDrawer(row: Agent) {
    currentAgentId.value = row.id!
    currentAgentName.value = row.name
    configDrawerVisible.value = true
  }

  // ===== 测试抽屉 =====
  const testDrawerVisible = ref(false)

  function openTestDrawer(row: Agent) {
    currentAgentId.value = row.id!
    currentAgentName.value = row.name
    testDrawerVisible.value = true
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
    handleCopy,
    onStatusChange,
    configDrawerVisible,
    currentAgentId,
    currentAgentName,
    openConfigDrawer,
    testDrawerVisible,
    openTestDrawer,
  }
}
