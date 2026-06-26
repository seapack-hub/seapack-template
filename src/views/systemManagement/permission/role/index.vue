<template>
  <div class="app-container w-100% h-100% flex flex-col">
    <div class="search-bar h-[50px]">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="queryParams.roleName" placeholder="模糊搜索" clearable style="width: 200px" @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="queryParams.status" placeholder="全部" clearable style="width: 150px">
            <el-option label="正常" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="search" @click="handleQuery">搜索</el-button>
          <el-button icon="refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-card class="el-card-main flex-1 flex flex-col gap-10 overflow-hidden" shadow="never">
      <div class="table-toolbar">
        <el-button type="success" icon="plus" @click="openFormDialog()">新增</el-button>
      </div>
      <div class="flex-1 flex flex-col justify-between overflow-hidden border">
        <SpTable class="flex-1" :loading="loading" :columns="columns" :data="tableData" :show-index="true">
          <template #status>
            <el-table-column label="状态" min-width="80px" align="center" slot-name="status">
              <template #default="{ row }">
                <el-tag :type="row.status == 1 ? 'success' : 'danger'">{{ row.status == 1 ? '正常' : '禁用' }}</el-tag>
              </template>
            </el-table-column>
          </template>
        </SpTable>
        <div class="h-[40px] mt-10px">
          <Pagination v-model:total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="handleQuery" />
        </div>
      </div>
    </el-card>

    <RoleFormDialog v-model:visible="formVisible" v-model:is-edit="formIsEdit" v-model:form="formData" @confirm="onFormConfirm" />
    <PermissionAssignDrawer v-model:visible="drawerVisible" :role-id="drawerRoleId" :role-name="drawerRoleName" @refresh="handleQuery" />
  </div>
</template>

<script setup lang="ts">
import { ElMessageBox } from 'element-plus'
import { RoleAPI, type Role, type RoleQuery } from '@/api/system/permission/role'
import { createRoleColumns } from './components/roleColumns'
import RoleFormDialog from './components/RoleFormDialog.vue'
import PermissionAssignDrawer from './components/PermissionAssignDrawer.vue'

const queryFormRef = ref<any>(null)
const queryParams = reactive<RoleQuery>({ pageNum: 1, pageSize: 10 })
const tableData = ref<Role[]>([])
const total = ref(0)
const loading = ref(false)

const columns = createRoleColumns({
  onEdit(row) { openFormDialog(row) },
  onDelete(row) {
    ElMessageBox.confirm(`确认删除角色【${row.roleName}】？`, '警告', { type: 'warning' }).then(async () => {
      await RoleAPI.delete(row.id)
      ElMessage.success('删除成功')
      handleQuery()
    }).catch(() => {})
  },
  onAssignPerm(row) {
    drawerRoleId.value = row.id
    drawerRoleName.value = row.roleName
    drawerVisible.value = true
  },
})

const formVisible = ref(false)
const formIsEdit = ref(false)
const formData = ref<any>({ roleName: '', roleCode: '', description: '', status: 1 })

function openFormDialog(row?: any) {
  if (row) {
    formData.value = { ...row }
    formIsEdit.value = true
  } else {
    formData.value = { roleName: '', roleCode: '', description: '', status: 1 }
    formIsEdit.value = false
  }
  formVisible.value = true
}

async function onFormConfirm(form: any, isEdit: boolean) {
  const api = isEdit ? (d: any) => RoleAPI.update(form.id, d) : RoleAPI.insert
  await api(form)
  ElMessage.success(isEdit ? '更新成功' : '新增成功')
  formVisible.value = false
  handleQuery()
}

const drawerVisible = ref(false)
const drawerRoleId = ref(0)
const drawerRoleName = ref('')

async function handleQuery() {
  loading.value = true
  try {
    const res = await RoleAPI.page(queryParams)
    tableData.value = res.list || []
    total.value = res.total || 0
  } finally { loading.value = false }
}

function handleReset() {
  queryFormRef.value?.resetFields()
  queryParams.pageNum = 1
  queryParams.roleName = ''
  queryParams.status = undefined
  handleQuery()
}

onMounted(() => { handleQuery() })
</script>

<style lang="scss" scoped>
.el-card-main ::v-deep(.el-card__body) {
  height: calc(100% - 40px); display: flex; flex-direction: column; gap: 10px;
}
.table-toolbar { display: flex; justify-content: space-between; align-items: center; }
</style>
