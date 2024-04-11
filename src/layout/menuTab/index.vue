<template>
  <!--设置全屏-->
  <el-container>
    <el-header>
      <nav-bar></nav-bar>
    </el-header>
    <el-main>主体</el-main>
    <el-footer>尾部</el-footer>
  </el-container>
</template>

<script setup lang="ts">
import navBar from "@/layout/menuTab/components/navBar.vue";
</script>

<style scoped lang="scss">
.el-container{
  width: 100vw;
  height: 100vh;

  .el-header{
    height: auto;
  }
}
</style>