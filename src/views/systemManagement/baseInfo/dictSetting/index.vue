<template>
  <div class="app-container dict-page">
    <!-- 左侧：字典类型面板 -->
    <DictTypePanel
      :types="dictTypes"
      :selected-type="selectedType"
      :loading="typesLoading"
      @select="onSelectType"
      @refresh="loadTypes"
      @add="openTypeDialog()"
      @edit-type="openTypeDialog($event)"
      @delete-type="handleDeleteType"
    />

    <!-- 右侧：字典值管理 -->
    <el-card class="dict-value-panel flex-1 flex flex-col min-w-0 overflow-hidden" shadow="never">
      <template #header>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-12px">
            <el-tag v-if="selectedType" type="primary" size="large" effect="plain">{{ selectedType }}</el-tag>
            <span class="text-13px text-[var(--el-text-color-secondary)]">共 {{ total }} 条字典值</span>
          </div>
          <div class="flex items-center gap-8px">
            <el-input
              v-model="queryParams.keyword"
              placeholder="搜索编码/名称..."
              clearable
              prefix-icon="search"
              style="width: 200px"
              @keyup.enter="handleQuery"
              @clear="handleQuery"
            />
          </div>
        </div>
      </template>

      <!-- 工具栏 -->
      <div class="mb-10px">
        <el-button
          v-permission="'systemManagement:baseInfo:dictSetting:add'"
          type="success"
          icon="plus"
          @click="openValueDialog()"
        >
          新增字典值
        </el-button>
      </div>

      <!-- 表格 -->
      <div class="flex-1 flex flex-col min-h-0 overflow-hidden">
        <SpTable
          class="flex-1"
          :loading="loading"
          :columns="columns"
          :data="tableData"
          :show-index="true"
        />
        <div class="h-[40px] mt-10px">
          <Pagination v-model:total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="handleQuery" />
        </div>
      </div>
    </el-card>

    <!-- 字典值编辑弹窗 -->
    <DictDialog v-model:visible="valueDialogVisible" v-model:is-edit="valueDialogIsEdit" v-model:form="valueDialogForm" :type-options="dictTypes" @confirm="onValueConfirm" />

    <!-- 字典类型编辑弹窗 -->
    <el-dialog v-model="typeDialogVisible" :title="typeDialogIsEdit ? '编辑字典类型' : '新增字典类型'" width="420px" @closed="onTypeDialogClosed">
      <el-form ref="typeFormRef" :model="typeDialogForm" :rules="typeFormRules" label-width="90px">
        <el-form-item label="类型编码" prop="dictType">
          <el-input v-model="typeDialogForm.dictType" placeholder="如 blog_category" :disabled="typeDialogIsEdit" />
        </el-form-item>
        <el-form-item label="类型名称" prop="dictName">
          <el-input v-model="typeDialogForm.dictName" placeholder="如 博客分类" />
        </el-form-item>
        <el-form-item label="描述" prop="remark">
          <el-input v-model="typeDialogForm.remark" type="textarea" :rows="2" placeholder="可选" />
        </el-form-item>
        <el-form-item label="排序号">
          <el-input-number v-model="typeDialogForm.orderNum" :min="0" :max="9999" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="typeDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="typeSubmitting" @click="onTypeSubmit">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { DictAPI, DictTypeAPI, type Dict, type DictTypeInfo } from '@/api/system/baseInfo/dict.ts'
import DictDialog from './components/DictDialog.vue'
import DictTypePanel from './components/DictTypePanel.vue'

// ========== 左侧：字典类型 ==========
const dictTypes = ref<DictTypeInfo[]>([])
const selectedType = ref<string>('')
const typesLoading = ref(false)

async function loadTypes() {
  typesLoading.value = true
  try {
    dictTypes.value = await DictTypeAPI.listWithCount()
  } finally { typesLoading.value = false }
}

function onSelectType(dictType: string) {
  selectedType.value = dictType
  queryParams.pageNum = 1
  queryParams.keyword = ''
  handleQuery()
}

// ========== 类型新增/编辑弹窗 ==========
const typeDialogVisible = ref(false)
const typeDialogIsEdit = ref(false)
const typeSubmitting = ref(false)
const typeFormRef = ref()
const typeDialogForm = ref<{ id?: number, dictType: string, dictName: string, remark: string, orderNum: number }>({
  dictType: '', dictName: '', remark: '', orderNum: 0,
})
const typeFormRules = {
  dictType: [{ required: true, message: '请输入字典类型编码', trigger: 'blur' }],
  dictName: [{ required: true, message: '请输入字典类型名称', trigger: 'blur' }],
}

function openTypeDialog(item?: DictTypeInfo) {
  if (item) {
    typeDialogForm.value = {
      id: item.id,
      dictType: item.dictType,
      dictName: item.dictName,
      remark: item.remark || '',
      orderNum: item.orderNum || 0,
    }
    typeDialogIsEdit.value = true
  } else {
    typeDialogForm.value = { dictType: '', dictName: '', remark: '', orderNum: 0 }
    typeDialogIsEdit.value = false
  }
  typeDialogVisible.value = true
}

function onTypeDialogClosed() {
  typeFormRef.value?.resetFields()
}

async function onTypeSubmit() {
  await typeFormRef.value?.validate()
  typeSubmitting.value = true
  try {
    if (typeDialogIsEdit.value) {
      // 编辑类型
      await DictTypeAPI.update({
        id: typeDialogForm.value.id!,
        dictName: typeDialogForm.value.dictName,
        remark: typeDialogForm.value.remark,
        orderNum: typeDialogForm.value.orderNum,
      })
      ElMessage.success('更新成功')
    } else {
      // 新增类型
      await DictTypeAPI.insert({
        dictType: typeDialogForm.value.dictType,
        dictName: typeDialogForm.value.dictName,
        remark: typeDialogForm.value.remark,
        orderNum: typeDialogForm.value.orderNum,
      })
      ElMessage.success('新增类型成功')
    }
    typeDialogVisible.value = false
    await loadTypes()
    // 自动选中新创建的类型
    if (!typeDialogIsEdit.value) {
      onSelectType(typeDialogForm.value.dictType)
    }
  } finally { typeSubmitting.value = false }
}

async function handleDeleteType(dictType: string) {
  const type = dictTypes.value.find(t => t.dictType === dictType)
  const count = type?.count || 0
  await ElMessageBox.confirm(
    `确定要删除字典类型「${type?.dictName || dictType}」及其下的 ${count} 条值吗？此操作不可恢复。`,
    '删除确认',
    { type: 'warning', confirmButtonText: '确认删除', cancelButtonText: '取消' },
  )
  if (type) {
    await DictTypeAPI.delete(type.id)
  }
  ElMessage.success('删除成功')
  if (selectedType.value === dictType) {
    selectedType.value = ''
  }
  await loadTypes()
}

// ========== 右侧：字典值管理 ==========
const queryParams = reactive({ pageNum: 1, pageSize: 10, keyword: '' })
const tableData = ref<Dict[]>([])
const total = ref(0)
const loading = ref(false)

const columns = ref([
  { label: '字典编码', prop: 'dictCode', minWidth: '120px' },
  { label: '字典名称', prop: 'dictName', minWidth: '140px', showOverflowTooltip: true },
  { label: '排序号', prop: 'orderNum', minWidth: '70px', align: 'center' },
  { label: '备注', prop: 'remark', minWidth: '180px', showOverflowTooltip: true },
  { label: '创建时间', prop: 'gmtCreate', minWidth: '160px' },
  {
    columnType: 'operate', label: '操作', width: '130px', fixed: 'right',
    buttons: [
      {
        type: 'primary',
        label: '编辑',
        size: 'small',
        renderType: 'link',
        buttonPermission: 'systemManagement:baseInfo:dictSetting:edit',
        click: ({ row }: any) => openValueDialog(row),
      },
      {
        type: 'danger',
        label: '删除',
        size: 'small',
        renderType: 'link',
        buttonPermission: 'systemManagement:baseInfo:dictSetting:delete',
        popconFirm: { title: '确认删除该字典值吗？' },
        click: ({ row }: any) => handleDeleteValue(row),
      },
    ],
  },
])

// ========== 字典值新增/编辑弹窗 ==========
const valueDialogVisible = ref(false)
const valueDialogIsEdit = ref(false)
const valueDialogForm = ref<any>({ dictType: '', dictCode: '', dictName: '', orderNum: 0, status: '1', remark: '' })

function openValueDialog(row?: any) {
  if (row) {
    valueDialogForm.value = { ...row }
    valueDialogIsEdit.value = true
  } else {
    valueDialogForm.value = {
      dictType: selectedType.value,
      dictCode: '',
      dictName: '',
      orderNum: 0,
      status: '1',
      remark: '',
    }
    valueDialogIsEdit.value = false
  }
  valueDialogVisible.value = true
}

async function onValueConfirm(form: any, isEdit: boolean) {
  if (!isEdit) { delete form.id; form.status = '1' }
  const api = isEdit ? DictAPI.update : DictAPI.insert
  await api(form)
  ElMessage.success(isEdit ? '更新成功' : '新增成功')
  valueDialogVisible.value = false
  handleQuery()
  loadTypes() // 刷新左侧数量
}

async function handleDeleteValue(row: any) {
  await DictAPI.delete(row.id)
  ElMessage.success('删除成功')
  handleQuery()
  loadTypes() // 刷新左侧数量
}

async function handleQuery() {
  loading.value = true
  try {
    const params: any = {
      pageNum: queryParams.pageNum,
      pageSize: queryParams.pageSize,
      keyword: queryParams.keyword || undefined,
    }
    // 选中类型时按类型筛选，未选中时查询全部
    if (selectedType.value) {
      params.dictType = selectedType.value
    }
    const res = await DictAPI.getList(params)
    tableData.value = res.list || []
    total.value = res.total || 0
  } finally { loading.value = false }
}

// ========== 初始化 ==========
onMounted(() => {
  loadTypes()
  handleQuery() // 初始加载全部字典值
})
</script>

<style lang="scss" scoped>
.dict-page {
  display: flex;
  height: 100%;
  gap: 10px;
}

.dict-value-panel {
  border-left: 1px solid var(--el-border-color-lighter) !important;

  ::v-deep(.el-card__body) {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
}
</style>
