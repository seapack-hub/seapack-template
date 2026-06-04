<template>
  <el-card shadow="never" class="finance-card">
    <template #header><span class="card-title">三大财务报表</span></template>
    <el-tabs v-model="activeTab" @tab-change="onTabChange">
      <el-tab-pane label="资产负债表" name="balance" lazy>
        <el-row :gutter="16">
          <el-col :span="14">
            <SpTable :key="`bal-${k}`" :columns="balanceColumns" :data="data.balance" :show-empty="false" />
          </el-col>
          <el-col :span="10">
            <baseCharts :options="balanceChartOpts" height="320px" />
          </el-col>
        </el-row>
      </el-tab-pane>
      <el-tab-pane label="利润表" name="income" lazy>
        <el-row :gutter="16">
          <el-col :span="14">
            <SpTable :key="`inc-${k}`" :columns="incomeColumns" :data="data.income" :show-empty="false" />
          </el-col>
          <el-col :span="10">
            <baseCharts :options="incomeChartOpts" height="320px" />
          </el-col>
        </el-row>
      </el-tab-pane>
      <el-tab-pane label="现金流量表" name="cashflow" lazy>
        <el-row :gutter="16">
          <el-col :span="14">
            <SpTable :key="`cf-${k}`" :columns="cashflowColumns" :data="data.cashflow" :show-empty="false" />
          </el-col>
          <el-col :span="10">
            <baseCharts :options="cashflowChartOpts" height="320px" />
          </el-col>
        </el-row>
      </el-tab-pane>
    </el-tabs>
  </el-card>
</template>

<script setup lang="ts">
import {
  balanceColumns, incomeColumns, cashflowColumns,
  buildBalanceChartOption, buildIncomeChartOption, buildCashflowChartOption,
} from './detailShared'

const props = defineProps<{
  data: { balance: any[]; income: any[]; cashflow: any[] }
}>()

const activeTab = ref('balance')
const k = ref(0)
function onTabChange() { k.value++ }

const balanceChartOpts = computed(() => buildBalanceChartOption(props.data.balance))
const incomeChartOpts = computed(() => buildIncomeChartOption(props.data.income))
const cashflowChartOpts = computed(() => buildCashflowChartOption(props.data.cashflow))
</script>

<style lang="scss" scoped>
.card-title { font-size: 15px; font-weight: 600; color: #303133; }
.finance-card { border-radius: 8px; }
</style>
