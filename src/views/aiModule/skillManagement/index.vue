 <!--
  技能管理主页面
  左侧分类树 + 右侧技能列表的布局结构
  管理技能的分类、参数、模块绑定、执行测试和日志查看
-->
<template>
  <div class="app-container w-100% h-100% flex flex-col">
    <div class="flex flex-1 overflow-hidden gap-10">
      <!-- 左侧分类树（内部管理增删改查逻辑） -->
      <div class="w-[220px] flex-shrink-0">
        <SkillCategoryTree
          v-model:active-category-id="activeCategoryId"
          @categories-change="onCategoriesChange"
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
              class="flex-1"
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
                      @change="(val) => onStatusChange(row as any, val as number)"
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
    <!-- 调试弹窗 -->
    <SkillDebugDialog
      v-model:visible="debugDialogVisible"
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
import { ElMessage } from 'element-plus'
import { SkillAPI, type Skill } from '@/api/ai/skill'
import type { SkillCategory } from '@/api/ai/skillCategory'
import { SKILL_LIST_COLUMNS } from './utils'
import { SKILL_STATUS_OPTIONS } from './utils/moduleOptions'
import SkillCategoryTree from './components/SkillCategoryTree.vue'
import SkillFormDialog from './components/SkillFormDialog.vue'
import SkillParamEditor from './components/SkillParamEditor.vue'
import SkillBindingDialog from './components/SkillBindingDialog.vue'
import SkillExecuteDialog from './components/SkillExecuteDialog.vue'
import SkillDebugDialog from './components/SkillDebugDialog.vue'
import SkillLogDialog from './components/SkillLogDialog.vue'

// ===== 分类相关：从 SkillCategoryTree 获取分类数据 =====
const categories = ref<SkillCategory[]>([])
const activeCategoryId = ref<number | undefined>(undefined)

/** 分类数据变化时同步更新（SkillCategoryTree 内部管理增删改查） */
function onCategoriesChange(updatedCategories: SkillCategory[]) {
  categories.value = updatedCategories
}

// ===== 技能列表：分页查询 + 表格列定义 + 状态切换 =====
const queryParams = reactive<{ pageNum: number; pageSize: number; categoryId?: number; status?: number; keyword?: string }>({
  pageNum: 1,
  pageSize: 10,
})
const tableData = ref<Skill[]>([])
const total = ref(0)
const loading = ref(false)

/** 监听分类切换，重置分页并刷新列表 */
watch(activeCategoryId, (val) => {
  queryParams.pageNum = 1
  queryParams.categoryId = val
  handleQuery()
})

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
      { type: 'primary', label: '调试', size: 'small', renderType: 'link', click: ({ row }: any) => openDebugDialog(row) },
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
  name: '', code: '', categoryId: undefined, description: '',
  skillType: 'llm', endpoint: '', timeoutMs: 30000, inputSchema: '',
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
      skillType: 'llm', endpoint: '', timeoutMs: 30000, inputSchema: '',
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
const debugDialogVisible = ref(false)
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

function openDebugDialog(row: Skill) {
  currentSkillId.value = row.id!
  debugDialogVisible.value = true
}

function openLogDialog(row: Skill) {
  currentSkillId.value = row.id!
  logDialogVisible.value = true
}

// ===== 初始化：页面加载时获取技能列表 =====
onMounted(() => {
  handleQuery()
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
