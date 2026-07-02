<!--
  ArticleList —— 文章管理列表

  功能：
    1. SpTable 展示文章列表，支持搜索/分类筛选/状态筛选
    2. 编辑/删除操作（删除带确认弹窗）
    3. Pagination 分页组件
-->
<template>
  <div class="app-container w-100% h-100% flex flex-col">
    <!-- 页面标题 -->
    <PageHeader title="文章管理" :edit="false" :back="false"></PageHeader>

    <!-- 搜索栏 -->
    <el-card class="search-card admin-card" shadow="never">
      <el-form :inline="true" :model="queryForm" @submit.prevent="search">
        <el-form-item label="标题">
          <el-input v-model="keyword" placeholder="搜索文章标题" clearable style="width: 220px" @clear="search" />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="categoryFilter" placeholder="全部分类" clearable style="width: 150px" @change="search">
            <el-option v-for="c in categories" :key="c.dictCode" :label="c.dictName" :value="c.dictCode" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="statusFilter" placeholder="全部状态" clearable style="width: 130px" @change="search">
            <el-option label="已发布" :value="1" />
            <el-option label="草稿" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="search" @click="search">搜索</el-button>
          <el-button icon="refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格 -->
    <el-card class="table-card admin-card flex-1 flex flex-col overflow-hidden" shadow="never">
      <div class="table-toolbar">
        <div class="toolbar-left">
          <span class="toolbar-title">文章列表</span>
          <el-tag type="info" size="small" effect="plain">共 {{ total }} 条</el-tag>
        </div>
        <div class="toolbar-right">
          <el-button type="primary" icon="plus" @click="createArticle">写文章</el-button>
          <el-button icon="refresh" circle @click="fetchData" />
        </div>
      </div>

      <div class="table-wrapper flex-1 overflow-hidden">
        <SpTable class="w-100% h-100%" :loading="store.loading" :columns="columns" :data="store.articles" :show-index="true">
          <template #category>
            <el-table-column label="分类" min-width="100px" align="center" slot-name="category">
              <template #default="{ row }">
                <el-tag size="small" effect="light">{{ categoriesMap[row.category] || row.category || '-' }}</el-tag>
              </template>
            </el-table-column>
          </template>
          <template #tag>
            <el-table-column label="标签" min-width="90px" align="center" slot-name="tag">
              <template #default="{ row }">
                <el-tag v-if="row.tag" :type="row.tagType || 'primary'" size="small" effect="light">{{ row.tag }}</el-tag>
                <span v-else class="text-[#c0c4cc]">-</span>
              </template>
            </el-table-column>
          </template>
          <template #status>
            <el-table-column label="状态" min-width="80px" align="center" slot-name="status">
              <template #default="{ row }">
                <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small" effect="dark">
                  {{ row.status === 1 ? '已发布' : '草稿' }}
                </el-tag>
              </template>
            </el-table-column>
          </template>
          <template #isTop>
            <el-table-column label="置顶" min-width="70px" align="center" slot-name="isTop">
              <template #default="{ row }">
                <el-tag v-if="row.isTop" type="warning" size="small" effect="dark">置顶</el-tag>
                <span v-else class="text-[#c0c4cc]">-</span>
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
import { useBlogStore } from '@/store/modules/blog.ts'
import { CategoryAPI, type BlogCategory } from '@/api/blogs/category.ts'
import { ElMessageBox, ElMessage } from 'element-plus'
import { ARTICLE_LIST_COLUMNS } from '../utils/tableColumns'

const store = useBlogStore()
const router = useRouter()

// 仅用于 el-form 的 model 绑定
const queryForm = reactive({})

// ===== 搜索筛选条件 =====
const keyword = ref('')
const categoryFilter = ref('')
const statusFilter = ref<number | ''>('')
const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)

// ===== 分类字典（从系统 dict 表加载） =====
const categories = ref<BlogCategory[]>([])
const categoriesMap = ref<Record<string, string>>({})

// ===== SpTable 列定义（基础列 + 操作列） =====
const columns = reactive([
  ...ARTICLE_LIST_COLUMNS,
  {
    columnType: 'operate', label: '操作', width: '150px', fixed: 'right',
    buttons: [
      { type: 'primary', label: '编辑', size: 'small', renderType: 'link', click: ({ row }: any) => editArticle(row.id) },
      { type: 'danger', label: '删除', size: 'small', renderType: 'link', popconFirm: { title: '确定删除该文章吗？' }, click: ({ row }: any) => deleteArticle(row.id) },
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
  categoryFilter.value = ''
  statusFilter.value = ''
  pageNum.value = 1
  fetchData()
}

/** 获取文章列表 */
function fetchData() {
  store.fetchArticles({
    pageNum: pageNum.value,
    pageSize: pageSize.value,
    category: categoryFilter.value || undefined,
    keyword: keyword.value || undefined,
    status: statusFilter.value !== '' ? statusFilter.value : undefined,
  }).then(() => { total.value = store.total })
}

/** 跳转写文章 */
function createArticle() {
  router.push({ name: 'articleCreate' })
}

/** 跳转编辑页 */
function editArticle(id: number) {
  router.push({ name: 'articleEdit', params: { id } })
}

/** 删除文章（确认弹窗） */
function deleteArticle(id: number) {
  ElMessageBox.confirm('确定删除该文章吗？', '提示', { type: 'warning' }).then(async () => {
    await store.deleteArticle(id)
    ElMessage.success('删除成功')
    fetchData()
  }).catch(() => {})
}

onMounted(async () => {
  const cats = await CategoryAPI.getList()
  categories.value = cats || []
  cats?.forEach(c => { categoriesMap.value[c.dictCode] = c.dictName })
  fetchData()
})
</script>

<style scoped lang="scss">
@use '@/views/blogs/styles/admin-common.scss' as *;

.app-container { 
  padding: 20px; 
  gap: 10px; 
  box-sizing: border-box;
}
.search-card {
  :deep(.el-card__body) { padding: 16px 20px; }
}
.table-card {
  :deep(.el-card__body) {
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 16px 20px 20px;
  }
}
.table-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  .toolbar-left {
    display: flex;
    align-items: center;
    gap: 10px;
    .toolbar-title {
      font-size: 16px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }
  }
  .toolbar-right {
    display: flex;
    align-items: center;
    gap: 10px;
  }
}
.table-wrapper {
  border-radius: 6px;
  border: 1px solid var(--el-border-color-lighter);
  overflow: hidden;
}
</style>
