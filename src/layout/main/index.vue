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
import NavBar from "@/layout/components/navigationBar/index.vue";
import SideBar from "@/layout/components/sideBar/index.vue";
import {useAppStore} from "@/store/modules/app.ts";
import {computed} from "vue";

const appStore = useAppStore();
const sidebarWidth = computed(()=>{
  return appStore.opened?"var(--sidebar-width)":"var(--sidebar-hide-width)"
})
</script>

<style scoped lang="scss">
.el-aside{
  width: v-bind(sidebarWidth);
  //设置平滑过渡效果，监听宽度变化，平滑5秒
  transition-property: width;
  transition-duration: 0.5s;
}
</style>