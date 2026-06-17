<template>
  <el-card class="recent-alerts" shadow="hover">
    <template #header>
      <div class="card-header">
        <span class="card-title">最近告警</span>
        <el-button type="primary" link @click="router.push('/alertHistory')">
          查看全部 <el-icon><ArrowRight /></el-icon>
        </el-button>
      </div>
    </template>
    <el-table
      v-loading="loading"
      :data="alertList"
      stripe
      size="small"
      style="width: 100%"
      :header-cell-style="{ background: '#fafafa', color: '#606266', fontWeight: 500 }"
    >
      <el-table-column prop="stockCode" label="股票代码" width="100" />
      <el-table-column prop="triggeredRate" label="触发涨幅" width="100">
        <template #default="{ row }">
          <span :class="row.triggeredRate > 0 ? 'text-red' : 'text-green'">
            {{ row.triggeredRate > 0 ? '+' : '' }}{{ row.triggeredRate }}%
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="triggeredPrice" label="触发价格" width="100">
        <template #default="{ row }">
          ¥{{ row.triggeredPrice }}
        </template>
      </el-table-column>
      <el-table-column prop="sentTime" label="触发时间" min-width="140">
        <template #default="{ row }">
          {{ formatTime(row.sentTime) }}
        </template>
      </el-table-column>
    </el-table>
    <el-empty v-if="!loading && alertList.length === 0" description="暂无告警记录" :image-size="60" />
  </el-card>
</template>

<script setup lang="ts">
import { ArrowRight } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { AlertLogAPI, type AlertLogDto } from '@/api/system/alertLog'
import { useUserStore } from '@/store/modules/user'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)
const alertList = ref<AlertLogDto[]>([])

function formatTime(time: string) {
  if (!time) return '--'
  const d = new Date(time)
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${m}-${day} ${h}:${min}`
}

async function loadAlerts() {
  loading.value = true
  try {
    const res = await AlertLogAPI.listByUser({
      userId: userStore.userInfo.id,
      pageNum: 1,
      pageSize: 8,
    })
    alertList.value = res?.list ?? []
  } catch {
    alertList.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadAlerts()
})
</script>

<style lang="scss" scoped>
.recent-alerts {
  border-radius: 12px;
  border: none;
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
}

.text-red {
  color: #f56c6c;
  font-weight: 500;
}

.text-green {
  color: #67c23a;
  font-weight: 500;
}
</style>
