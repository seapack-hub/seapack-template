<template>
  <div class="dashboard-container">
    <!-- 欢迎横幅 -->
    <WelcomeHeader />

    <!-- 统计卡片 -->
    <div class="section-gap">
      <StatsCards />
    </div>

    <!-- 快捷导航 -->
    <div class="section-gap">
      <QuickNav />
    </div>

    <!-- 告警 + 图表 -->
    <el-row :gutter="16" class="section-gap">
      <el-col :xs="24" :sm="24" :md="14">
        <RecentAlerts />
      </el-col>
      <el-col :xs="24" :sm="24" :md="10">
        <MiniCharts />
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import WelcomeHeader from './components/WelcomeHeader.vue'
import StatsCards from './components/StatsCards.vue'
import QuickNav from './components/QuickNav.vue'
import RecentAlerts from './components/RecentAlerts.vue'
import MiniCharts from './components/MiniCharts.vue'

</script>

<style lang="scss" scoped>
.dashboard-container {
  padding: 4px 0;
}

.section-gap {
  margin-top: 10px;
}
</style>
