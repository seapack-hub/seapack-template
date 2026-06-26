<template>
  <div v-loading="loading" class="dividend-tab" element-loading-text="加载中...">
    <el-row :gutter="16">
      <el-col :span="12">
        <el-card shadow="never">
          <template #header><span class="card-title">历年分红走势</span></template>
          <baseCharts :options="dividendOpts" height="400px" />
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="never" class="list-card">
          <template #header><span class="card-title">分红明细</span></template>
          <SpTable :loading="loading" :columns="columns" :data="list" :show-index="false" max-height="400">
            <template #dividendType>
              <el-table-column label="分红类型" min-width="90px" align="center" slot-name="dividendType">
                <template #default="{ row }">
                  <el-tag :type="dividendTypeTagMap[row.dividendType] as any || 'primary'" size="small" effect="light">
                    {{ dividendTypeFmt(null, null, row.dividendType) }}
                  </el-tag>
                </template>
              </el-table-column>
            </template>
            <template #status>
              <el-table-column label="状态" min-width="80px" align="center" slot-name="status">
                <template #default="{ row }">
                  <span :class="['badge', dividendStatusClassMap[row.status] || 'badge-yellow']">
                    {{ statusShortFmt(null, null, row.status) }}
                  </span>
                </template>
              </el-table-column>
            </template>
          </SpTable>
          <el-empty v-if="!list.length" description="暂无分红数据" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { StockDividendAPI } from '@/api/system/stockDividend.ts'
import { createDividendDetailColumns } from '../../components/columns'
import { dividendTypeFmt, statusShortFmt, dividendTypeTagMap, dividendStatusClassMap, sharesFmt } from '../../components/shared'
import { buildDividendChartOption } from './detailShared'

const props = defineProps<{
  stockCode: string
}>()

const list = ref<any[]>([])
const loading = ref(false)

const columns = createDividendDetailColumns()
const dividendOpts = computed(() => buildDividendChartOption(list.value))

async function fetchData() {
  if (!props.stockCode) return
  loading.value = true
  try {
    const res = await StockDividendAPI.list({ stockCode: props.stockCode, pageNum: 1, pageSize: 999 })
    list.value = (res.list ?? []).map((d: any) => ({
      ...d,
      sharesText: sharesFmt(d.bonusSharesPer10, d.transferSharesPer10),
    }))
  } catch {
    list.value = []
  } finally {
    loading.value = false
  }
}

watch(() => props.stockCode, fetchData, { immediate: true })
</script>

<style lang="scss" scoped>
.dividend-tab { width: 100%; }
.card-title { font-size: 15px; font-weight: 600; color: #303133; }
.list-card { height: 100%; }
.badge {
  display: inline-block; padding: 0 6px; border-radius: 8px; font-size: 11px; line-height: 20px; font-weight: 500;
}
.badge-green { background: #e1f3d8; color: #14b143; }
.badge-blue { background: #ecf5ff; color: #409eff; }
.badge-yellow { background: #fdf6ec; color: #e6a23c; }
</style>
