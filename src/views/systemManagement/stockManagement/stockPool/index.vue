<template>
  <div class="page-container">
    <!-- ===== 左侧行业树 + 右侧表格 ===== -->
    <div class="flex-1 flex gap-10px overflow-hidden">
      <!-- 左侧：行业板块树形分类 -->
      <el-card shadow="never" class="tree-panel w-180px flex-shrink-0" :body-style="{ padding: '12px', height: '100%' }">
        <div class="font-bold text-15px mb-8px">行业板块</div>
        <el-input v-model="filterText" placeholder="搜索板块" clearable class="mb-8px" size="small" />
        <div class="tree-wrapper overflow-y-auto pb-20">
          <el-tree
            ref="treeRef"
            :data="industryTree"
            :props="{ children: 'children', label: 'label' }"
            node-key="id"
            default-expand-all
            highlight-current
            :filter-node-method="filterNode"
            @node-click="handleNodeClick"
          >
            <template #default="{ node, data }">
              <span class="flex items-center gap-4px text-14px">
                <span class="text-yellow-500 text-13px">&#9679;</span>
                <span>{{ node.label }}</span>
                <span class="text-gray-400 text-13px ml-auto">({{ data.count }})</span>
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
                <el-option label="沪市" value="SH" />
                <el-option label="深市" value="SZ" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="search" @click="handleQuery">搜索</el-button>
              <el-button icon="refresh" @click="handleReset">重置</el-button>
            </el-form-item>
          </el-form>
        </div>
        <!-- 工具栏 -->
        <div class="table-toolbar h-[50px] flex items-center justify-between">
          <div class="flex items-center gap-8px">
            <span class="text-15px font-bold">{{ currentTitle }}</span>
            <el-tag type="info" effect="plain" size="small">{{ total }} 只股票</el-tag>
          </div>
          <div class="flex gap-8px">
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
import { StockBasicAPI } from '@/api/system/stockNew'
import type { StockBasic } from '@/api/system/stockNew'
import { industryTree } from '../components/shared'
import { createStockPoolColumns } from '../components/columns'
import StockPoolFormDialog from '../components/StockPoolFormDialog.vue'
import StockPoolBatchDialog from '../components/StockPoolBatchDialog.vue'

/* ========== 行业树状态 ========== */
const filterText = ref('')
const treeRef = ref<any>(null)
const currentTitle = ref('全部分类')

/* ========== 查询参数 ========== */
const query = ref({ pageNum: 1, pageSize: 10, keywords: '', exchange: '', industry: '' })
const loading = ref(false)
const tableData = ref<StockBasic[]>([])
const total = ref(0)

/* 表格列配置（操作列回调绑定到当前页面逻辑） */
const columns = createStockPoolColumns({
  onEdit(row) { formData.value = { ...row }; formIsEdit.value = true; formVisible.value = true },
  async onDelete(row) { await StockBasicAPI.delete(row.stockId); ElMessage.success('删除成功'); handleQuery() },
})

/* ========== 表单弹框 ========== */
const formVisible = ref(false)
const formIsEdit = ref(false)
const formData = ref<any>({ stockCode: '', stockName: '', exchange: '', industry: '' })

function openFormDialog() { formVisible.value = true }

async function onFormConfirm(form: any, isEdit: boolean) {
  const api = isEdit ? StockBasicAPI.update : StockBasicAPI.insert
  await api(form)
  ElMessage.success(isEdit ? '更新成功' : '新增成功')
  formVisible.value = false
  handleQuery()
}

/* ========== 批量导入弹框 ========== */
const batchVisible = ref(false)
async function onBatchConfirm(codes: string[]) {
  await StockBasicAPI.batchImport(codes)
  ElMessage.success(`成功导入 ${codes.length} 只股票`)
  batchVisible.value = false
  handleQuery()
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

/* ========== Mock 数据 ========== */
const allMockData = [
  { code: '600519', name: '贵州茅台', ex: 'SH', ind: '食品饮料' },
  { code: '601398', name: '工商银行', ex: 'SH', ind: '银行' },
  { code: '600036', name: '招商银行', ex: 'SH', ind: '银行' },
  { code: '000858', name: '五粮液', ex: 'SZ', ind: '食品饮料' },
  { code: '600585', name: '海螺水泥', ex: 'SH', ind: '钢铁' },
  { code: '601088', name: '中国神华', ex: 'SH', ind: '煤炭' },
  { code: '000002', name: '万科A', ex: 'SZ', ind: '地产' },
  { code: '600900', name: '长江电力', ex: 'SH', ind: '电力' },
  { code: '601857', name: '中国石油', ex: 'SH', ind: '化工' },
  { code: '600028', name: '中国石化', ex: 'SH', ind: '化工' },
]

/* ========== 查询（带 Mock 降级） ========== */
const handleQuery = async () => {
  loading.value = true
  try {
    const res = await StockBasicAPI.getList(query.value)
    tableData.value = res.list; total.value = res.total
  } catch {
    const filtered = allMockData.filter(s => {
      if (query.value.keywords && !s.name.includes(query.value.keywords) && !s.code.includes(query.value.keywords)) return false
      if (query.value.exchange && s.ex !== query.value.exchange) return false
      if (query.value.industry && s.ind !== query.value.industry) return false
      return true
    })
    const start = (query.value.pageNum - 1) * query.value.pageSize
    tableData.value = filtered.slice(start, start + query.value.pageSize).map((s, i) => ({
      stockId: i + 1, stockCode: s.code, stockName: s.name, exchange: s.ex,
      industry: s.ind, createdAt: '2026-01-01 10:00:00',
    }))
    total.value = filtered.length
  } finally { loading.value = false }
}

const handleReset = () => {
  query.value = { pageNum: 1, pageSize: 10, keywords: '', exchange: '', industry: '' } as any
  currentTitle.value = '全部分类'
  handleQuery()
}

onMounted(() => { handleQuery() })
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
</style>
