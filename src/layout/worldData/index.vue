<template>
  <el-container style="width: 100vw; height: 100vh">
    <el-aside width="collapse">
      <Logo :collapse="isCollapse"></Logo>
      <LeftMenu :base-path="basePath" :menu-list="menuList" :collapse="isCollapse"></LeftMenu>
    </el-aside>
    <el-container>
      <el-header>
        <NavigationBar />
      </el-header>
      <el-container>
        <router-view></router-view>
      </el-container>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed } from 'vue';
import { NavigationBar,Logo } from '@/layout/components';
import LeftMenu from '@/layout/components/sideBar/LeftMenu.vue';
import { usePermissionStore } from '@/store/modules/permission.ts';
import { useUserStore } from '@/store/modules/user.ts';
import { useAppStore } from '@/store/modules/app.ts';
import { filterVisibleRoutes } from '@/utils/routeUtils.ts';
import { MODULE_ROUTE_NAMES } from '@/config/modules';
import { useRoute } from 'vue-router';

const permissionStore = usePermissionStore();
const userStore = useUserStore();
const route = useRoute();
const { dynamicRoutes } = storeToRefs(permissionStore);

const appStore = useAppStore();
const isCollapse = computed(() => !appStore.opened);

const currentModuleName = computed(() => {
  return MODULE_ROUTE_NAMES.find(name => route.path.startsWith('/' + name))
})

const currentModuleRoute = computed(() => {
  if (!currentModuleName.value) return undefined
  return (dynamicRoutes.value as any[]).find((r: any) => r.name === currentModuleName.value)
})

const menuList = computed(() => {
  const children = (currentModuleRoute.value?.children as any[]) || []
  return filterVisibleRoutes(children, userStore.perms, userStore.username === 'admin');
});

const basePath = computed(() => {
  return currentModuleRoute.value?.path || ''
})

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
  transition-property: width;
  transition-duration: 0.5s;
  background-color: var(--sidebar-menu-bg-color);
}
</style>
