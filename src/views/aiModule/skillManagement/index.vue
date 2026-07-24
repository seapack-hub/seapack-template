  <!--
  技能管理主页面
  左侧分类树 + 右侧技能列表（卡片/列表双模式）
-->
<template>
  <div class="app-container w-100% h-100% flex flex-col">
    <div class="flex flex-1 overflow-hidden gap-10">
      <!-- 左侧分类树 -->
      <div class="w-[220px] flex-shrink-0">
        <SkillCategoryTree
          v-model:active-category-id="activeCategoryId"
          @categories-change="onCategoriesChange"
        />
      </div>
      <!-- 右侧技能列表 -->
      <div class="flex-1 flex flex-col overflow-hidden">
        <el-card class="el-card-main flex-1 flex flex-col gap-10 overflow-hidden" shadow="never">
          <!-- 搜索栏 -->
          <div class="search-bar">
            <el-form :inline="true" :model="queryParams" @submit.prevent="handleQuery">
              <el-form-item label="技能名称">
                <el-input v-model="queryParams.keyword" placeholder="名称/编码模糊搜索" clearable style="width: 200px" @keyup.enter="handleQuery" />
              </el-form-item>
              <el-form-item label="状态">
                <el-select v-model="queryParams.status" placeholder="全部" clearable style="width: 120px">
                  <el-option v-for="opt in SKILL_STATUS_OPTIONS" :key="String(opt.value)" :label="opt.label" :value="opt.value" />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" icon="search" @click="handleQuery">搜索</el-button>
                <el-button icon="refresh" @click="handleReset">重置</el-button>
              </el-form-item>
            </el-form>
          </div>
          <!-- 工具栏 -->
          <div class="toolbar">
            <el-button type="success" icon="plus" @click="openSkillDialog()">新增技能</el-button>
            <el-radio-group v-model="viewMode" class="view-switcher">
              <el-radio-button value="card">
                <el-icon><Grid /></el-icon>
              </el-radio-button>
              <el-radio-button value="list">
                <el-icon><List /></el-icon>
              </el-radio-button>
            </el-radio-group>
          </div>

          <!-- 卡片 + 列表 模式切换 -->
          <Transition name="view-fade" mode="out-in">
            <!-- 卡片模式 -->
            <CardGrid
              v-if="viewMode === 'card'"
              key="card"
              v-model:page="queryParams.pageNum"
              v-model:limit="queryParams.pageSize"
              :total="total"
              :loading="loading"
              empty-text="暂无技能"
              @pagination="handleQuery"
            >
              <SkillCard
                v-for="row in tableData"
                :key="row.id"
                :skill="row"
                @edit="openSkillDialog"
                @params="openParamEditor"
                @delete="handleCardDelete"
                @status-change="onStatusChange"
              />
            </CardGrid>

            <!-- 列表模式 -->
            <div v-else key="list" class="flex-1 flex flex-col justify-between overflow-hidden border">
              <SpTable class="flex-1" :loading="loading" :columns="columns" :data="tableData" :show-index="true">
                <template #skillType>
                  <el-table-column label="技能类型" prop="skillType" width="90px" align="center" slot-name="skillType">
                    <template #default="{ row }">
                      <el-tag size="small" :type="skillTypeTagMap[row.skillType] as any || 'info'" effect="light">
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
          </Transition>
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
  </div>
</template>

<script setup lang="ts">
import { ElMessageBox } from 'element-plus'
import { SKILL_LIST_COLUMNS } from './utils'
import { SKILL_STATUS_OPTIONS } from './utils/moduleOptions'
import { useSkill } from './utils/useSkill'
import SkillCategoryTree from './components/SkillCategoryTree.vue'
import SkillFormDialog from './components/SkillFormDialog.vue'
import SkillParamEditor from './components/SkillParamEditor.vue'
import SkillCard from './components/SkillCard.vue'

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
  paramEditorVisible,
  openParamEditor,
} = useSkill()

const viewMode = ref<'card' | 'list'>('list')

const skillTypeLabelMap: Record<string, string> = {
  tool: '工具调用',
  rag: '知识检索',
  hybrid: '混合',
  llm: 'LLM',
  function: '函数',
  workflow: '工作流',
}
const skillTypeTagMap: Record<string, string> = {
  tool: 'info',
  rag: 'success',
  hybrid: 'warning',
}

const columns = [
  ...SKILL_LIST_COLUMNS,
  {
    columnType: 'operate', label: '操作', width: '150px', fixed: 'right',
    buttons: [
      { type: 'primary', label: '编辑', size: 'small', renderType: 'link', click: ({ row }: any) => openSkillDialog(row) },
      { type: 'primary', label: '参数', size: 'small', renderType: 'link', click: ({ row }: any) => openParamEditor(row) },
      { type: 'danger', label: '删除', size: 'small', renderType: 'link', popconFirm: { title: '确认删除该技能吗？' }, click: ({ row }: any) => onDeleteSkill(row) },
    ],
  },
]

async function handleCardDelete(row: any) {
  await ElMessageBox.confirm(`确认删除技能【${row.name}】？`, '提示', { type: 'warning' })
  await onDeleteSkill(row)
}

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

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.view-switcher {
  :deep(.el-radio-button__inner) {
    padding: 6px 10px;
  }
}

/* 视图切换过渡 */
.view-fade-enter-active,
.view-fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.view-fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.view-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
