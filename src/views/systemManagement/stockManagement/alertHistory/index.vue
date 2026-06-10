<template>
  <div class="page-container">
    <el-card shadow="never" class="flex-1 flex flex-col el-card-main">
      <!-- 搜索栏：股票 + 时间范围 -->
      <div class="search-bar h-[50px]">
        <el-form :model="query" :inline="true">
          <el-form-item label="股票">
            <el-select v-model="query.stockId" placeholder="全部" clearable style="width: 180px" filterable>
              <el-option v-for="s in stockCandidates" :key="s.stockId" :label="s.stockName" :value="s.stockId" />
            </el-select>
          </el-form-item>
          <el-form-item label="时间范围">
            <el-date-picker v-model="query.dateRange as any" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" style="width: 240px" value-format="YYYY-MM-DD" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="search" @click="handleQuery">搜索</el-button>
            <el-button icon="refresh" @click="handleReset">重置</el-button>
            <el-button icon="download" @click="handleExport">导出</el-button>
          </el-form-item>
        </el-form>
      </div>
      <!-- 表格主体 + 分页（只读，无操作列） -->
      <div class="flex-1 flex flex-col justify-between overflow-hidden border">
        <SpTable class="flex-1" :loading="loading" :columns="columns" :data="tableData" :showIndex="true" />
        <div class="h-[40px] mt-10px">
          <Pagination v-model:total="total" v-model:page="query.pageNum" v-model:limit="query.pageSize" @pagination="handleQuery" />
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { stockCandidates } from '../components/shared'
import { createAlertHistoryColumns } from '../components/columns'

/* ========== 查询参数 ========== */
const query = ref({ pageNum: 1, pageSize: 10, stockId: undefined, dateRange: [] })
const loading = ref(false)
const tableData = ref<any[]>([])
const total = ref(0)
const columns = createAlertHistoryColumns()

/* ========== 查询（Mock 数据） ========== */
function handleQuery() {
  loading.value = true
  setTimeout(() => {
    const data = [
      { id: 1, sentTime: '2026-04-15 09:35:00', stockName: '工商银行', triggeredRate: 5.12, triggeredPrice: 6.25, ruleDesc: '工商银行 - 股息率 >= 5.00%（邮件+短信）', notifyChannels: '邮件+短信', contacts: 'zhangsan@bank.com,13800138001' },
      { id: 2, sentTime: '2026-04-10 10:02:00', stockName: '中国神华', triggeredRate: 5.67, triggeredPrice: 42.18, ruleDesc: '中国神华 - 股息率 >= 5.50%（邮件）', notifyChannels: '邮件', contacts: 'wangwu@shenhua.com' },
      { id: 3, sentTime: '2026-04-08 14:20:00', stockName: '招商银行', triggeredRate: 4.88, triggeredPrice: 39.50, ruleDesc: '招商银行 - 股息率 >= 4.50%（邮件+短信）', notifyChannels: '邮件+短信', contacts: 'lisi@cmb.com,13800138002' },
      { id: 4, sentTime: '2026-04-05 09:40:00', stockName: '工商银行', triggeredRate: 5.03, triggeredPrice: 6.30, ruleDesc: '工商银行 - 股息率 >= 5.00%（邮件+短信）', notifyChannels: '邮件+短信', contacts: 'zhangsan@bank.com,13800138001' },
      { id: 5, sentTime: '2026-04-01 11:15:00', stockName: '海螺水泥', triggeredRate: 5.21, triggeredPrice: 23.56, ruleDesc: '海螺水泥 - 股息率 >= 5.00%（短信）', notifyChannels: '短信', contacts: '13800138003' },
      { id: 6, sentTime: '2026-03-28 09:30:00', stockName: '中国神华', triggeredRate: 6.04, triggeredPrice: 41.80, ruleDesc: '中国神华 - 股息率 >= 5.50%（邮件）', notifyChannels: '邮件', contacts: 'wangwu@shenhua.com' },
      { id: 7, sentTime: '2026-03-20 10:10:00', stockName: '招商银行', triggeredRate: 4.92, triggeredPrice: 39.80, ruleDesc: '招商银行 - 股息率 >= 4.50%（邮件+短信）', notifyChannels: '邮件+短信', contacts: 'lisi@cmb.com,13800138002' },
    ]
    tableData.value = data
    total.value = data.length
    loading.value = false
  }, 200)
}

const handleReset = () => { query.value = { pageNum: 1, pageSize: 10, stockId: undefined, dateRange: [] } as any; handleQuery() }

function handleExport() { ElMessage.success('告警记录已导出') }

onMounted(() => { handleQuery() })
</script>

<style lang="scss" scoped>
.page-container {
  height: 100%; width: 100%; display: flex; flex-direction: column; gap: 10px;
  background: #f5f7fa; box-sizing: border-box;
}
.el-card-main ::v-deep(.el-card__body){
  height: calc(100% - 40px);
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>
