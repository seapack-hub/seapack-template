<template>
  <div class="dashboard-container">
    <!--头部-->
    <DashboardTop />
    <!--数据统计-->
    <div class="statistics-module">
      <el-row :gutter="20">
        <el-col :span="12">
          <StatisticsModule :data-info="visitStatsVisit" />
        </el-col>
        <el-col :span="12">
          <StatisticsModule :data-info="visitStatsBrowse" />
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import DashboardTop from './components/DashboardTop.vue';
import StatisticsModule from './components/StatisticsModule.vue';
import { VisitStatsVO } from '@/api/types/log.ts';
//浏览数据
const visitStatsVisit = ref<VisitStatsVO>({
  todayUvCount: 261,
  uvGrowthRate: 20.75,
  totalUvCount: 11439,
  label:"访客数(UV)",
  icon:"visitor",
  title:"总访客数",
});
const visitStatsBrowse = ref<VisitStatsVO>({
  todayUvCount: 2075,
  uvGrowthRate: 18.57,
  totalUvCount: 183523,
  label:"浏览量(PV)",
  icon:"browser",
  title:"总浏览数",
});
</script>

<style lang="scss" scoped>
.dashboard-container {
  .statistics-module {
    margin-top: 20px;
  }
}
</style>
