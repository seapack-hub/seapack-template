<template>
  <el-container style="width: 100vw; height: 100vh">
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
import { type RouteRecordRaw } from 'vue-router';
import { storeToRefs } from 'pinia';
import { computed } from 'vue';
const appStore = useAppStore();
const permissionStore = usePermissionStore();
const { dynamicRoutes } = storeToRefs(permissionStore);

//获取菜单列表
const menuList = computed(() => {
  const list = dynamicRoutes.value.find((item: RouteRecordRaw) => item.name === 'systemManagement');
  return list?.children;
});
const isCollapse = computed(() => !appStore.opened);
// 基础路径从当前模块路由的 path 派生，供 SideBarItem 拼接相对子路径
const basePath = computed(() => {
  const route = dynamicRoutes.value.find((item: RouteRecordRaw) => item.name === 'systemManagement');
  return route?.path || '';
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
