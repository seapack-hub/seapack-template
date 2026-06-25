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

// 根据当前路由路径第一段匹配所属模块名
const currentModuleName = computed(() => {
  return MODULE_ROUTE_NAMES.find(name => route.path.startsWith('/' + name))
})

// 当前模块在 dynamicRoutes 或 route.matched 中的完整路由记录
const currentModuleRoute = computed(() => {
  if (!currentModuleName.value) return undefined

  // 优先从 route.matched 中查找（Vue Router 自身维护的记录，保证 children 结构完整）
  const matched = route.matched
  for (let i = 0; i < matched.length; i++) {
    if (matched[i].name === currentModuleName.value) {
      return matched[i] as unknown as RouteRecordRaw
    }
  }

  // 降级：从 dynamicRoutes 中查找
  const fromDynamic = (dynamicRoutes.value as RouteRecordRaw[]).find(r => r.name === currentModuleName.value)
  return fromDynamic
})

// 侧边栏只展示当前模块的子路由（跳过模块本身那一级）
// dynamicRoutesLoaded 为 false 时返回空，避免 collectRoutes 尚未完成时错误渲染
const menuList = computed(() => {
  if (!permissionStore.dynamicRoutesLoaded) return []
  const children = (currentModuleRoute.value?.children as RouteRecordRaw[]) || []
  return filterVisibleRoutes(children, userStore.perms, userStore.username === 'admin');
});

// 基础路径 = 当前模块的 path，用于拼接子路由的完整路径
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
.debug-info {
  position: fixed;
  bottom: 0;
  left: 0;
  z-index: 9999;
  background: rgba(0,0,0,0.8);
  color: #0f0;
  font-size: 12px;
  padding: 8px;
  line-height: 1.5;
  font-family: monospace;
  white-space: pre-line;
}
</style>
