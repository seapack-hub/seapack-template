/**
 * useMacroDataMgmt — 宏观数据管理模块 composable
 *
 * 封装指标元数据加载、分页查询、CRUD 操作等公共逻辑，
 * 供 index.vue 消费。
 */
import { MacroDataAPI } from '@/api/macroData'
import type { MacroIndicatorMeta, MacroDataItem } from '@/api/macroData/types'
import { MONTHLY_COLUMNS, DEFAULT_COLUMNS } from './tableColumns'
import { DEFAULT_FREQUENCY, DEFAULT_INDICATOR, DEFAULT_PAGE_SIZE } from './moduleOptions'

export function useMacroDataMgmt() {
  // ===== 指标元数据 =====
  const metaList = ref<MacroIndicatorMeta[]>([])

  async function fetchMeta() {
    try {
      metaList.value = await MacroDataAPI.getMeta()
    } catch {
      metaList.value = []
    }
  }

  // ===== 查询状态 =====
  const frequency = ref(DEFAULT_FREQUENCY)
  const indicatorCode = ref(DEFAULT_INDICATOR)

  /** 默认日期范围：最近一年 */
  function getDefaultDateRange(): [string, string] {
    const now = new Date()
    const end = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    const lastYear = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
    const start = `${lastYear.getFullYear()}-${String(lastYear.getMonth() + 1).padStart(2, '0')}-${String(lastYear.getDate()).padStart(2, '0')}`
    return [start, end]
  }

  const dateRange = ref<[string, string]>(getDefaultDateRange())
  const tableData = ref<any[]>([])
  const loading = ref(false)
  const total = ref(0)
  const pageNum = ref(1)
  const pageSize = ref(DEFAULT_PAGE_SIZE)

  /** 当前频率下的指标列表（计算属性） */
  const filteredMeta = computed(() =>
    metaList.value.filter((m) => m.frequency === frequency.value),
  )

  /** 当前列配置（月频含第二数值，其他不含） */
  const columns = computed(() =>
    frequency.value === 'monthly' ? MONTHLY_COLUMNS : DEFAULT_COLUMNS,
  )

  /** 分页查询数据 */
  async function handleQuery() {
    if (!indicatorCode.value) {
      ElMessage.warning('请先选择指标')
      return
    }
    loading.value = true
    try {
      const start = dateRange.value?.[0]
      const end = dateRange.value?.[1]
      let result: any
      switch (frequency.value) {
        case 'daily':
          result = await MacroDataAPI.queryDailyPage(pageNum.value, pageSize.value, indicatorCode.value, start, end)
          break
        case 'weekly':
          result = await MacroDataAPI.queryWeeklyPage(pageNum.value, pageSize.value, indicatorCode.value, start, end)
          break
        default:
          result = await MacroDataAPI.queryMonthlyPage(pageNum.value, pageSize.value, indicatorCode.value, start, end)
          break
      }
      tableData.value = result?.list ?? []
      total.value = result?.total ?? 0
    } catch {
      tableData.value = []
      total.value = 0
    } finally {
      loading.value = false
    }
  }

  /** 切换频率时自动选中第一个指标并刷新 */
  function onFrequencyChange() {
    if (filteredMeta.value.length > 0) {
      indicatorCode.value = filteredMeta.value[0].indicatorCode
    }
    pageNum.value = 1
    handleQuery()
  }

  /** 重置筛选条件 */
  function handleReset() {
    frequency.value = DEFAULT_FREQUENCY
    indicatorCode.value = DEFAULT_INDICATOR
    dateRange.value = getDefaultDateRange()
    pageNum.value = 1
    handleQuery()
  }

  // ===== 新增/编辑弹窗 =====
  const dialogVisible = ref(false)
  const dialogMode = ref<'add' | 'edit'>('add')
  const dialogForm = ref<any>({})
  const saveLoading = ref(false)

  function openAddDialog() {
    dialogMode.value = 'add'
    dialogForm.value = {
      statDate: '',
      indicatorCode: filteredMeta.value.length > 0 ? filteredMeta.value[0].indicatorCode : '',
      metricValue: null,
      metricValue2: null,
      momChange: null,
      source: '',
    }
    dialogVisible.value = true
  }

  function openEditDialog(row: any) {
    dialogMode.value = 'edit'
    dialogForm.value = { ...row }
    dialogVisible.value = true
  }

  async function handleSave(formData: any) {
    if (!formData.statDate) {
      ElMessage.warning('请选择日期')
      return
    }
    if (!formData.indicatorCode) {
      ElMessage.warning('请选择指标编码')
      return
    }
    saveLoading.value = true
    try {
      const statDate = formData.statDate?.slice(0, 10)
      const item: MacroDataItem = {
        statDate,
        indicatorCode: formData.indicatorCode,
        metricValue: formData.metricValue ?? 0,
        metricValue2: formData.metricValue2,
        momChange: formData.momChange,
        source: formData.source,
      }
      await MacroDataAPI.save(frequency.value, item)
      ElMessage.success(dialogMode.value === 'add' ? '新增成功' : '修改成功')
      dialogVisible.value = false
      handleQuery()
    } catch {
      ElMessage.error('操作失败')
    } finally {
      saveLoading.value = false
    }
  }

  // ===== 删除 =====
  async function handleDelete(row: any) {
    try {
      const statDate = row.statDate?.slice(0, 10)
      await MacroDataAPI.delete(frequency.value, statDate, row.indicatorCode)
      ElMessage.success('删除成功')
      handleQuery()
    } catch {
      ElMessage.error('删除失败')
    }
  }

  // ===== 工具函数 =====
  function formatDate(val: string) {
    if (!val) return '--'
    return val.slice(0, 10)
  }

  // ===== 初始化 =====
  onMounted(() => {
    fetchMeta()
    handleQuery()
  })

  return {
    // 元数据
    metaList,
    filteredMeta,
    // 查询
    frequency,
    indicatorCode,
    dateRange,
    tableData,
    loading,
    total,
    pageNum,
    pageSize,
    columns,
    handleQuery,
    onFrequencyChange,
    handleReset,
    // 弹窗
    dialogVisible,
    dialogMode,
    dialogForm,
    saveLoading,
    openAddDialog,
    openEditDialog,
    handleSave,
    // 删除
    handleDelete,
    // 工具
    formatDate,
  }
}
