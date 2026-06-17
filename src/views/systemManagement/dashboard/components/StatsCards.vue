<!-- ============================================================
  StatsCards 统计卡片组件
  以网格卡片形式展��用户总数、角色数量、监控股票等核心业务指标，
  每项指标包含图标、数值、变动趋势（较昨日百分比）。
  ============================================================ -->
<template>
  <!-- 统计卡片响应式栅格布局：xs=2列, sm=3列, md=6列 -->
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
          <!-- 左侧：标签 + 数值 -->
          <div class="stats-info">
            <span class="stats-label">{{ item.label }}</span>
            <span class="stats-value" :style="{ color: item.color }">{{ item.value }}</span>
          </div>
          <!-- 右侧：彩色图标背景 -->
          <div class="stats-icon" :style="{ background: item.bgColor }">
            <SPIcon :name="item.icon" :size="28" :color="item.color" />
          </div>
        </div>
        <!-- 底部：趋势变化（红色上涨 / 绿色下跌） -->
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

/**
 * 统计卡片数据结构
 * @property key - 唯一标识
 * @property label - 指标名称（如"用户总数"）
 * @property value - 当前数值（默认 "--" 表示待加载）
 * @property icon - SPIcon 图标名称
 * @property color - 主题颜色（文字 + 图标色）
 * @property bgColor - 图标背景色（半透明）
 * @property trend - 较昨日变化百分比（正数上涨，负数下跌）
 */
interface StatsItem {
  key: string
  label: string
  value: string | number
  icon: string
  color: string
  bgColor: string
  trend: number
}

/** 统计卡片数据集，共 6 项核心指标 */
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
/**
 * 统计卡片样式：圆角、无边框、hover 微上移
 */
.stats-card {
  border-radius: 10px;
  border: none;
  margin-bottom: 16px;
  transition: transform 0.2s;
  &:hover {
    transform: translateY(-2px);
  }
}

/**
 * 卡片内部：左右 flex 分布
 */
.stats-inner {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

/**
 * 文字信息区域：纵向排列
 */
.stats-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/** 指标标签 */
.stats-label {
  font-size: 13px;
  color: #909399;
}

/** 指标数值：大号加粗 */
.stats-value {
  font-size: 26px;
  font-weight: 700;
}

/** 图标圆形背景容器 */
.stats-icon {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/** 底部趋势区域：上边框分隔 */
.stats-footer {
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  gap: 6px;
}

/** 趋势变化文字：红色 = 上涨，绿色 = 下跌 */
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

/** "较昨日" 辅助文字 */
.stats-desc {
  font-size: 12px;
  color: #c0c4cc;
}
</style>
