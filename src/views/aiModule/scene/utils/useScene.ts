/**
 * useScene — 场景管理 composable
 */
import { SceneAPI, type Scene, type SceneQuery } from '@/api/ai/scene'
import { DEFAULT_SCENE_FORM } from './moduleOptions'

export function useScene() {
  // ===== 查询状态 =====
  const queryParams = reactive<SceneQuery>({
    pageNum: 1,
    pageSize: 10,
  })
  const tableData = ref<Scene[]>([])
  const total = ref(0)
  const loading = ref(false)

  async function handleQuery() {
    loading.value = true
    try {
      const res = await SceneAPI.page(queryParams)
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
  const formData = ref<Scene>({ ...DEFAULT_SCENE_FORM })

  function openAddDialog() {
    formData.value = { ...DEFAULT_SCENE_FORM }
    formIsEdit.value = false
    formVisible.value = true
  }

  async function openEditDialog(row: Scene) {
    formVisible.value = true
    formIsEdit.value = true
    try {
      const detail = await SceneAPI.getById(row.id!)
      formData.value = detail
    } catch {
      ElMessage.error('获取场景详情失败')
      formVisible.value = false
    }
  }

  async function onFormConfirm(form: Scene, isEdit: boolean) {
    const api = isEdit
      ? (d: Scene) => SceneAPI.update(form.id!, d)
      : SceneAPI.insert
    await api(form)
    ElMessage.success(isEdit ? '更新成功' : '新增成功')
    formVisible.value = false
    await handleQuery()
  }

  // ===== 删除 =====
  async function handleDelete(row: Scene) {
    await SceneAPI.delete(row.id!)
    ElMessage.success('删除成功')
    await handleQuery()
  }

  // ===== 复制 =====
  async function handleCopy(row: Scene) {
    await SceneAPI.copy(row.id!)
    ElMessage.success('复制成功')
    await handleQuery()
  }

  // ===== 状态切换 =====
  async function onStatusChange(row: Scene, val: number) {
    try {
      await SceneAPI.updateStatus(row.id!, val)
      row.status = val
      ElMessage.success(val === 1 ? '已启用' : '已禁用')
    } catch { /* handled by axios interceptor */ }
  }

  // ===== 配置抽屉 =====
  const configDrawerVisible = ref(false)
  const currentSceneId = ref(0)
  const currentSceneName = ref('')

  function openConfigDrawer(row: Scene) {
    currentSceneId.value = row.id!
    currentSceneName.value = row.name
    configDrawerVisible.value = true
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
    currentSceneId,
    currentSceneName,
    openConfigDrawer,
  }
}
