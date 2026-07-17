/**
 * useSkill — 技能管理模块 composable
 *
 * 封装技能列表的分页查询、CRUD 操作、分类数据管理等公共逻辑，
 * 供 index.vue 消费。
 */
import { SkillAPI, type Skill, type SkillQuery } from '@/api/ai/skill'
import { SkillCategoryAPI, type SkillCategory } from '@/api/ai/skillCategory'

export function useSkill() {
  // ===== 分类数据 =====
  const categories = ref<SkillCategory[]>([])
  const activeCategoryId = ref<number | undefined>(undefined)

  /** 从后端加载全部分类列表 */
  async function fetchCategories(force = false) {
    if (!force && categories.value.length > 0) return
    try {
      const { list } = await SkillCategoryAPI.page({ pageNum: 1, pageSize: 9999 })
      categories.value = list || []
    } catch {
      categories.value = []
    }
  }

  // 挂载时拉取分类（兜底，防止 SkillCategoryTree 的 emit 未及时触发）
  onMounted(() => {
    fetchCategories()
  })

  /** 分类数据变化时同步更新（SkillCategoryTree 内部管理增删改查） */
  function onCategoriesChange(updatedCategories: SkillCategory[]) {
    categories.value = updatedCategories
  }

  // ===== 查询状态 =====
  const queryParams = reactive<SkillQuery>({
    pageNum: 1,
    pageSize: 10,
  })
  const tableData = ref<Skill[]>([])
  const total = ref(0)
  const loading = ref(false)

  /** 分页查询技能列表 */
  async function handleQuery() {
    loading.value = true
    try {
      const res = await SkillAPI.page(queryParams)
      tableData.value = res.list || []
      total.value = res.total || 0
    } finally {
      loading.value = false
    }
  }

  /** 重置搜索条件并重新查询 */
  function handleReset() {
    queryParams.keyword = ''
    queryParams.status = undefined
    queryParams.pageNum = 1
    handleQuery()
  }

  // ===== 表单弹窗 =====
  const skillDialogVisible = ref(false)
  const skillDialogIsEdit = ref(false)
  const skillFormData = ref<Skill>({
    name: '', code: '', categoryId: undefined, description: '',
    skillType: 'tool', inputSchema: '',
    version: 'v1.0.0', sortOrder: 0, status: 1,
  })

  /** 打开技能弹窗，编辑时回填、新增时自动选中当前分类 */
  function openSkillDialog(row?: Skill) {
    if (row) {
      skillFormData.value = { ...row }
      skillDialogIsEdit.value = true
    } else {
      skillFormData.value = {
        name: '', code: '', categoryId: activeCategoryId.value, description: '',
        skillType: 'tool', inputSchema: '',
        version: 'v1.0.0', sortOrder: 0, status: 1,
      }
      skillDialogIsEdit.value = false
    }
    skillDialogVisible.value = true
  }

  /** 技能表单提交 */
  async function onSkillFormConfirm(form: Skill, isEdit: boolean) {
    const api = isEdit ? (d: Skill) => SkillAPI.update(form.id!, d) : SkillAPI.insert
    await api(form)
    ElMessage.success(isEdit ? '更新成功' : '新增成功')
    skillDialogVisible.value = false
    await handleQuery()
  }

  /** 删除技能 */
  async function onDeleteSkill(row: Skill) {
    await SkillAPI.delete(row.id!)
    ElMessage.success('删除成功')
    await handleQuery()
  }

  /** 状态切换 */
  async function onStatusChange(row: Skill, val: number) {
    try {
      await SkillAPI.update(row.id!, { status: val })
      row.status = val
      ElMessage.success(val === 1 ? '已启用' : '已禁用')
    } catch { /* error already handled by axios interceptor */ }
  }

  // ===== 操作弹窗（参数） =====
  const currentSkillId = ref(0)
  const paramEditorVisible = ref(false)

  function openParamEditor(row: Skill) {
    currentSkillId.value = row.id!
    paramEditorVisible.value = true
  }

  return {
    // 分类
    categories,
    activeCategoryId,
    fetchCategories,
    onCategoriesChange,
    // 查询
    queryParams,
    tableData,
    total,
    loading,
    handleQuery,
    handleReset,
    // 技能弹窗
    skillDialogVisible,
    skillDialogIsEdit,
    skillFormData,
    openSkillDialog,
    onSkillFormConfirm,
    onDeleteSkill,
    onStatusChange,
    // 操作弹窗
    currentSkillId,
    paramEditorVisible,
    openParamEditor,
  }
}
