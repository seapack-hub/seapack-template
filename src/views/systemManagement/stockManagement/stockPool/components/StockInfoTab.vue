<template>
  <!-- 基本信息卡片：股票核心指标展示 -->
  <el-card shadow="never" class="info-card">
    <template #header><span class="card-title">基本信息</span></template>
    <el-row :gutter="24">
      <el-col :span="6" v-for="item in fields" :key="item.label">
        <div class="info-item">
          <span class="info-label">{{ item.label }}</span>
          <span class="info-value" :class="item.class">{{ item.value ?? '-' }}</span>
        </div>
      </el-col>
    </el-row>
  </el-card>
</template>

<script setup lang="ts">
const props = defineProps<{ info: any }>()

const fields = computed(() => [
  { label: '股票代码', value: props.info.stockCode },
  { label: '股票名称', value: props.info.stockName },
  { label: '交易所', value: props.info.exchange },
  { label: '所属行业', value: props.info.industry },
  { label: '最新价', value: props.info.currentPrice, class: 'price' },
  { label: '涨跌幅', value: props.info.changePct != null ? `${props.info.changePct}%` : '-', class: props.info.changePct >= 0 ? 'up' : 'down' },
  { label: '每股股息', value: props.info.dividendPerShare ?? '-' },
  { label: '股息率', value: props.info.calculatedYield != null ? `${props.info.calculatedYield}%` : '-' },
])
</script>

<style lang="scss" scoped>
.card-title { font-size: 15px; font-weight: 600; color: #303133; }
.info-card { border-radius: 8px;
  .info-item {
    display: flex; flex-direction: column; gap: 4px; padding: 12px 0;
    .info-label { font-size: 12px; color: #909399; }
    .info-value {
      font-size: 16px; font-weight: 600; color: #303133;
      &.price { color: #e6a23c; font-size: 20px; }
      &.up { color: #f56c6c; }
      &.down { color: #67c23a; }
    }
  }
}
</style>
