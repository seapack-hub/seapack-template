/**
 * useKnowledgeBase — 知识库管理 composable
 */
import { KnowledgeBaseAPI, type KnowledgeBase, type KnowledgeBaseQuery } from '@/api/ai/knowledgeBase'
import { DEFAULT_KB_FORM } from './moduleOptions'

export function useKnowledgeBase() {
  // ===== 查询状态 =====
  const queryParams = reactive<KnowledgeBaseQuery>({
    pageNum: 1,
    pageSize: 10,
  })
  const tableData = ref<KnowledgeBase[]>([])
  const total = ref(0)
  const loading = ref(false)

  async function handleQuery() {
    loading.value = true
    try {
      const res = await KnowledgeBaseAPI.page(queryParams)
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
  const formData = ref<KnowledgeBase>({ ...DEFAULT_KB_FORM })

  function openAddDialog() {
    formData.value = { ...DEFAULT_KB_FORM }
    formIsEdit.value = false
    formVisible.value = true
  }

  async function openEditDialog(row: KnowledgeBase) {
    formVisible.value = true
    formIsEdit.value = true
    try {
      const detail = await KnowledgeBaseAPI.getById(row.id!)
      formData.value = detail
    } catch {
      ElMessage.error('获取知识库详情失败')
      formVisible.value = false
    }
  }

  async function onFormConfirm(form: KnowledgeBase, isEdit: boolean) {
    const api = isEdit
      ? (d: KnowledgeBase) => KnowledgeBaseAPI.update(form.id!, d)
      : KnowledgeBaseAPI.insert
    await api(form)
    ElMessage.success(isEdit ? '更新成功' : '新增成功')
    formVisible.value = false
    await handleQuery()
  }

  // ===== 删除 =====
  async function handleDelete(row: KnowledgeBase) {
    await KnowledgeBaseAPI.delete(row.id!)
    ElMessage.success('删除成功')
    await handleQuery()
  }

  // ===== 复制 =====
  async function handleCopy(row: KnowledgeBase) {
    await KnowledgeBaseAPI.copy(row.id!)
    ElMessage.success('复制成功')
    await handleQuery()
  }

  // ===== 状态切换 =====
  async function onStatusChange(row: KnowledgeBase, val: number) {
    try {
      await KnowledgeBaseAPI.updateStatus(row.id!, val)
      row.status = val
      ElMessage.success(val === 1 ? '已启用' : '已禁用')
    } catch { /* handled by axios interceptor */ }
  }

  // ===== 文档管理抽屉 =====
  const docDrawerVisible = ref(false)
  const currentKBId = ref(0)
  const currentKBName = ref('')

  function openDocDrawer(row: KnowledgeBase) {
    currentKBId.value = row.id!
    currentKBName.value = row.name
    docDrawerVisible.value = true
  }

  // ===== 分片预览抽屉 =====
  const chunkDrawerVisible = ref(false)

  function openChunkDrawer(row: KnowledgeBase) {
    currentKBId.value = row.id!
    currentKBName.value = row.name
    chunkDrawerVisible.value = true
  }

  // ===== 检索测试抽屉 =====
  const retrieveDrawerVisible = ref(false)

  function openRetrieveDrawer(row: KnowledgeBase) {
    currentKBId.value = row.id!
    currentKBName.value = row.name
    retrieveDrawerVisible.value = true
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
    docDrawerVisible,
    currentKBId,
    currentKBName,
    openDocDrawer,
    chunkDrawerVisible,
    openChunkDrawer,
    retrieveDrawerVisible,
    openRetrieveDrawer,
  }
}
