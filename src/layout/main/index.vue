<template>
  <el-container style="width: 100vw;height:100vh">
    <el-header>
      <nav-bar></nav-bar>
    </el-header>
    <el-container>
      <el-aside>
        <left-menu></left-menu>
      </el-aside>
      <el-container>
        <router-view></router-view>
      </el-container>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import NavBar from "@/layout/menuTab/components/navBar.vue";
import LeftMenu from "@/layout/components/sideBar/LeftMenu.vue";

</script>

<style scoped lang="scss">

</style>