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

const currentModuleName = computed(() => {
  return MODULE_ROUTE_NAMES.find(name => route.path.startsWith('/' + name))
})

const currentModuleRoute = computed(() => {
  if (!currentModuleName.value) return undefined
  return dynamicRoutes.value.find((item: RouteRecordRaw) => item.name === currentModuleName.value)
})

// 基础路径从当前模块路由的 path 派生，供 SideBarItem 拼接相对子路径
const basePath = computed(() => {
  return currentModuleRoute.value?.path || '';
});

//获取菜单列表（当前模块的子路由）
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
