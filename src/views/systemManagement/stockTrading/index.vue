<template>
  <!-- 股票看板：大盘指数 + 行业分类树 + 股票综合信息表 -->
  <div class="stock-dashboard h-100% w-100% flex flex-col gap-10px p-10px bg-[#f5f7fa] box-border scroll-smooth">
    <!-- ========== 顶部：大盘指数卡片 ========== -->
    <el-row :gutter="10" class="market-indices">
      <el-col :span="4" v-for="item in marketIndices" :key="item.code">
        <el-card shadow="hover" :body-style="{ padding: '8px 12px' }" class="index-card">
          <div class="flex items-center justify-between">
            <span class="text-12px text-gray-400">{{ item.name }}</span>
            <!-- 涨跌百分比标签 -->
            <el-tag :type="item.change >= 0 ? 'danger' : 'success'" size="small" effect="dark" class="!border-0">
              {{ item.change >= 0 ? '+' : '' }}{{ item.changePct }}%
            </el-tag>
          </div>
          <div class="flex items-baseline gap-6px mt-4px">
            <span class="text-20px font-bold font-mono">{{ item.price }}</span>
            <!-- 涨跌点数 -->
            <span class="text-12px" :class="item.change >= 0 ? 'text-red' : 'text-green'">
              {{ item.change >= 0 ? '+' : '' }}{{ item.change }}
            </span>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- ========== 中下部：左侧行业树 + 右侧表格 ========== -->
    <div class="flex-1 flex gap-10px overflow-hidden">
      <!-- ===== 左侧：行业板块树形分类 ===== -->
      <el-card shadow="never" class="tree-panel w-220px flex-shrink-0" :body-style="{ padding: '12px', height: '100%' }">
        <div class="font-bold text-16px mb-8px">行业板块</div>
        <!-- 板块搜索过滤 -->
        <el-input v-model="filterText" placeholder="搜索板块" clearable class="mb-8px" />
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
              <span class="flex items-center gap-4px text-15px">
                <span class="text-yellow-500 text-14px">&#9679;</span>
                <span>{{ node.label }}</span>
                <span class="text-gray-400 text-14px ml-auto">({{ data.count }})</span>
              </span>
            </template>
          </el-tree>
        </div>
      </el-card>

      <!-- ===== 右侧：股票综合信息表格 ===== -->
      <el-card shadow="never" class="el-card-main flex-1 flex flex-col">
        <!-- 工具栏：标题 + 搜索 + 操作按钮 -->
        <div class="flex items-center justify-between gap-10px mb-10px flex-shrink-0">
          <div class="flex items-center gap-8px">
            <span class="text-16px font-bold">{{ currentTitle }}</span>
            <el-tag  type="info" effect="plain">{{ total }} 只股票</el-tag>
          </div>
          <div class="flex items-center gap-8px">
            <el-input v-model="queryParams.keywords" placeholder="搜索股票/代码" clearable  style="width: 180px" prefix-icon="search" @input="debouncedSearch" @keyup.enter="handleQuery" />
            <el-select v-model="queryParams.exchange" placeholder="交易所" clearable style="width: 110px">
              <el-option v-for="opt in exchangeOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
            </el-select>
            <el-button type="primary"  icon="search" @click="handleQuery">搜索</el-button>
            <el-button icon="refresh" @click="handleReset">重置</el-button>
            <el-button type="success"  icon="plus" @click="dialogVisible = true">新增</el-button>
          </div>
        </div>

        <!-- 股票表格主体 -->
        <div class="flex-1 flex flex-col justify-between overflow-hidden border">
          <SpTable class="flex-1" :loading="loading" :columns="overviewColumns" :data="tableData" :showIndex="true">
            <!-- 股息率插槽：根据数值范围显示不同颜色 -->
            <template #calculatedYield>
              <el-table-column label="股息率" minWidth="100px" align="center" slotName="calculatedYield">
                <template #default="{ row }">
                  <span :class="['yield-tag', yieldLevelClass(row.calculatedYield)]">{{ row.calculatedYield.toFixed(2) }}%</span>
                </template>
              </el-table-column>
            </template>
            <!-- 监控状态插槽：开启绿色 / 关闭灰色 -->
            <template #isActive>
              <el-table-column label="监控状态" minWidth="80px" align="center" slotName="isActive">
                <template #default="{ row }">
                  <span :class="['status-tag', row.isActive === 1 ? 'status-on' : 'status-off']">{{ row.isActive === 1 ? '开启' : '关闭' }}</span>
                </template>
              </el-table-column>
            </template>
          </SpTable>
          <!-- 底部分页栏 -->
          <div class="h-[40px] mt-10px">
            <Pagination v-model:total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="handleQuery" />
          </div>
        </div>
      </el-card>
    </div>

    <!-- ========== 新增/编辑股票弹框 ========== -->
    <StockDialog
      v-model:visible="dialogVisible"
      v-model:isEdit="dialogIsEdit"
      v-model:form="dialogForm"
      @confirm="onDialogConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { debounce } from 'lodash-es'
import StockAPI from '@/api/system/stock'
import { createOverviewColumns } from './components/columns'
import { marketIndices, industryTree, exchangeOptions, generateMockStockData } from './components/utils'
import StockDialog from './components/StockDialog.vue'

// ========== 查询参数 ==========
const queryParams = ref({ pageNum: 1, pageSize: 10, keywords: '', exchange: '', industry: 'all' })
// 表格加载状态
const loading = ref(false)
// 表格数据列表
const tableData = ref<any[]>([])
// 数据总条数
const total = ref(0)

// ========== 行业树 ==========
// 树形过滤关键词
const filterText = ref('')
const treeRef = ref<any>(null)
// 当前选中的行业名称（表格标题用）
const currentTitle = ref('全部分类')
// 当前选中的行业 ID
const currentIndustry = ref('all')
// ========== 弹框 ==========
const dialogVisible = ref(false)
const dialogIsEdit = ref(false)
const dialogForm = ref({ id: undefined, stockCode: '', stockName: '', exchange: '' })

/** 弹框确认回调 */
function onDialogConfirm(formData: any, isEdit: boolean) {
  const api = isEdit ? StockAPI.update : StockAPI.insert
  api(formData).then(() => {
    ElMessage.success(isEdit ? '更新成功' : '新增成功')
    dialogVisible.value = false
    handleQuery()
  })
}

// ========== 股息率颜色分级 ==========
/** 根据股息率数值返回对应的 CSS 类名 */
const yieldLevelClass = (val: number) => {
  if (val >= 5) return 'yield-green'   // ≥ 5% → 绿色
  if (val >= 4) return 'yield-blue'    // ≥ 4% → 蓝色
  if (val >= 3) return 'yield-yellow'  // ≥ 3% → 黄色
  return 'yield-gray'                   // < 3% → 灰色
}

// ========== 表格列配置 ==========
const overviewColumns = createOverviewColumns({
  /** 编辑按钮回调：打开弹框并回填数据 */
  onEdit(row: any) {
    dialogIsEdit.value = true
    Object.assign(dialogForm.value, row)
    dialogVisible.value = true
  },
  /** 删除按钮回调 */
  async onDelete(row: any) {
    await StockAPI.delete(row.id)
    ElMessage.success('删除成功')
    handleQuery()
  },
})

// ========== 行业树操作 ==========
/** 树节点过滤（搜索板块） */
const filterNode = (value: string, data: any) => {
  if (!value) return true
  return data.label.toLowerCase().includes(value.toLowerCase())
}

/** 点击树节点：切换行业分类并重新查询 */
const handleNodeClick = (data: any) => {
  currentTitle.value = data.label
  currentIndustry.value = data.id
  queryParams.value.industry = data.id
  queryParams.value.pageNum = 1
  handleQuery()
}

/** 监听过滤关键词变化，实时过滤树节点 */
watch(filterText, (val) => { treeRef.value?.filter(val) })

// ========== 数据查询 ==========
/** 防抖搜索（输入时 400ms 防抖） */
const debouncedSearch = debounce(() => {
  queryParams.value.pageNum = 1
  handleQuery()
}, 400)

/** 查询股票列表 */
const handleQuery = async () => {
  loading.value = true
  try {
    await new Promise(r => setTimeout(r, 200))
    const res = generateMockStockData(
      queryParams.value.industry,
      queryParams.value.pageNum,
      queryParams.value.pageSize,
      queryParams.value.keywords,
    )
    tableData.value = res.list
    total.value = res.total
  } finally { loading.value = false }
}

/** 重置查询条件 */
const handleReset = () => {
  queryParams.value = { pageNum: 1, pageSize: 10, keywords: '', exchange: '', industry: currentIndustry.value }
  handleQuery()
}

onMounted(() => { handleQuery() })
onUnmounted(() => { debouncedSearch.cancel() })
</script>

<style lang="scss" scoped>
.stock-dashboard {
  .index-card {
    transition: all 0.25s;
    &:hover { transform: translateY(-3px); box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
  }
  .tree-panel {
    border-radius: 8px;
    :deep(.el-card__body) { display: flex; flex-direction: column; }
    .tree-wrapper { flex: 1; overflow: auto; }
  }
  .table-panel { border-radius: 8px; }
}
.text-green { color: #19be6b; }
.text-red { color: #ed4014; }

/* 股息率标签基础样式 */
:deep(.yield-tag) {
  display: inline-block;
  padding: 0 8px;
  border-radius: 4px;
  font-weight: 600;
  font-size: 13px;
  line-height: 22px;
}
/* 股息率颜色分级 */
:deep(.yield-green)  { background: #e1f3d8; color: #67c23a; }
:deep(.yield-blue)   { background: #ecf5ff; color: #409eff; }
:deep(.yield-yellow) { background: #fdf6ec; color: #e6a23c; }
:deep(.yield-gray)   { background: #f4f4f5; color: #909399; }

/* 监控状态标签样式 */
:deep(.status-tag) {
  display: inline-block;
  padding: 0 10px;
  border-radius: 10px;
  font-size: 12px;
  line-height: 22px;
  font-weight: 500;
}
:deep(.status-on)  { background: #e1f3d8; color: #67c23a; }
:deep(.status-off) { background: #f4f4f5; color: #909399; }

:deep(.el-table__body-wrapper) { overflow-x: auto; }

/* 全局滚动条美化 */
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background-color: rgba(156, 163, 175, 0.3); border-radius: 20px; border: 1px solid transparent; }
::-webkit-scrollbar-thumb:hover { background-color: rgba(156, 163, 175, 0.6); }
.tree-wrapper ::-webkit-scrollbar { width: 4px; }

.el-card-main ::v-deep(.el-card__body){
  height: calc(100% - 40px);
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>
