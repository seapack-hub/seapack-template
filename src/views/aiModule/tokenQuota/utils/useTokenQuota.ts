/**
 * 用户 Token 额度管理 - 业务逻辑
 */
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { UserQuotaAPI } from '@/api/ai/tokenQuota'
import type { UserTokenQuota, QuotaFormData, QuotaListQuery, QuotaStats } from '@/api/ai/tokenQuota'

export function useTokenQuota() {
  // ===== 列表查询 =====
  const loading = ref(false)
  const tableData = ref<UserTokenQuota[]>([])
  const total = ref(0)

  const queryParams = reactive<QuotaListQuery>({
    pageNum: 1,
    pageSize: 10,
    userName: undefined,
    quotaType: undefined,
    status: undefined,
    isEnabled: undefined,
  })

  async function handleQuery() {
    loading.value = true
    try {
      const { list, total: t } = await UserQuotaAPI.getList(queryParams)
      tableData.value = list
      total.value = t
    } catch (e) {
      console.error('查询额度列表失败', e)
    } finally {
      loading.value = false
    }
  }

  function handleReset() {
    queryParams.userName = undefined
    queryParams.quotaType = undefined
    queryParams.status = undefined
    queryParams.isEnabled = undefined
    queryParams.pageNum = 1
    handleQuery()
  }

  // ===== 统计数据 =====
  const stats = ref<QuotaStats>({
    totalUsers: 0,
    enabledCount: 0,
    exceededCount: 0,
    disabledCount: 0,
  })

  async function loadStats() {
    try {
      stats.value = await UserQuotaAPI.getStats()
    } catch (e) {
      console.error('查询统计失败', e)
    }
  }

  // ===== 弹窗表单 =====
  const formVisible = ref(false)
  const formIsEdit = ref(false)
  const formLoading = ref(false)

  const formData = reactive<QuotaFormData>({
    userId: undefined,
    userName: undefined,
    quotaType: 'daily',
    quotaLimit: 100000,
    alertThreshold: 80,
    isEnabled: true,
  })

  function openAddDialog() {
    formIsEdit.value = false
    formData.userId = undefined
    formData.userName = undefined
    formData.quotaType = 'daily'
    formData.quotaLimit = 100000
    formData.alertThreshold = 80
    formData.isEnabled = true
    formVisible.value = true
  }

  function openEditDialog(row: UserTokenQuota) {
    formIsEdit.value = true
    formData.userId = row.userId
    formData.userName = row.userName
    formData.quotaType = row.quotaType
    formData.quotaLimit = row.quotaLimit
    formData.alertThreshold = row.alertThreshold
    formData.isEnabled = row.isEnabled
    formVisible.value = true
  }

  async function onFormConfirm(data: QuotaFormData) {
    if (!data.userId && !formIsEdit.value) {
      ElMessage.warning('请选择用户')
      return
    }
    if (data.quotaLimit < 0) {
      ElMessage.warning('额度上限不能为负数')
      return
    }
    formLoading.value = true
    try {
      await UserQuotaAPI.save(data)
      ElMessage.success(formIsEdit.value ? '编辑成功' : '新增成功')
      formVisible.value = false
      handleQuery()
      loadStats()
    } catch (e) {
      console.error('保存失败', e)
    } finally {
      formLoading.value = false
    }
  }

  // ===== 启用/禁用 =====
  async function handleToggle(row: UserTokenQuota, val: boolean) {
    try {
      await UserQuotaAPI.toggle(row.id!, val)
      ElMessage.success(val ? '已启用' : '已禁用')
      handleQuery()
      loadStats()
    } catch (e) {
      console.error('操作失败', e)
    }
  }

  // ===== 删除 =====
  async function handleDelete(row: UserTokenQuota) {
    await ElMessageBox.confirm(`确认删除该用户的额度配置？`, '提示', { type: 'warning' })
    try {
      await UserQuotaAPI.delete(row.id!)
      ElMessage.success('删除成功')
      handleQuery()
      loadStats()
    } catch (e) {
      console.error('删除失败', e)
    }
  }

  // ===== 重置额度 =====
  async function handleResetQuota(row: UserTokenQuota) {
    await ElMessageBox.confirm(`确认重置该用户的${quotaTypeLabel(row.quotaType)}额度？`, '提示', { type: 'warning' })
    try {
      await UserQuotaAPI.reset(row.userId, row.quotaType)
      ElMessage.success('重置成功')
      handleQuery()
    } catch (e) {
      console.error('重置失败', e)
    }
  }

  return {
    // 列表
    loading,
    tableData,
    total,
    queryParams,
    handleQuery,
    handleReset,
    // 统计
    stats,
    loadStats,
    // 弹窗
    formVisible,
    formIsEdit,
    formLoading,
    formData,
    openAddDialog,
    openEditDialog,
    onFormConfirm,
    // 操作
    handleToggle,
    handleDelete,
    handleResetQuota,
  }
}

/** 配额类型标签 */
export function quotaTypeLabel(type: string): string {
  const map: Record<string, string> = {
    daily: '日额度',
    monthly: '月额度',
    total: '总额度',
  }
  return map[type] || type
}

/** 配额类型 Tag 颜色 */
export function quotaTypeTagType(type: string): string {
  const map: Record<string, string> = {
    daily: 'primary',
    monthly: 'success',
    total: 'warning',
  }
  return map[type] || 'info'
}

/** 状态标签 */
export function statusLabel(status: string): string {
  const map: Record<string, string> = {
    normal: '正常',
    exceeded: '已超限',
    disabled: '已禁用',
  }
  return map[status] || status
}

/** 状态 Tag 颜色 */
export function statusTagType(status: string): string {
  const map: Record<string, string> = {
    normal: 'success',
    exceeded: 'danger',
    disabled: 'info',
  }
  return map[status] || 'info'
}
