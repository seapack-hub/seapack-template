<template>
  <div class="app-container w-100% h-100% flex flex-col">
    <el-card class="el-card-main flex-1 flex flex-col gap-10 overflow-hidden" shadow="never">
      <div class="table-toolbar">
        <el-button type="success" icon="plus" @click="openFormDialog()">新增顶级目录</el-button>
      </div>
      <div class="flex-1 overflow-auto border">
        <SpTable class="flex-1" :loading="loading" :columns="columns" :data="tableData" row-key="id" :tree-props="{ children: 'children' }" :show-index="true" default-expand-all>
          <template #type>
            <el-table-column label="资源类型" min-width="100px" align="center" slot-name="type">
              <template #default="{ row }">
                <span>{{ typeLabel(row.type) }}</span>
              </template>
            </el-table-column>
          </template>
          <template #status>
            <el-table-column label="状态" min-width="80px" align="center" slot-name="status">
              <template #default="{ row }">
                <el-tag :type="row.status == 1 ? 'success' : 'danger'">{{ row.status == 1 ? '正常' : '禁用' }}</el-tag>
              </template>
            </el-table-column>
          </template>
        </SpTable>
      </div>
    </el-card>

    <MenuFormDialog v-model:visible="formVisible" v-model:is-edit="formIsEdit" v-model:form="formData" v-model:parent-name="parentName" @confirm="onFormConfirm" />
  </div>
</template>

<script setup lang="ts">
import { ElMessageBox, ElMessage } from 'element-plus'
import { PermissionAPI, type Permission } from '@/api/system/permission/permission'
import { createMenuColumns } from './components/menuColumns'
import MenuFormDialog from './components/MenuFormDialog.vue'

const loading = ref(false)
const tableData = ref<Permission[]>([])

const columns = createMenuColumns({
  onEdit(row) { openFormDialog(row) },
  onDelete(row) {
    ElMessageBox.confirm(`确认删除【${row.name}】及所有子项？`, '警告', { type: 'warning' }).then(async () => {
      await PermissionAPI.delete(row.id)
      ElMessage.success('删除成功')
      fetchTree()
    }).catch(() => {})
  },
  onAddChild(row) {
    formData.value = { name: '', type: 2, path: '', component: '', permKey: '', sortOrder: 0, status: 1, parentId: row.id }
    parentName.value = row.name
    formIsEdit.value = false
    formVisible.value = true
  },
})

const formVisible = ref(false)
const formIsEdit = ref(false)
const parentName = ref('')
const formData = ref<any>({ name: '', type: 2, path: '', component: '', permKey: '', sortOrder: 0, status: 1, parentId: 0 })

function openFormDialog(row?: any) {
  parentName.value = ''
  if (row) {
    formData.value = { ...row }
    formIsEdit.value = true
  } else {
    formData.value = { name: '', type: 2, path: '', component: '', permKey: '', sortOrder: 0, status: 1, parentId: 0 }
    formIsEdit.value = false
  }
  formVisible.value = true
}

async function onFormConfirm(form: any, isEdit: boolean) {
  const api = isEdit ? (d: any) => PermissionAPI.update(form.id, d) : PermissionAPI.insert
  await api(form)
  ElMessage.success(isEdit ? '更新成功' : '新增成功')
  formVisible.value = false
  fetchTree()
}

function typeLabel(type: number) {
  return { 1: '📁 目录', 2: '📄 菜单', 3: '🔘 按钮' }[type] || ''
}

async function fetchTree() {
  loading.value = true
  try {
    const res = await PermissionAPI.getTree()
    tableData.value = Array.isArray(res) ? res : []
  } finally { loading.value = false }
}

onMounted(() => { fetchTree() })
</script>

<style lang="scss" scoped>
.el-card-main ::v-deep(.el-card__body) {
  height: calc(100% - 40px); display: flex; flex-direction: column; gap: 10px;
}
.table-toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
</style>
