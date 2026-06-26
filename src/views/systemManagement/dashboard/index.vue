<!-- ============================================================
  Dashboard 工作台主页（系统管理）
  聚合展示系统管理核心指标、快捷入口、最近动态和系统状态，
  面向管理员提供一站式的系统管理概览。
  ============================================================ -->
<template>
  <!-- 工作台容器 -->
  <div class="dashboard-container">
    <!-- 欢迎横幅 -->
    <WelcomeHeader />

    <!-- 统计卡片：用户、角色、部门、菜单权限、字典、在线用户 -->
    <div class="section-gap">
      <StatsCards />
    </div>

    <!-- 快捷导航：系统管理功能入口 -->
    <div class="section-gap">
      <QuickNav />
    </div>

    <!-- 底部区域：左侧最近动态 + 右侧系统状态 -->
    <el-row :gutter="16" class="section-gap">
      <!-- 最近操作动态 -->
      <el-col :xs="24" :sm="24" :md="14">
        <RecentOperations />
      </el-col>
      <!-- 系统状态监控 -->
      <el-col :xs="24" :sm="24" :md="10">
        <SystemStatus />
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
/**
 * Dashboard 主页组合式脚本
 */
import WelcomeHeader from './components/WelcomeHeader.vue'
import StatsCards from './components/StatsCards.vue'
import QuickNav from './components/QuickNav.vue'
import RecentOperations from './components/RecentOperations.vue'
import SystemStatus from './components/SystemStatus.vue'

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
