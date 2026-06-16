<template>
  <el-row :gutter="16">
    <el-col
      v-for="item in statsList"
      :key="item.key"
      :xs="12"
      :sm="8"
      :md="4"
    >
      <el-card
        class="stats-card"
        shadow="hover"
        :body-style="{ padding: '20px' }"
      >
        <div class="stats-inner">
          <div class="stats-info">
            <span class="stats-label">{{ item.label }}</span>
            <span class="stats-value" :style="{ color: item.color }">{{ item.value }}</span>
          </div>
          <div class="stats-icon" :style="{ background: item.bgColor }">
            <SPIcon :name="item.icon" :size="28" :color="item.color" />
          </div>
        </div>
        <div class="stats-footer">
          <span class="stats-change" :class="item.trend > 0 ? 'up' : 'down'">
            <el-icon v-if="item.trend > 0"><Top /></el-icon>
            <el-icon v-else><Bottom /></el-icon>
            {{ Math.abs(item.trend) }}%
          </span>
          <span class="stats-desc">较昨日</span>
        </div>
      </el-card>
    </el-col>
  </el-row>
</template>

<script setup lang="ts">
import { Top, Bottom } from '@element-plus/icons-vue'

interface StatsItem {
  key: string
  label: string
  value: string | number
  icon: string
  color: string
  bgColor: string
  trend: number
}

const statsList = ref<StatsItem[]>([
  { key: 'users', label: '用户总数', value: '--', icon: 'user', color: '#409eff', bgColor: 'rgba(64,158,255,0.1)', trend: 12.5 },
  { key: 'roles', label: '角色数量', value: '--', icon: 'role', color: '#67c23a', bgColor: 'rgba(103,194,58,0.1)', trend: 5.2 },
  { key: 'stocks', label: '监控股票', value: '--', icon: 'trend-charts', color: '#e6a23c', bgColor: 'rgba(230,162,60,0.1)', trend: -3.1 },
  { key: 'alerts', label: '今日告警', value: '--', icon: 'histogram', color: '#f56c6c', bgColor: 'rgba(245,108,108,0.1)', trend: 8.7 },
  { key: 'funds', label: '基金数量', value: '--', icon: 'fund', color: '#909399', bgColor: 'rgba(144,147,153,0.1)', trend: 2.0 },
  { key: 'depts', label: '部门总数', value: '--', icon: 'dept', color: '#9b59b6', bgColor: 'rgba(155,89,182,0.1)', trend: 0 },
])
</script>

<style lang="scss" scoped>
.stats-card {
  border-radius: 10px;
  border: none;
  margin-bottom: 16px;
  transition: transform 0.2s;
  &:hover {
    transform: translateY(-2px);
  }
}

.stats-inner {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.stats-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stats-label {
  font-size: 13px;
  color: #909399;
}

.stats-value {
  font-size: 26px;
  font-weight: 700;
}

.stats-icon {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stats-footer {
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  gap: 6px;
}

.stats-change {
  font-size: 13px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 2px;
  &.up {
    color: #f56c6c;
  }
  &.down {
    color: #67c23a;
  }
}

.stats-desc {
  font-size: 12px;
  color: #c0c4cc;
}
</style>
