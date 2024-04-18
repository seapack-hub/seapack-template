<template>
  <!--设置全屏-->
  <el-container>
    <el-header>
      <nav-bar></nav-bar>
    </el-header>
    <el-main>{{$t('mainBody')}}</el-main>
    <el-footer>{{$t('footer')}}</el-footer>
  </el-container>
</template>

<script setup lang="ts">
import navBar from "@/layout/menuTab/components/navBar.vue";
</script>

<style scoped lang="scss">
.el-container{
  width: 100vw;
  height: 100vh;

  //头部虚线
  .el-header{
    height: auto;
    box-shadow: 0 2px 4px 0 rgba(0, 21, 67, 0.04), inset 0px -1px 0px 0px #e7eaf0;
    overflow: hidden;
    min-width: 950px;
    z-index: 4;
  }
}
</style>