<template>
  <div class="page-container">
    <el-card shadow="never" class="flex-1 flex flex-col el-card-main">
      <!-- 搜索栏 -->
      <div class="search-bar h-[50px]">
        <el-form :model="query" :inline="true">
          <el-form-item label="股票">
            <el-select v-model="query.stockId" placeholder="全部" clearable style="width: 180px" filterable>
              <el-option v-for="s in stockCandidates" :key="s.stockId" :label="s.stockName" :value="s.stockId" />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="query.isActive" placeholder="全部" clearable style="width: 110px">
              <el-option label="启用" :value="1" />
              <el-option label="停用" :value="0" />
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
        <span class="text-15px font-bold">监控规则配置</span>
        <el-button type="success" icon="plus" @click="openDialog()">新增规则</el-button>
      </div>
      <!-- 表格主体 + 分页 -->
      <div class="flex-1 flex flex-col justify-between overflow-hidden border">
        <SpTable class="flex-1" :loading="loading" :columns="columns" :data="tableData" :showIndex="true">
          <!-- 启用状态插槽：启用绿色 / 停用灰色 -->
          <template #isActive>
            <el-table-column label="状态" minWidth="80px" align="center" slotName="isActive">
              <template #default="{ row }">
                <span :class="row.isActive === 1 ? 'badge-on' : 'badge-off'">{{ row.isActive === 1 ? '启用' : '停用' }}</span>
              </template>
            </el-table-column>
          </template>
        </SpTable>
        <div class="h-[40px] mt-10px">
          <Pagination v-model:total="total" v-model:page="query.pageNum" v-model:limit="query.pageSize" @pagination="handleQuery" />
        </div>
      </div>
    </el-card>
    <!-- 新增/编辑规则弹框 -->
    <AlertRuleDialog v-model:visible="dialogVisible" v-model:isEdit="dialogIsEdit" v-model:form="dialogForm" @confirm="onDialogConfirm" />
  </div>
</template>

<script setup lang="ts">
import { stockCandidates } from '../components/shared'
import { createAlertRuleColumns } from '../components/columns'
import AlertRuleDialog from '../components/AlertRuleDialog.vue'

/* ========== 查询参数 ========== */
const query = ref({ pageNum: 1, pageSize: 10, stockId: undefined, isActive: undefined })
const loading = ref(false)
const tableData = ref<any[]>([])
const total = ref(0)

/* 弹框状态 */
const dialogVisible = ref(false)
const dialogIsEdit = ref(false)
const dialogForm = ref<any>({})

function openDialog() { dialogVisible.value = true }

/* 表格列配置（操作列回调绑定到当前页面逻辑） */
const columns = createAlertRuleColumns({
  onEdit(row) { dialogIsEdit.value = true; dialogForm.value = { ...row, channelList: row.notifyChannels?.split(',') || ['EMAIL'] }; dialogVisible.value = true },
  onToggle(row) { row.isActive = row.isActive === 1 ? 0 : 1; ElMessage.success(row.isActive === 1 ? '已启用' : '已停用') },
  onDelete(row) { tableData.value = tableData.value.filter((r: any) => r.id !== row.id); total.value--; ElMessage.success('删除成功') },
})

function onDialogConfirm(_form: any, isEdit: boolean) {
  ElMessage.success(isEdit ? '更新成功' : '新增成功')
  dialogVisible.value = false
  handleQuery()
}

/* ========== 查询（Mock 数据） ========== */
function handleQuery() {
  loading.value = true
  setTimeout(() => {
    const data = [
      { id: 1, stockName: '工商银行', thresholdRate: 5.00, notifyChannels: 'EMAIL,SMS', contacts: 'zhangsan@bank.com,13800138001', isActive: 1, createdAt: '2026-01-10 10:00:00' },
      { id: 2, stockName: '工商银行', thresholdRate: 6.00, notifyChannels: 'EMAIL', contacts: 'zhangsan@bank.com', isActive: 1, createdAt: '2026-01-10 10:05:00' },
      { id: 3, stockName: '招商银行', thresholdRate: 4.50, notifyChannels: 'EMAIL,SMS', contacts: 'lisi@cmb.com,13800138002', isActive: 1, createdAt: '2026-01-15 14:00:00' },
      { id: 4, stockName: '中国神华', thresholdRate: 5.50, notifyChannels: 'EMAIL', contacts: 'wangwu@shenhua.com', isActive: 0, createdAt: '2026-02-01 09:30:00' },
      { id: 5, stockName: '海螺水泥', thresholdRate: 5.00, notifyChannels: 'SMS', contacts: '13800138003', isActive: 1, createdAt: '2026-02-10 11:00:00' },
    ]
    tableData.value = data
    total.value = data.length
    loading.value = false
  }, 200)
}

const handleReset = () => { query.value = { pageNum: 1, pageSize: 10, stockId: undefined, isActive: undefined } as any; handleQuery() }

onMounted(() => { handleQuery() })
</script>

<style lang="scss" scoped>
.el-card-main ::v-deep(.el-card__body){
  height: calc(100% - 40px);
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.page-container {
  height: 100%; width: 100%; display: flex; flex-direction: column; gap: 10px;
  background: #f5f7fa; box-sizing: border-box;
}
.table-toolbar { display: flex; justify-content: space-between; align-items: center; }

/* 启用状态标签 */
:deep(.badge-on) { display: inline-block; padding: 0 8px; border-radius: 10px; font-size: 12px; line-height: 22px; background: #e1f3d8; color: #67c23a; font-weight: 500; }
:deep(.badge-off) { display: inline-block; padding: 0 8px; border-radius: 10px; font-size: 12px; line-height: 22px; background: #f4f4f5; color: #909399; font-weight: 500; }
</style>
