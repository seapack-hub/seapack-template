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
      return matched[i] as any
    }
  }

  // 降级：从 dynamicRoutes 中查找
  const fromDynamic = (dynamicRoutes.value as any[]).find((r: any) => r.name === currentModuleName.value)
  return fromDynamic
})

// 侧边栏只展示当前模块的子路由（跳过模块本身那一级）
const menuList = computed(() => {
  const children = (currentModuleRoute.value?.children as any[]) || []
  return filterVisibleRoutes(children, userStore.menuPermKeys, userStore.username === 'admin');
});

// 基础路径 = 当前模块的 path，用于拼接子路由的完整路径
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
