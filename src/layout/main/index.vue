<template>
  <el-container style="width: 100vw;height:100vh">
    <el-aside>
      <side-bar/>
    </el-aside>
    <el-container>
      <el-header>
        <nav-bar/>
      </el-header>
      <el-main>
        <router-view/>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import NavBar from "@/layout/menuTab/components/navBar.vue";
import SideBar from "@/layout/components/sideBar/index.vue";
</script>

<style scoped lang="scss">
</style>