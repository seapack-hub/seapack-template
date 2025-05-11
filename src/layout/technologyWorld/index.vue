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
    <el-footer>{{ $t('footer') }}</el-footer>
  </el-container>
</template>

<script setup lang="ts">
import NavBar from '@/layout/menuTab/components/navBar.vue';
</script>

<style scoped lang="scss"></style>
