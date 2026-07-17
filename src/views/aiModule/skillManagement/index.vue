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
              <template #skillType>
                <el-table-column label="技能类型" prop="skillType" width="90px" align="center" slot-name="skillType">
                  <template #default="{ row }">
                    <el-tag size="small" :type="skillTypeTagMap[row.skillType] as any || 'info'">
                      {{ skillTypeLabelMap[row.skillType] || row.skillType }}
                    </el-tag>
                  </template>
                </el-table-column>
              </template>
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
      :active-category-id="activeCategoryId"
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
import { SKILL_LIST_COLUMNS } from './utils'
import { SKILL_STATUS_OPTIONS } from './utils/moduleOptions'
import { useSkill } from './utils/useSkill'
import SkillCategoryTree from './components/SkillCategoryTree.vue'
import SkillFormDialog from './components/SkillFormDialog.vue'
import SkillParamEditor from './components/SkillParamEditor.vue'
import SkillBindingDialog from './components/SkillBindingDialog.vue'
import SkillExecuteDialog from './components/SkillExecuteDialog.vue'
import SkillDebugDialog from './components/SkillDebugDialog.vue'
import SkillLogDialog from './components/SkillLogDialog.vue'

const {
  categories,
  activeCategoryId,
  onCategoriesChange,
  queryParams,
  tableData,
  total,
  loading,
  handleQuery,
  handleReset,
  skillDialogVisible,
  skillDialogIsEdit,
  skillFormData,
  openSkillDialog,
  onSkillFormConfirm,
  onDeleteSkill,
  onStatusChange,
  currentSkillId,
  currentSkillName,
  paramEditorVisible,
  bindingDialogVisible,
  executeDialogVisible,
  debugDialogVisible,
  logDialogVisible,
  openParamEditor,
  openBindingDialog,
  openExecuteDialog,
  openDebugDialog,
  openLogDialog,
} = useSkill()

/** 技能类型标签映射 */
const skillTypeLabelMap: Record<string, string> = {
  tool: '工具调用',
  rag: '知识检索',
  hybrid: '混合',
}
const skillTypeTagMap: Record<string, string> = {
  tool: 'info',
  rag: 'success',
  hybrid: 'warning',
}

/** SpTable 列配置 */
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
