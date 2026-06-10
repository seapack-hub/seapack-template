<template>
  <div>
    <el-card shadow="never" class="info-card">
      <template #header><span class="card-title">标的概况</span></template>
      <el-row :gutter="24">
        <el-col :span="6" v-for="item in overview" :key="item.label">
          <div class="info-item">
            <span class="info-label">{{ item.label }}</span>
            <span class="info-value" :class="item.class">{{ item.value ?? '-' }}</span>
          </div>
        </el-col>
      </el-row>
    </el-card>
    <el-card shadow="never" class="info-card mt-16px">
      <template #header><span class="card-title">交易参数</span></template>
      <el-row :gutter="24">
        <el-col :span="6" v-for="item in trading" :key="item.label">
          <div class="info-item">
            <span class="info-label">{{ item.label }}</span>
            <span class="info-value" :class="item.class">{{ item.value ?? '-' }}</span>
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup lang="ts">
function fmtShares(v: number | undefined | null) {
  if (v == null) return '-'
  if (v >= 1e8) return (v / 1e8).toFixed(2) + ' 亿'
  if (v >= 1e4) return (v / 1e4).toFixed(2) + ' 万'
  return v.toLocaleString()
}

const props = defineProps<{ info: any }>()

const overview = computed(() => [
  { label: '股票代码', value: props.info.code },
  { label: 'Symbol', value: props.info.symbol },
  { label: '股票名称', value: props.info.name },
  { label: '交易所', value: props.info.exchange },
  { label: '标的类型', value: props.info.type },
  { label: '子类型', value: props.info.extType },
  { label: '地区', value: props.info.region },
  { label: '上市日期', value: props.info.listingDate },
])

const trading = computed(() => [
  { label: '总股本', value: fmtShares(props.info.totalShares) },
  { label: '流通股本', value: fmtShares(props.info.floatShares) },
  { label: '最小变动价位', value: props.info.tickSize != null ? `${props.info.tickSize} 元` : '-' },
  { label: '涨停价', value: props.info.limitUp != null ? `${props.info.limitUp} 元` : '-', class: 'up' },
  { label: '跌停价', value: props.info.limitDown != null ? `${props.info.limitDown} 元` : '-', class: 'down' },
])
</script>

<style lang="scss" scoped>
.card-title { font-size: 15px; font-weight: 600; color: #303133; }
.info-card { border-radius: 8px; }
.mt-16px { margin-top: 16px; }
.info-item {
  display: flex; flex-direction: column; gap: 4px; padding: 12px 0;
  .info-label { font-size: 12px; color: #909399; }
  .info-value {
    font-size: 16px; font-weight: 600; color: #303133;
    &.up { color: #f56c6c; }
    &.down { color: #67c23a; }
  }
}
</style>
