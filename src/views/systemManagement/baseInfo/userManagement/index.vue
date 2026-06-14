<template>
  <div class="app-container">
    <el-row :gutter="20" class="row-style">
      <!-- 左侧部门树 -->
      <el-col :span="4">
        <DeptTree v-model="queryParams.deptId" @node-click="handleQuery" />
      </el-col>
      <!-- 右侧用户列表 -->
      <el-col :span="20">
        <!-- 搜索栏 -->
        <div class="search-bar">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="关键字" prop="keywords">
              <el-input v-model="queryParams.keywords" placeholder="用户名/昵称/手机号" clearable style="width: 200px" @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="状态" prop="status">
              <el-select v-model="queryParams.status" placeholder="全部" clearable style="width: 150px">
                <el-option label="正常" value="1" />
                <el-option label="禁用" value="0" />
              </el-select>
            </el-form-item>
            <el-form-item label="创建时间">
              <el-date-picker v-model="timeArr" :editable="false" type="daterange" range-separator="~" start-placeholder="开始时间" end-placeholder="截止时间" value-format="YYYY-MM-DD" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="search" @click="handleQuery">搜索</el-button>
              <el-button icon="refresh" @click="handleResetQuery">重置</el-button>
            </el-form-item>
          </el-form>
        </div>

        <el-card shadow="never" class="el-card-main">
          <!-- 工具栏 -->
          <div class="table-toolbar">
            <div>
              <el-button type="success" icon="plus" @click="openFormDialog()">新增</el-button>
              <el-button type="danger" icon="delete" :disabled="selectIds.length === 0" @click="handleBatchDelete">删除</el-button>
            </div>
            <div>
              <el-button icon="download" @click="handleExport">导出</el-button>
            </div>
          </div>

          <!-- SpTable 表格 + 分页 -->
          <div class="table-wrapper">
            <SpTable :loading="loading" :columns="columns" :data="pageData" @selection-change="handleSelectionChange">
              <template #gender>
                <el-table-column label="性别" minWidth="70px" align="center" slotName="gender">
                  <template #default="{ row }">
                    <el-tag :type="row.gender == 1 ? 'success' : 'info'">{{ row.gender == 1 ? '男' : '女' }}</el-tag>
                  </template>
                </el-table-column>
              </template>
              <template #status>
                <el-table-column label="状态" minWidth="80px" align="center" slotName="status">
                  <template #default="{ row }">
                    <el-tag :type="row.status == 1 ? 'success' : 'danger'">{{ row.status == 1 ? '正常' : '禁用' }}</el-tag>
                  </template>
                </el-table-column>
              </template>
            </SpTable>
          </div>

          <div class="mt-10px">
            <Pagination v-if="total > 0" v-model:total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="handleQuery" />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <UserFormDialog v-model:visible="formVisible" v-model:isEdit="formIsEdit" v-model:form="formData" @confirm="onFormConfirm" />
  </div>
</template>

<script setup lang="ts">
import DeptTree from './components/DeptTree.vue'
import UserFormDialog from './components/UserFormDialog.vue'
import { createUserColumns } from './components/UserColumns'
import UserAPI, { type UserPageQuery, type UserPageVO } from '@/api/system/baseInfo/user.ts'
import { exportExcel, type ExportRequest } from '@/api/system/baseInfo/export'

const queryFormRef = ref<any>(null)
const queryParams = reactive<UserPageQuery>({ pageNum: 1, pageSize: 10 })
const pageData = ref<UserPageVO[]>([])
const total = ref(0)
const loading = ref(false)
const timeArr = ref<any>([])
const selectIds = ref<number[]>([])

const columns = createUserColumns({
  onEdit(row) { onEdit(row) },
  onDelete(row) {
    ElMessageBox.confirm(`确认删除用户【${row.userName}】？`, '警告', { type: 'warning' }).then(async () => {
      await UserAPI.delete(row.id)
      ElMessage.success('删除成功')
      handleQuery()
    }).catch(() => {})
  },
  onResetPwd(row) {
    ElMessageBox.prompt(`请输入用户【${row.userName}】的新密码`, '重置密码', {
      confirmButtonText: '确定', cancelButtonText: '取消',
    }).then(async ({ value }) => {
      if (!value || value.length < 6) { ElMessage.warning('密码至少需要6位字符'); return }
      await UserAPI.resetPassword(row.id, value)
      ElMessage.success('密码重置成功')
    }).catch(() => {})
  },
})

const formVisible = ref(false)
const formIsEdit = ref(false)
const defaultForm = { userName: '', password: '', confirmPassword: '', nickName: '', gender: '1', mobile: '', email: '', deptId: undefined, status: 1 }
const formData = ref<any>({ ...defaultForm })

function openFormDialog() {
  formData.value = { ...defaultForm }
  formIsEdit.value = false
  formVisible.value = true
}

function onEdit(row: any) {
  formData.value = { ...row, password: '', confirmPassword: '' }
  formIsEdit.value = true
  formVisible.value = true
}

async function onFormConfirm(form: any, isEdit: boolean) {
  const api = isEdit ? UserAPI.update : UserAPI.insert
  await api(form)
  ElMessage.success(isEdit ? '更新成功' : '新增成功')
  formVisible.value = false
  handleQuery()
}

function handleQuery() {
  loading.value = true
  if (timeArr.value && timeArr.value.length === 2) {
    queryParams.startTime = timeArr.value[0]
    queryParams.endTime = timeArr.value[1]
  } else {
    queryParams.startTime = ''
    queryParams.endTime = ''
  }
  UserAPI.getPage(queryParams).then((data) => {
    pageData.value = data.list
    total.value = data.total
  }).finally(() => { loading.value = false })
}

function handleResetQuery() {
  queryFormRef.value?.resetFields()
  queryParams.pageNum = 1
  queryParams.deptId = undefined
  queryParams.startTime = ''
  queryParams.endTime = ''
  timeArr.value = []
  handleQuery()
}

function handleSelectionChange(selection: any[]) {
  selectIds.value = selection.map((item) => item.id)
}

function handleBatchDelete() {
  if (!selectIds.value.length) { ElMessage.warning('请勾选删除项'); return }
  ElMessageBox.confirm('确认删除选中用户？', '警告', { type: 'warning' }).then(async () => {
    loading.value = true
    try {
      await UserAPI.deleteByIds(selectIds.value)
      ElMessage.success('删除成功')
      handleResetQuery()
    } finally { loading.value = false }
  }).catch(() => ElMessage.info('已取消删除'))
}

function handleExport() {
  const headers = [
    { label: '用户名', field: 'userName' },
    { label: '昵称', field: 'nickName' },
    { label: '性别', field: 'gender' },
    { label: '部门', field: 'deptName' },
    { label: '手机号', field: 'mobile' },
    { label: '状态', field: 'status' },
    { label: '创建时间', field: 'createTime' },
  ]
  exportExcel({
    fileName: '用户信息表',
    headers,
    dataList: (pageData.value || []).map(item => ({
      ...item,
      gender: item.gender == 1 ? '男' : '女',
      status: item.status == 1 ? '正常' : '停用',
    })),
  } as ExportRequest)
}

onMounted(() => { handleQuery() })
</script>

<style lang="scss" scoped>
.app-container {
  .row-style {
    height: calc(100vh - 130px);
    .el-card-main {
      height: calc(100% - 80px);
      display: flex;
      flex-direction: column;
      .table-toolbar {
        display: flex; justify-content: space-between; align-items: center;
      }
      .table-wrapper {
        flex: 1; margin-top: 10px; overflow: auto;
        :deep(.el-table__body-wrapper) { overflow-x: auto; }
      }
    }
  }
}
</style>
