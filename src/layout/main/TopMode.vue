<template>
  <el-container style="width: 100vw;height:100vh">
    <el-header>
      <div>
        <Logo/>

      </div>
    </el-header>
    <el-main>
      <router-view/>
    </el-main>
  </el-container>
</template>

<script setup lang="ts">
import LeftMenu from "@/layout/components/sideBar/LeftMenu.vue";
import Logo from "@/layout/components/logo/index.vue"
</script>

<style scoped lang="scss">

</style>