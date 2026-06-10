<template>
  <el-card shadow="never" class="finance-card">
    <el-tabs v-model="activeTab" @tab-change="onTabChange">
      <el-tab-pane label="资产负债表" name="balance" lazy>
        <div class="tab-content">
          <baseCharts :options="balanceChartOpts" height="300px" />
          <div class="table-wrap">
            <SpTable :key="`bal-${k}`" :columns="balanceColumns" :data="data.balance" :show-empty="false" />
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane label="利润表" name="income" lazy>
        <div class="tab-content">
          <baseCharts :options="incomeChartOpts" height="300px" />
          <div class="table-wrap">
            <SpTable :key="`inc-${k}`" :columns="incomeColumns" :data="data.income" :show-empty="false" />
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane label="现金流量表" name="cashflow" lazy>
        <div class="tab-content">
          <baseCharts :options="cashflowChartOpts" height="300px" />
          <div class="table-wrap">
            <SpTable :key="`cf-${k}`" :columns="cashflowColumns" :data="data.cashflow" :show-empty="false" />
          </div>
        </div>
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
.finance-card { border-radius: 8px; }
.tab-content {
  display: flex; flex-direction: column; gap: 12px;
}
.table-wrap { max-height: 360px; overflow-y: auto; }
</style>
