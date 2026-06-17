<!-- ============================================================
  Dashboard 工作台主页
  聚合展示系统核心指标、快捷入口、告警信息和图表数据，
  为用户提供一站式的管理概览视图。
  ============================================================ -->
<template>
  <!-- 工作台容器 -->
  <div class="dashboard-container">
    <!-- 欢迎横幅：展示用户头像、问候语、日期及快捷操作按钮 -->
    <WelcomeHeader />

    <!-- 统计卡片：展示用户总数、角色数量、监控股票等核心指标 -->
    <div class="section-gap">
      <StatsCards />
    </div>

    <!-- 快捷导航：系统各功能模块的快速跳转入口 -->
    <div class="section-gap">
      <QuickNav />
    </div>

    <!-- 底部区域：左侧告警列表 + 右侧迷你趋势图表 -->
    <el-row :gutter="16" class="section-gap">
      <!-- 最近告警表格 -->
      <el-col :xs="24" :sm="24" :md="14">
        <RecentAlerts />
      </el-col>
      <!-- 股票趋势 ECharts 图表 -->
      <el-col :xs="24" :sm="24" :md="10">
        <MiniCharts />
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
/**
 * Dashboard 主页组合式脚本
 * 引入五个子组件，按区块布局组成工作台整体页面
 */
import WelcomeHeader from './components/WelcomeHeader.vue'
import StatsCards from './components/StatsCards.vue'
import QuickNav from './components/QuickNav.vue'
import RecentAlerts from './components/RecentAlerts.vue'
import MiniCharts from './components/MiniCharts.vue'

</script>

<style lang="scss" scoped>
/**
 * 工作台容器：微调垂直内边距使整体布局紧凑
 */
.dashboard-container {
  padding: 4px 0;
}

/**
 * 区块间距：各子组件之间的垂直间隙
 */
.section-gap {
  margin-top: 10px;
}
</style>
