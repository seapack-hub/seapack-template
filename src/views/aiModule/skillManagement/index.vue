 <!--
  技能管理主页面
  左侧分类树 + 右侧技能列表的布局结构
  管理技能的分类、参数、模块绑定、执行测试和日志查看
-->
<template>
  <div class="app-container w-100% h-100% flex flex-col">
    <div class="flex flex-1 overflow-hidden gap-10">
      <!-- 左侧分类树 -->
      <div class="w-[220px] flex-shrink-0">
        <SkillCategoryTree
          v-model:search="categorySearch"
          :categories="categories"
          :active-id="activeCategoryId"
          :loading="categoryLoading"
          @select="onCategorySelect"
          @add="openCategoryDialog()"
          @edit="openCategoryDialog($event)"
          @delete="onDeleteCategory"
        />
      </div>
      <!-- 右侧技能列表 -->
      <div class="flex-1 flex flex-col overflow-hidden">
        <el-card class="el-card-main flex-1 flex flex-col gap-10 overflow-hidden" shadow="never">
          <!-- 搜索栏：按名称/编码关键字 + 状态筛选 -->
          <div class="search-bar h-[50px]">
            <el-form :inline="true" :model="queryParams">
              <el-form-item label="技能名称">
                <el-input v-model="queryParams.keyword" placeholder="名称/编码模糊搜索" clearable style="width: 200px" @keyup.enter="handleQuery" />
              </el-form-item>
              <el-form-item label="状态">
                <el-select v-model="queryParams.status" placeholder="全部" clearable style="width: 120px">
                  <el-option
                    v-for="opt in SKILL_STATUS_OPTIONS"
                    :key="String(opt.value)"
                    :label="opt.label"
                    :value="opt.value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" icon="search" @click="handleQuery">搜索</el-button>
                <el-button icon="refresh" @click="handleReset">重置</el-button>
              </el-form-item>
            </el-form>
          </div>
          <!-- 工具栏 -->
          <div class="table-toolbar">
            <el-button type="success" icon="plus" @click="openSkillDialog()">新增技能</el-button>
          </div>
          <!-- 技能表格：使用 SpTable + 内联状态切换 + Pagination -->
          <div class="flex-1 flex flex-col justify-between overflow-hidden border">
            <SpTable
              :loading="loading"
              :columns="columns"
              :data="tableData"
              :show-index="true"
            >
              <template #status>
                <el-table-column label="状态" min-width="80px" align="center" slot-name="status">
                  <template #default="{ row }">
                    <el-switch
                      :model-value="row.status"
                      :active-value="1"
                      :inactive-value="0"
                      @change="(val: number) => onStatusChange(row, val)"
                    />
                  </template>
                </el-table-column>
              </template>
            </SpTable>
            <div class="h-[40px] mt-10px">
              <Pagination
                v-model:total="total"
                v-model:page="queryParams.pageNum"
                v-model:limit="queryParams.pageSize"
                @pagination="handleQuery"
              />
            </div>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 分类新增/编辑弹窗 -->
    <SkillCategoryDialog
      v-model:visible="categoryDialogVisible"
      v-model:is-edit="categoryDialogIsEdit"
      v-model:form="categoryFormData"
      @confirm="onCategoryFormConfirm"
    />
    <!-- 技能新增/编辑弹窗 -->
    <SkillFormDialog
      v-model:visible="skillDialogVisible"
      v-model:is-edit="skillDialogIsEdit"
      v-model:form="skillFormData"
      :categories="categories"
      @confirm="onSkillFormConfirm"
    />
    <!-- 参数管理弹窗 -->
    <SkillParamEditor
      v-model:visible="paramEditorVisible"
      :skill-id="currentSkillId"
    />
    <!-- 模块绑定弹窗 -->
    <SkillBindingDialog
      v-model:visible="bindingDialogVisible"
      :skill-id="currentSkillId"
      :skill-name="currentSkillName"
    />
    <!-- 执行测试弹窗 -->
    <SkillExecuteDialog
      v-model:visible="executeDialogVisible"
      :skill-id="currentSkillId"
    />
    <!-- 执行日志弹窗 -->
    <SkillLogDialog
      v-model:visible="logDialogVisible"
      :skill-id="currentSkillId"
    />
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus'
import { SkillCategoryAPI, type SkillCategory } from '@/api/ai/skillCategory'
import { SkillAPI, type Skill } from '@/api/ai/skill'
import { SKILL_LIST_COLUMNS } from './utils'
import { SKILL_STATUS_OPTIONS } from './utils/moduleOptions'
import SkillCategoryTree from './components/SkillCategoryTree.vue'
import SkillCategoryDialog from './components/SkillCategoryDialog.vue'
import SkillFormDialog from './components/SkillFormDialog.vue'
import SkillParamEditor from './components/SkillParamEditor.vue'
import SkillBindingDialog from './components/SkillBindingDialog.vue'
import SkillExecuteDialog from './components/SkillExecuteDialog.vue'
import SkillLogDialog from './components/SkillLogDialog.vue'

// ===== 分类管理：加载分类列表、选中过滤、CRUD 弹窗控制 =====
const categories = ref<SkillCategory[]>([])
const activeCategoryId = ref<number | undefined>(undefined)
const categoryLoading = ref(false)
/** 分类树搜索关键字（客户端过滤） */
const categorySearch = ref('')
/** 是否已加载过分类（缓存标记，避免重复请求） */
let categoriesLoaded = false

/** 从后端加载全部分类列表（只加载一次，后续使用缓存） */
async function fetchCategories(force = false) {
  if (categoriesLoaded && !force) return
  categoryLoading.value = true
  try {
    categories.value = await SkillCategoryAPI.list() || []
    categoriesLoaded = true
  } catch {
    categories.value = []
  } finally {
    categoryLoading.value = false
  }
}

/** 切换分类筛选：选中分类后重置分页并刷新列表 */
function onCategorySelect(id: number | undefined) {
  activeCategoryId.value = id
  queryParams.pageNum = 1
  queryParams.categoryId = id
  handleQuery()
}

// ===== 分类弹窗：新增/编辑/删除 =====
const categoryDialogVisible = ref(false)
const categoryDialogIsEdit = ref(false)
const categoryFormData = ref<SkillCategory>({ name: '', code: '', icon: '', description: '', sortOrder: 0, status: 1 })

/** 打开分类弹窗，编辑时回填数据、新增时重置为默认值 */
function openCategoryDialog(row?: SkillCategory) {
  if (row) {
    categoryFormData.value = { ...row }
    categoryDialogIsEdit.value = true
  } else {
    categoryFormData.value = { name: '', code: '', icon: '', description: '', sortOrder: 0, status: 1 }
    categoryDialogIsEdit.value = false
  }
  categoryDialogVisible.value = true
}

/** 分类表单提交：编辑调 update、新增调 insert，完成后刷新分类列表 */
async function onCategoryFormConfirm(form: SkillCategory, isEdit: boolean) {
  const api = isEdit ? (d: SkillCategory) => SkillCategoryAPI.update(form.id!, d) : SkillCategoryAPI.insert
  await api(form)
  ElMessage.success(isEdit ? '更新成功' : '新增成功')
  categoryDialogVisible.value = false
  await fetchCategories(true)
}

/** 删除分类：二次确认后删除，如果当前正选中该分类则清除筛选状态 */
async function onDeleteCategory(cat: SkillCategory) {
  await ElMessageBox.confirm(`确认删除分类【${cat.name}】？删除后该分类下的技能将变为"未分类"。`, '警告', { type: 'warning' })
  await SkillCategoryAPI.delete(cat.id!)
  ElMessage.success('删除成功')
  if (activeCategoryId.value === cat.id) {
    activeCategoryId.value = undefined
    queryParams.categoryId = undefined
  }
  await fetchCategories(true)
  await handleQuery()
}

// ===== 技能列表：分页查询 + 表格列定义 + 状态切换 =====
const queryParams = reactive<{ pageNum: number; pageSize: number; categoryId?: number; status?: number; keyword?: string }>({
  pageNum: 1,
  pageSize: 10,
})
const tableData = ref<Skill[]>([])
const total = ref(0)
const loading = ref(false)

/** SpTable 列配置，从共享常量中获取基础列，追加操作栏按钮 */
const columns = [
  ...SKILL_LIST_COLUMNS,
  {
    columnType: 'operate', label: '操作', width: '160px', fixed: 'right',
    buttons: [
      { type: 'primary', label: '编辑', size: 'small', renderType: 'link', click: ({ row }: any) => openSkillDialog(row) },
      { type: 'primary', label: '参数', size: 'small', renderType: 'link', click: ({ row }: any) => openParamEditor(row) },
      { type: 'danger', label: '删除', size: 'small', renderType: 'link', popconFirm: { title: '确认删除该技能吗？' }, click: ({ row }: any) => onDeleteSkill(row) },
      { type: 'primary', label: '模块绑定', size: 'small', renderType: 'link', click: ({ row }: any) => openBindingDialog(row) },
      { type: 'primary', label: '执行测试', size: 'small', renderType: 'link', click: ({ row }: any) => openExecuteDialog(row) },
      { type: 'primary', label: '执行日志', size: 'small', renderType: 'link', click: ({ row }: any) => openLogDialog(row) },
    ],
  },
]

/** 通用分页查询 */
async function handleQuery() {
  loading.value = true
  try {
    const res = await SkillAPI.page(queryParams)
    tableData.value = res.list || []
    total.value = res.total || 0
  } finally { loading.value = false }
}

/** 重置搜索条件并重新查询 */
function handleReset() {
  queryParams.keyword = ''
  queryParams.status = undefined
  queryParams.pageNum = 1
  handleQuery()
}

/** 表格内行级状态切换开关 */
async function onStatusChange(row: Skill, val: number) {
  try {
    await SkillAPI.update(row.id!, { status: val })
    row.status = val
    ElMessage.success(val === 1 ? '已启用' : '已禁用')
  } catch { /* error already handled by axios interceptor */ }
}

// ===== 技能弹窗：新增/编辑/删除 =====
const skillDialogVisible = ref(false)
const skillDialogIsEdit = ref(false)
const skillFormData = ref<Skill>({
  name: '', code: '', categoryId: undefined, description: '', promptTemplate: '',
  temperature: 0.7, maxTokens: 2048, outputFormat: 'markdown', version: 'v1.0.0',
  sortOrder: 0, status: 1,
})

/** 打开技能弹窗，编辑时回填、新增时自动选中当前分类 */
function openSkillDialog(row?: Skill) {
  if (row) {
    skillFormData.value = { ...row }
    skillDialogIsEdit.value = true
  } else {
    skillFormData.value = {
      name: '', code: '', categoryId: activeCategoryId.value, description: '', promptTemplate: '',
      temperature: 0.7, maxTokens: 2048, outputFormat: 'markdown', version: 'v1.0.0',
      sortOrder: 0, status: 1,
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

/** 删除技能后刷新列表 */
async function onDeleteSkill(row: Skill) {
  await SkillAPI.delete(row.id!)
  ElMessage.success('删除成功')
  await handleQuery()
}

// ===== 操作弹窗（参数/绑定/执行/日志）：统一管理 currentSkillId =====
const currentSkillId = ref(0)
const currentSkillName = ref('')
const paramEditorVisible = ref(false)
const bindingDialogVisible = ref(false)
const executeDialogVisible = ref(false)
const logDialogVisible = ref(false)

function openParamEditor(row: Skill) {
  currentSkillId.value = row.id!
  paramEditorVisible.value = true
}

function openBindingDialog(row: Skill) {
  currentSkillId.value = row.id!
  currentSkillName.value = row.name
  bindingDialogVisible.value = true
}

function openExecuteDialog(row: Skill) {
  currentSkillId.value = row.id!
  executeDialogVisible.value = true
}

function openLogDialog(row: Skill) {
  currentSkillId.value = row.id!
  logDialogVisible.value = true
}

// ===== 初始化：页面加载时获取分类和技能列表 =====
onMounted(async () => {
  await fetchCategories()
  await handleQuery()
})
</script>

<style lang="scss" scoped>
.el-card-main ::v-deep(.el-card__body) {
  height: calc(100% - 40px);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
