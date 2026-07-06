/**
 * usePromptTemplate — 提示词模板管理 composable
 *
 * 封装模板列表的分页查询、CRUD 操作、状态切换等业务逻辑，
 * 供 index.vue 消费。
 */
import { PromptTemplateAPI, type PromptTemplate, type PromptTemplateQuery } from '@/api/ai/promptTemplate'

export function usePromptTemplate() {
  // ===== 查询状态 =====
  const queryParams = reactive<PromptTemplateQuery>({
    pageNum: 1,
    pageSize: 10,
  })
  const tableData = ref<PromptTemplate[]>([])
  const total = ref(0)
  const loading = ref(false)

  /** 分页查询模板列表 */
  async function handleQuery() {
    loading.value = true
    try {
      const res = await PromptTemplateAPI.page(queryParams)
      tableData.value = res.list || []
      total.value = res.total || 0
    } finally {
      loading.value = false
    }
  }

  /** 重置搜索条件并重新查询 */
  function handleReset() {
    queryParams.keyword = ''
    queryParams.category = ''
    queryParams.status = undefined
    queryParams.pageNum = 1
    handleQuery()
  }

  // ===== 表单弹窗 =====
  const formVisible = ref(false)
  const formIsEdit = ref(false)
  const formLoading = ref(false)
  const formData = ref<PromptTemplate>({
    name: '',
    code: '',
    category: 'general',
    content: '',
    variables: [],
    description: '',
    outputFormat: 'markdown',
    version: 'v1.0.0',
    status: 1,
  })

  /** 打开新增弹窗 */
  function openAddDialog() {
    formData.value = {
      name: '',
      code: '',
      category: 'general',
      content: '',
      variables: [],
      description: '',
      outputFormat: 'markdown',
      version: 'v1.0.0',
      status: 1,
    }
    formIsEdit.value = false
    formVisible.value = true
  }

  /** 打开编辑弹窗（调用详情接口获取完整数据） */
  async function openEditDialog(row: PromptTemplate) {
    formVisible.value = true
    formIsEdit.value = true
    formLoading.value = true
    try {
      const detail = await PromptTemplateAPI.getById(row.id!)
      formData.value = detail
    } catch {
      ElMessage.error('获取模板详情失败')
      formVisible.value = false
    } finally {
      formLoading.value = false
    }
  }

  /** 表单提交回调 */
  async function onFormConfirm(form: PromptTemplate, isEdit: boolean) {
    const api = isEdit
      ? (d: PromptTemplate) => PromptTemplateAPI.update(form.id!, d)
      : PromptTemplateAPI.insert
    await api(form)
    ElMessage.success(isEdit ? '更新成功' : '新增成功')
    formVisible.value = false
    await handleQuery()
  }

  // ===== 删除 =====
  async function handleDelete(row: PromptTemplate) {
    await PromptTemplateAPI.delete(row.id!)
    ElMessage.success('删除成功')
    await handleQuery()
  }

  // ===== 复制 =====
  async function handleCopy(row: PromptTemplate) {
    await PromptTemplateAPI.copy(row.id!)
    ElMessage.success('复制成功')
    await handleQuery()
  }

  // ===== 状态切换 =====
  async function onStatusChange(row: PromptTemplate, val: number) {
    try {
      await PromptTemplateAPI.updateStatus(row.id!, val)
      row.status = val
      ElMessage.success(val === 1 ? '已启用' : '已禁用')
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
    formLoading,
    formData,
    openAddDialog,
    openEditDialog,
    onFormConfirm,
    handleDelete,
    handleCopy,
    onStatusChange,
  }
}
