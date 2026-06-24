<template>
  <el-container style="width: 100vw; height: 100vh">
    <el-header>
      <div class="header-container">
        <div class="logo">
          <Logo :collapse="false" />
        </div>
        <div class="navigation-right">
          <NavigationBar />
        </div>
      </div>
    </el-header>
    <el-container>
      <el-aside>
        <left-menu class="menu-item" :base-path="basePath" :menu-list="menuList" :collapse="isCollapse"></left-menu>
      </el-aside>
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { NavigationBar} from '@/layout/components';
import Logo from '@/layout/components/logo/index.vue';
import { useAppStore } from '@/store/modules/app.ts';
import { usePermissionStore } from '@/store/modules/permission.ts';
import { computed } from 'vue';
import { type RouteRecordRaw, useRoute } from 'vue-router';
import LeftMenu from '@/layout/components/sideBar/LeftMenu.vue';
import { storeToRefs } from 'pinia';
import { MODULE_ROUTE_NAMES } from '@/config/modules';
const appStore = useAppStore();
const permissionStore = usePermissionStore();
const route = useRoute();
const { dynamicRoutes } = storeToRefs(permissionStore);
const isCollapse = computed(() => !appStore.opened);

// 根据当前路由路径第一段匹配所属模块名
const currentModuleName = computed(() => {
  return MODULE_ROUTE_NAMES.find(name => route.path.startsWith('/' + name))
})

// 当前模块在 dynamicRoutes 中的完整路由记录
const currentModuleRoute = computed(() => {
  if (!currentModuleName.value) return undefined
  return dynamicRoutes.value.find((item: RouteRecordRaw) => item.name === currentModuleName.value)
})

// 基础路径 = 当前模块的 path，用于拼接子路由的完整路径
const basePath = computed(() => {
  return currentModuleRoute.value?.path || '';
});

// 侧边栏只展示当前模块的子路由（跳过模块本身那一级）
const menuList = computed(() => {
  return currentModuleRoute.value?.children;
});

const sidebarWidth = computed(() => {
  return appStore.opened ? 'var(--sidebar-width)' : 'var(--sidebar-hide-width)';
});
</script>

<style scoped lang="scss">
.header-container {
  display: flex;
  justify-content: space-between;
  .logo {
    height: 100%;
    width: var(--sidebar-width);
  }
  .navigation-right {
    flex: 1;
  }
}
.el-aside {
  width: v-bind(sidebarWidth);
  //设置平滑过渡效果，监听宽度变化，平滑5秒
  transition-property: width;
  transition-duration: 0.5s;
}
</style>
