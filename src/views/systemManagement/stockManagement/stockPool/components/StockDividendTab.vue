<template>
  <div class="dividend-tab">
    <el-row :gutter="16">
      <el-col :span="14">
        <el-card shadow="never">
          <template #header><span class="card-title">历年分红走势</span></template>
          <baseCharts :options="dividendOpts" height="400px" />
        </el-card>
      </el-col>
      <el-col :span="10">
        <el-card shadow="never" class="list-card">
          <template #header><span class="card-title">分红明细</span></template>
          <el-table :data="list" size="small" stripe max-height="400" style="width:100%">
            <el-table-column label="年度" prop="year" width="60" align="center" />
            <el-table-column label="类型" width="70" align="center">
              <template #default="{ row }">
                <el-tag :type="row.dividendType === 'FINAL' ? 'primary' : 'warning'" size="small" effect="light">
                  {{ row.dividendType === 'FINAL' ? '末期' : '中期' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="每股派息" width="90" align="right">
              <template #default="{ row }">
                <span class="cash">{{ row.cashPerShare?.toFixed(4) }} 元</span>
              </template>
            </el-table-column>
            <el-table-column label="送转" width="80" align="center">
              <template #default="{ row }">
                <span v-if="row.bonusSharesPer10 || row.transferSharesPer10" class="shares">
                  {{ row.bonusSharesPer10 ? `送${row.bonusSharesPer10}` : '' }}{{ row.transferSharesPer10 ? `转${row.transferSharesPer10}` : '' }}
                </span>
                <span v-else class="none">-</span>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="70" align="center">
              <template #default="{ row }">
                <span :class="['badge',
                  row.status === 'IMPLEMENTED' ? 'badge-green' :
                  row.status === 'APPROVED' ? 'badge-blue' : 'badge-yellow']">
                  {{ { PROPOSED: '预案', APPROVED: '已批', IMPLEMENTED: '实施' }[row.status] || row.status }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="除权日" width="100" align="center">
              <template #default="{ row }">{{ row.exDividendDate || '-' }}</template>
            </el-table-column>
          </el-table>
          <el-empty v-if="!list.length" description="暂无分红数据" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { StockDividendAPI } from '@/api/system/stockDividend'
import { useDividendDict } from '@/views/systemManagement/stockManagement/dividendData/components/useDividendDict'
import { buildDividendChartOption } from './detailShared'

const props = defineProps<{
  stockCode: string
}>()

const list = ref<any[]>([])
const loading = ref(false)

const dividendOpts = computed(() => buildDividendChartOption(list.value))

const { dictName, typeOpts, statusOpts, load: loadDict } = useDividendDict()

async function fetchData() {
  if (!props.stockCode) return
  loading.value = true
  try {
    const res = await StockDividendAPI.list({ stockCode: props.stockCode, pageNum: 1, pageSize: 999 })
    list.value = res.list ?? []
  } catch {
    list.value = []
  } finally {
    loading.value = false
  }
}

watch(() => props.stockCode, () => { fetchData(); loadDict() }, { immediate: true })
</script>

<style lang="scss" scoped>
.dividend-tab { width: 100%; }
.card-title { font-size: 15px; font-weight: 600; color: #303133; }
.list-card { height: 100%; }
.cash { color: #ef232a; font-weight: 600; }
.shares { color: #409eff; }
.none { color: #c0c4cc; }
.badge {
  display: inline-block; padding: 0 6px; border-radius: 8px; font-size: 11px; line-height: 20px; font-weight: 500;
}
.badge-green { background: #e1f3d8; color: #14b143; }
.badge-blue { background: #ecf5ff; color: #409eff; }
.badge-yellow { background: #fdf6ec; color: #e6a23c; }
</style>
