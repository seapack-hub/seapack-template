<!-- ============================================================
  RecentAlerts 最近告警组件
  以表格形式展示当前用户的近期告警日志（股票代码、触发涨幅、触发价格、触发时间），
  支持加载状态和空数据显示，并提供"查看全部"跳转至告警历史页面。
  ============================================================ -->
<template>
  <el-card class="recent-alerts" shadow="hover">
    <!-- 卡片标题栏 -->
    <template #header>
      <div class="card-header">
        <span class="card-title">最近告警</span>
        <el-button type="primary" link @click="router.push({ name: 'alertHistory' })">
          查看全部 <el-icon><ArrowRight /></el-icon>
        </el-button>
      </div>
    </template>
    <!-- 告警表格：斑马纹、小尺寸 -->
    <el-table
      v-loading="loading"
      :data="alertList"
      stripe
      size="small"
      style="width: 100%"
      :header-cell-style="{ background: '#fafafa', color: '#606266', fontWeight: 500 }"
    >
      <!-- 股票代码列 -->
      <el-table-column prop="stockCode" label="股票代码" width="100" />
      <!-- 触发涨幅列：正值红色、负值绿色 -->
      <el-table-column prop="triggeredRate" label="触发涨幅" width="100">
        <template #default="{ row }">
          <span :class="row.triggeredRate > 0 ? 'text-red' : 'text-green'">
            {{ row.triggeredRate > 0 ? '+' : '' }}{{ row.triggeredRate }}%
          </span>
        </template>
      </el-table-column>
      <!-- 触发价格列 -->
      <el-table-column prop="triggeredPrice" label="触发价格" width="100">
        <template #default="{ row }">
          ¥{{ row.triggeredPrice }}
        </template>
      </el-table-column>
      <!-- 触发时间列 -->
      <el-table-column prop="sentTime" label="触发时间" min-width="140">
        <template #default="{ row }">
          {{ formatTime(row.sentTime) }}
        </template>
      </el-table-column>
    </el-table>
    <!-- 空数据占位 -->
    <el-empty v-if="!loading && alertList.length === 0" description="暂无告警记录" :image-size="60" />
  </el-card>
</template>

<script setup lang="ts">
import { ArrowRight } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { AlertLogAPI, type AlertLogDto } from '@/api/stockFund/stock/alertLog'
import { useUserStore } from '@/store/modules/user'

const router = useRouter()
const userStore = useUserStore()

/** 表格加载状态 */
const loading = ref(false)
/** 告警列表数据 */
const alertList = ref<AlertLogDto[]>([])

/**
 * 格式化时间为 MM-DD HH:mm 格式
 * @param time - ISO 时间字符串
 * @returns 格式化后的短时间字符串
 */
function formatTime(time: string) {
  if (!time) return '--'
  const d = new Date(time)
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${m}-${day} ${h}:${min}`
}

/**
 * 异步加载当前用户的最近告警列表（最多 8 条）
 */
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
    // 加载失败时清空列表
    alertList.value = []
  } finally {
    loading.value = false
  }
}

/** 组件挂载时自动加载数据 */
onMounted(() => {
  loadAlerts()
})
</script>

<style lang="scss" scoped>
/** 告警卡片：撑满高度 */
.recent-alerts {
  border-radius: 12px;
  border: none;
  height: 100%;
}

/** 卡片头部：标题居左，"查看全部"按钮居右 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/** 卡片标题 */
.card-title {
  font-size: 16px;
  font-weight: 600;
}

/** 涨幅正值：红色 */
.text-red {
  color: #f56c6c;
  font-weight: 500;
}

/** 涨幅负值：绿色 */
.text-green {
  color: #67c23a;
  font-weight: 500;
}
</style>
