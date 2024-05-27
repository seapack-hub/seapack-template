<template>
  <el-container style="width: 100vw;height:100vh">
    <el-header>
      <nav-bar></nav-bar>
    </el-header>
    <el-container>
      <el-aside>
        <left-menu :base-path="basePath" :menu-list="menuList"></left-menu>
      </el-aside>
      <el-container>
        <router-view></router-view>
      </el-container>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import {computed} from 'vue';
import NavBar from "@/layout/menuTab/components/navBar.vue";
import LeftMenu from "@/layout/components/sideBar/LeftMenu.vue";
//引入路由
import {usePermissionStore} from "@/store/modules/permission.ts";

const permissionStore = usePermissionStore();
const {dynamicRoutes} = storeToRefs(permissionStore);

//获取菜单列表
const menuList = computed(()=>dynamicRoutes.value);

//获取基础路径
const basePath = computed(()=>permissionStore.basePath)
</script>

<style scoped lang="scss">
</style>