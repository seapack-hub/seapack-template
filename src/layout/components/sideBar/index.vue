<template>
  <div class="side-bar">
    <Logo :collapse="isCollapse"></Logo>
    <left-menu :base-path="basePath" :menu-list="menuList" :collapse="isCollapse"></left-menu>
  </div>
</template>

<script setup lang="ts">
import LeftMenu from '@/layout/components/sideBar/LeftMenu.vue';
import Logo from '@/layout/components/logo/index.vue';
import { type RouteRecordRaw, useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import { computed } from 'vue';
import { usePermissionStore } from '@/store/modules/permission.ts';
import { useUserStore } from '@/store/modules/user.ts';
import { useAppStore } from '@/store/modules/app.ts';
import { filterVisibleRoutes } from '@/utils/routeUtils.ts';
import { MODULE_ROUTE_NAMES } from '@/config/modules';

const appStore = useAppStore();
const permissionStore = usePermissionStore();
const userStore = useUserStore();
const route = useRoute();
const { dynamicRoutes } = storeToRefs(permissionStore);

const currentModuleName = computed(() => {
  return MODULE_ROUTE_NAMES.find(name => route.path.startsWith('/' + name))
})

const currentModuleRoute = computed(() => {
  if (!currentModuleName.value) return undefined
  return (dynamicRoutes.value as RouteRecordRaw[]).find(r => r.name === currentModuleName.value)
})

const menuList = computed(() => {
  const children = (currentModuleRoute.value?.children as RouteRecordRaw[]) || []
  return filterVisibleRoutes(children, userStore.perms, userStore.username === 'admin');
});

const basePath = computed(() => {
  return currentModuleRoute.value?.path || ''
})

const isCollapse = computed(() => !appStore.opened);
</script>

<style scoped lang="scss">
.side-bar {
  height: 100%;
  background-color: var(--sidebar-menu-bg-color);
  width: 100%;
  .logo-title {
    color: var(--sidebar-menu-text-color);
    width: 100%;
    text-align: center;
    margin: 0 auto;
    height: 60px;
    font-size: 30px;
    line-height: 60px;
  }
}
</style>
