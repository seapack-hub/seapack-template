<template>
  <!--设置全屏-->
  <el-container style="width: 100vw; height: 100vh">
    <el-header>
      <nav-bar></nav-bar>
    </el-header>
    <el-main>
      <router-view v-slot="{ Component }">
        <component :is="Component"></component>
      </router-view>
    </el-main>
    <!-- <el-footer>{{$t('footer')}}</el-footer> -->
  </el-container>
</template>

<script setup lang="ts">
import navBar from '@/layout/menuTab/components/navBar.vue';
</script>

<style scoped lang="scss">
.el-container {
  .el-header {
    box-shadow:
      0 1px 1px 0 rgba(0, 21, 67, 0.04),
      inset 0px -1px 0px 0px #888889;
  }
  .el-main {
    background-image: url('@/assets/images/gameKing.jpg');
    background-size: 100% 100%;
  }
}
.el-main,
.el-header {
  padding: 0;
}
</style>
