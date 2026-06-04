<template>
  <div class="page-container">
    <!-- ===== 左侧行业树 + 右侧表格 ===== -->
    <div class="flex-1 flex gap-10px overflow-hidden">
      <!-- 左侧：行业板块树形分类 -->
      <el-card shadow="never" class="tree-panel w-220px flex-shrink-0" :body-style="{ padding: '12px', height: '100%' }">
        <div class="font-bold text-15px mb-8px">行业板块</div>
        <el-input v-model="filterText" placeholder="搜索板块" clearable class="mb-8px" size="small" />
        <div class="tree-wrapper overflow-y-auto pb-20">
          <el-tree
            ref="treeRef"
            :data="industryTreeData"
            :props="{ children: 'children', label: 'label' }"
            node-key="id"
            default-expand-all
            highlight-current
            :filter-node-method="filterNode"
            @node-click="handleNodeClick"
          >
            <template #default="{ node }">
              <span class="flex items-center gap-4px text-14px">
                <span class="text-yellow-500 text-13px">&#9679;</span>
                <span>{{ node.label }}</span>
              </span>
            </template>
          </el-tree>
        </div>
      </el-card>

      <!-- 右侧：股票池表格 -->
      <el-card shadow="never" class="flex-1 flex flex-col overflow-hidden el-card-main">
        <!-- 搜索栏 -->
        <div class="search-bar h-[50px]">
          <el-form :model="query" :inline="true">
            <el-form-item label="关键字" prop="keywords">
              <el-input v-model="query.keywords" placeholder="股票代码/名称" clearable style="width: 200px" @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="交易所" prop="exchange">
              <el-select v-model="query.exchange" placeholder="全部" clearable style="width: 120px">
                <el-option v-for="item in exchangeOptions" :key="item.dictCode" :label="item.dictName" :value="item.dictCode" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="search" @click="handleQuery">搜索</el-button>
              <el-button icon="refresh" @click="handleReset">重置</el-button>
            </el-form-item>
          </el-form>
        </div>
        <!-- 工具栏 -->
        <div class="table-toolbar h-[50px] flex items-center">
          <div>
            <el-button type="success" icon="plus" @click="openFormDialog()">新增</el-button>
            <el-button icon="upload-filled" @click="batchVisible = true">批量导入</el-button>
          </div>
        </div>
        <!-- 表格主体 + 分页 -->
        <div class="flex-1 flex flex-col justify-between overflow-hidden border">
          <SpTable class="flex-1" :loading="loading" :columns="columns" :data="tableData" :showIndex="true" />
          <div class="h-[40px] mt-10px">
            <Pagination v-model:total="total" v-model:page="query.pageNum" v-model:limit="query.pageSize" @pagination="handleQuery" />
          </div>
        </div>
      </el-card>
    </div>

    <!-- 新增/编辑弹框 -->
    <StockPoolFormDialog v-model:visible="formVisible" v-model:isEdit="formIsEdit" v-model:form="formData" @confirm="onFormConfirm" />
    <!-- 批量导入弹框 -->
    <StockPoolBatchDialog v-model:visible="batchVisible" @confirm="onBatchConfirm" />
  </div>
</template>

<script setup lang="ts">
import { StockInfoAPI } from '@/api/system/stockPool'
import type { StockInfo } from '@/api/system/stockPool'
import { IndustrySectorAPI, type IndustrySector } from '@/api/system/industrySector'
import { getDictByType } from '@/api/system/dict'
import { createStockPoolColumns } from '../components/columns'
import StockPoolFormDialog from './components/StockPoolFormDialog.vue'
import StockPoolBatchDialog from './components/StockPoolBatchDialog.vue'

/* ========== 交易所字典 ========== */
const exchangeOptions = ref<any[]>([])

/* ========== 行业树状态 ========== */
const filterText = ref('')
const treeRef = ref<any>(null)
const currentTitle = ref('全部分类')
const industryTreeData = ref<any[]>([])

/* ========== 查询参数 ========== */
const query = ref({ pageNum: 1, pageSize: 10, keywords: '', exchange: '', industry: '' })
const loading = ref(false)
const tableData = ref<StockInfo[]>([])
const total = ref(0)

/* 表格列配置（操作列回调绑定到当前页面逻辑） */
const router = useRouter()

const columns = createStockPoolColumns({
  onDetail(row) { router.push({ path: '/stockPool/detail', query: { stockId: row.stockId } }) },
  onEdit(row) { formData.value = { ...row }; formIsEdit.value = true; formVisible.value = true },
  async onDelete(row) { await StockInfoAPI.delete(row.stockId); ElMessage.success('删除成功'); handleQuery() },
})

/* ========== 表单弹框 ========== */
const formVisible = ref(false)
const formIsEdit = ref(false)
const formData = ref<any>({ stockCode: '', stockName: '', exchange: '', industry: '' })

function openFormDialog() { formVisible.value = true }

async function onFormConfirm(form: any, isEdit: boolean) {
  const api = isEdit ? StockInfoAPI.update : StockInfoAPI.insert
  await api(form)
  ElMessage.success(isEdit ? '更新成功' : '新增成功')
  formVisible.value = false
  handleQuery()
}

/* ========== 批量导入弹框 ========== */
const batchVisible = ref(false)
async function onBatchConfirm(codes: string[]) {
  await Promise.all(codes.map(code => StockInfoAPI.insert({ stockCode: code })))
  ElMessage.success(`成功导入 ${codes.length} 只股票`)
  batchVisible.value = false
  handleQuery()
}

/* ========== 加载行业树 ========== */
/** 将 API 返回的 IndustrySector[] 转为 el-tree 所需格式 */
function toTreeNodes(list: IndustrySector[]): any[] {
  return list.map(n => ({
    id: n.id,
    label: n.label,
    children: n.children?.length ? toTreeNodes(n.children) : [],
  }))
}

/** 虚拟根节点 + 真实行业树 */
async function loadIndustryTree() {
  try {
    const res = await IndustrySectorAPI.getTree()
    const children = Array.isArray(res) ? toTreeNodes(res) : []
    industryTreeData.value = [{ id: 'all', label: '全部分类', children }]
  } catch {
    // 降级：使用静态树
    const { industryTree } = await import('../components/shared')
    industryTreeData.value = industryTree
  }
}

/* ========== 行业树操作 ========== */
function filterNode(value: string, data: any) {
  if (!value) return true
  return data.label.toLowerCase().includes(value.toLowerCase())
}

function handleNodeClick(data: any) {
  currentTitle.value = data.label
  query.value.industry = data.id === 'all' ? '' : data.id
  query.value.pageNum = 1
  handleQuery()
}

watch(filterText, (val) => { treeRef.value?.filter(val) })

/* ========== 查询（带 Mock 降级） ========== */
const handleQuery = async () => {
  loading.value = true
  try {
    const res = await StockInfoAPI.page(query.value)
    tableData.value = res.list; 
    total.value = res.total
  } catch(err) {
    console.log(err);
  } finally { 
    loading.value = false 
  }
}

const handleReset = () => {
  query.value = { pageNum: 1, pageSize: 10, keywords: '', exchange: '', industry: '' } as any
  currentTitle.value = '全部分类'
  handleQuery()
}

onMounted(async () => {
  try {
    const res = await getDictByType('exchange_type')
    exchangeOptions.value = Array.isArray(res) ? res : []
  } catch { /* 降级为空 */ }
  loadIndustryTree()
  handleQuery()
})
</script>

<style lang="scss" scoped>
.page-container {
  height: 100%; width: 100%; display: flex; flex-direction: column; gap: 10px;
  padding: 10px; background: #f5f7fa; box-sizing: border-box;
}
.tree-panel {
  border-radius: 8px;
  :deep(.el-card__body) { display: flex; flex-direction: column; }
  .tree-wrapper { flex: 1; overflow: auto; }
}
.table-toolbar { display: flex; justify-content: space-between; align-items: center; }
.el-card-main ::v-deep(.el-card__body){
  height: calc(100% - 40px);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* 全局滚动条美化 */
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background-color: rgba(156, 163, 175, 0.3); border-radius: 20px; border: 1px solid transparent; }
::-webkit-scrollbar-thumb:hover { background-color: rgba(156, 163, 175, 0.6); }
.tree-wrapper ::-webkit-scrollbar { width: 4px; }
</style>
