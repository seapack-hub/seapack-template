<template>
  <div class="app-container w-100% h-100% flex flex-col">
    <div class="search-bar h-[50px]">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item label="股票代码" prop="stockCode">
          <el-input v-model="queryParams.stockCode" placeholder="模糊搜索" clearable style="width: 160px" @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker v-model="timeArr" :editable="false" type="daterange" range-separator="~" start-placeholder="开始时间" end-placeholder="截止时间" value-format="YYYY-MM-DD" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="search" @click="handleQuery">搜索</el-button>
          <el-button icon="refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-card class="el-card-main flex-1 flex flex-col gap-10 overflow-hidden" shadow="never">
      <div class="flex-1 flex flex-col justify-between overflow-hidden border">
        <SpTable class="flex-1" :loading="loading" :columns="columns" :data="tableData" :showIndex="true" />
        <div class="h-[40px] mt-10px">
          <Pagination v-model:total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="handleQuery" />
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { AlertLogAPI, type AlertLogDto } from '@/api/system/alertLog'
import { useUserStore } from '@/store/modules/user'

const userStore = useUserStore()
const queryFormRef = ref<any>(null)
const queryParams = reactive({ pageNum: 1, pageSize: 10, stockCode: '', userId: userStore.userInfo.id })
const timeArr = ref<any>([])
const tableData = ref<AlertLogDto[]>([])
const total = ref(0)
const loading = ref(false)

const columns = ref([
  { label: '触发时间', prop: 'sentTime', minWidth: '170px', align: 'center' },
  { label: '触发规则ID', prop: 'ruleId', minWidth: '100px', align: 'center' },
  { label: '触发股息率(%)', prop: 'triggeredRate', minWidth: '120px', align: 'right' },
  { label: '触发时股价', prop: 'triggeredPrice', minWidth: '110px', align: 'right' },
])

async function handleQuery() {
  loading.value = true
  try {
    const params: any = {
      userId: queryParams.userId,
      pageNum: queryParams.pageNum,
      pageSize: queryParams.pageSize,
      stockCode: queryParams.stockCode || undefined,
    }
    if (timeArr.value && timeArr.value.length === 2) {
      params.startTime = timeArr.value[0]
      params.endTime = timeArr.value[1]
    }
    const res = await AlertLogAPI.listByUser(params)
    tableData.value = res.list || []
    total.value = res.total || 0
  } catch {
    ElMessage.warning('告警日志接口暂不可用')
    tableData.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

function handleReset() {
  queryFormRef.value?.resetFields()
  queryParams.pageNum = 1
  queryParams.stockCode = ''
  timeArr.value = []
  handleQuery()
}

onMounted(() => { handleQuery() })
</script>

<style lang="scss" scoped>
.el-card-main ::v-deep(.el-card__body) {
  height: calc(100% - 40px);
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>
