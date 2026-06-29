<!--
  ProjectList —— 项目管理列表

  功能：
    1. SpTable 展示项目列表，支持关键字搜索/状态筛选
    2. 编辑/删除操作（删除带确认弹窗）
    3. Pagination 分页组件
-->
<template>
  <div class="app-container w-100% h-100% flex flex-col">
    <PageHeader title="项目管理" :edit="false" :back="false">
      <template #button>
        <el-button type="primary" icon="plus" @click="createProject">新增项目</el-button>
      </template>
    </PageHeader>

    <el-card class="search-card admin-card" shadow="never">
      <el-form :inline="true" @submit.prevent="search">
        <el-form-item label="名称">
          <el-input v-model="keyword" placeholder="搜索项目名称" clearable style="width: 220px" @clear="search" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="statusFilter" placeholder="全部状态" clearable style="width: 130px" @change="search">
            <el-option label="显示" :value="1" />
            <el-option label="隐藏" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="search" @click="search">搜索</el-button>
          <el-button icon="refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card admin-card flex-1 flex flex-col overflow-hidden" shadow="never">
      <div class="table-toolbar">
        <div class="toolbar-left">
          <span class="toolbar-title">项目列表</span>
          <el-tag type="info" size="small" effect="plain">共 {{ total }} 条</el-tag>
        </div>
        <div class="toolbar-right">
          <el-button type="primary" icon="plus" @click="createProject">新增项目</el-button>
          <el-button icon="refresh" circle @click="fetchData" />
        </div>
      </div>

      <div class="table-wrapper flex-1 overflow-hidden">
        <SpTable class="w-100% h-100%" :loading="loading" :columns="columns" :data="tableData" :show-index="true">
          <template #status>
            <el-table-column label="状态" min-width="80px" align="center" slot-name="status">
              <template #default="{ row }">
                <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small" effect="dark">
                  {{ row.status === 1 ? '显示' : '隐藏' }}
                </el-tag>
              </template>
            </el-table-column>
          </template>
          <template #colorPreview>
            <el-table-column label="图标颜色" min-width="100px" align="center" slot-name="colorPreview">
              <template #default="{ row }">
                <div class="flex justify-center items-center gap-6px">
                  <div class="color-dot" :style="{ background: row.color }" />
                  <span class="text-12px color-#909399">{{ row.color }}</span>
                </div>
              </template>
            </el-table-column>
          </template>
        </SpTable>
      </div>

      <div v-if="total > 0" class="h-[40px] mt-10px">
        <Pagination v-model:total="total" v-model:page="pageNum" v-model:limit="pageSize" @pagination="fetchData" />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ProjectAPI, type Project } from '@/api/blogs/project.ts'
import { ElMessageBox, ElMessage } from 'element-plus'

const router = useRouter()

// ===== 搜索筛选条件 =====
const keyword = ref('')
const statusFilter = ref<number | ''>('')
const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)

// ===== 表格数据 =====
const loading = ref(false)
const tableData = ref<Project[]>([])

// ===== SpTable 列定义 =====
const columns = reactive([
  { label: '项目名称', prop: 'name', minWidth: '180px', showOverflowTooltip: true },
  { label: '描述', prop: 'description', minWidth: '260px', showOverflowTooltip: true },
  { label: '图标', prop: 'icon', minWidth: '80px', align: 'center' },
  { slotName: 'colorPreview' },
  { label: '链接', prop: 'url', minWidth: '200px', showOverflowTooltip: true },
  { label: '排序', prop: 'sort', minWidth: '60px', align: 'center' },
  { slotName: 'status' },
  {
    columnType: 'operate', label: '操作', width: '150px', fixed: 'right',
    buttons: [
      { type: 'primary', label: '编辑', size: 'small', renderType: 'link', click: ({ row }: any) => editProject(row.id) },
      { type: 'danger', label: '删除', size: 'small', renderType: 'link', popconFirm: { title: '确定删除该项目吗？' }, click: ({ row }: any) => deleteProject(row.id) },
    ],
  },
])

/** 搜索 */
function search() {
  pageNum.value = 1
  fetchData()
}

/** 重置 */
function resetQuery() {
  keyword.value = ''
  statusFilter.value = ''
  pageNum.value = 1
  fetchData()
}

/** 获取项目列表 */
function fetchData() {
  loading.value = true
  ProjectAPI.getPage({
    pageNum: pageNum.value,
    pageSize: pageSize.value,
    keyword: keyword.value || undefined,
    status: statusFilter.value !== '' ? statusFilter.value : undefined,
  }).then((res) => {
    tableData.value = res.list || []
    total.value = res.total || 0
  }).finally(() => { loading.value = false })
}

/** 跳转新增 */
function createProject() {
  router.push({ name: 'projectCreate' })
}

/** 跳转编辑 */
function editProject(id: number) {
  router.push({ name: 'projectEdit', params: { id } })
}

/** 删除项目 */
function deleteProject(id: number) {
  ElMessageBox.confirm('确定删除该项目吗？', '提示', { type: 'warning' }).then(async () => {
    await ProjectAPI.delete(id)
    ElMessage.success('删除成功')
    fetchData()
  }).catch(() => {})
}

onMounted(() => { fetchData() })
</script>

<style scoped lang="scss">
@use '@/views/blogs/admin/styles/admin-common.scss' as *;

.app-container { padding: 20px; gap: 10px; box-sizing: border-box; }
.search-card :deep(.el-card__body) { padding: 16px 20px; }
.table-card :deep(.el-card__body) { height: 100%; display: flex; flex-direction: column; padding: 16px 20px 20px; }
.table-toolbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.table-toolbar .toolbar-left { display: flex; align-items: center; gap: 10px; }
.table-toolbar .toolbar-left .toolbar-title { font-size: 16px; font-weight: 600; color: var(--el-text-color-primary); }
.table-toolbar .toolbar-right { display: flex; align-items: center; gap: 10px; }
.table-wrapper { border-radius: 6px; border: 1px solid var(--el-border-color-lighter); overflow: hidden; }
.color-dot { width: 16px; height: 16px; border-radius: 50%; border: 1px solid var(--el-border-color-lighter); flex-shrink: 0; }
</style>
