<template>
  <el-container style="width: 100%; height: 100vh">
    <el-header>
      <div class="content">
        <Logo :collapse="isCollapse" />
        <left-menu class="menu-item" :base-path="basePath" :menu-list="menuList" :collapse="isCollapse"></left-menu>
        <NavRight />
      </div>
    </el-header>
    <el-main>
      <router-view />
    </el-main>
  </el-container>
</template>

<script setup lang="ts">
import LeftMenu from '@/layout/components/sideBar/LeftMenu.vue';
import Logo from '@/layout/components/logo/index.vue';
import NavRight from '@/layout/components/navigationBar/NavRight.vue';
import { usePermissionStore } from '@/store/modules/permission.ts';
import { useAppStore } from '@/store/modules/app.ts';
import { type RouteRecordRaw, useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import { computed } from 'vue';
import { MODULE_ROUTE_NAMES } from '@/config/modules';
const appStore = useAppStore();
const permissionStore = usePermissionStore();
const route = useRoute();
const { dynamicRoutes } = storeToRefs(permissionStore);

// 根据当前路由路径第一段匹配所属模块名
const currentModuleName = computed(() => {
  return MODULE_ROUTE_NAMES.find(name => route.path.startsWith('/' + name))
})

// 当前模块在 dynamicRoutes 中的完整路由记录
const currentModuleRoute = computed(() => {
  if (!currentModuleName.value) return undefined
  return dynamicRoutes.value.find((item: RouteRecordRaw) => item.name === currentModuleName.value)
})

// 侧边栏只展示当前模块的子路由（跳过模块本身那一级）
const menuList = computed(() => {
  return currentModuleRoute.value?.children;
});
const isCollapse = computed(() => !appStore.opened);
// 基础路径 = 当前模块的 path，用于拼接子路由的完整路径
const basePath = computed(() => {
  return currentModuleRoute.value?.path || '';
});
</script>

<style scoped lang="scss">
.content {
  display: flex;
  .menu-item {
    flex: 1;
  }
}
</style>
