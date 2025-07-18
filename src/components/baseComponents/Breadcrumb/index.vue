<template>
  <el-breadcrumb separator="/">
    <el-breadcrumb-item v-for="(item, index) in breadcrumbs" :key="index">
      {{ item.meta.description }}
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { type RouteLocationMatched, useRoute } from 'vue-router';
import { useRouteListener } from '@/hooks/useRouteListener.ts';

const route = useRoute();
const { listenerRouteChange } = useRouteListener();
// 定义响应式数据，获取面包屑路由
const breadcrumbs = ref<RouteLocationMatched[]>([]);

/**
 * 获取面包屑导航信息
 */
const getBreadcrumb = () => {
  breadcrumbs.value = route.matched.filter((item) => item.meta?.description && item.meta?.breadcrumb !== false);
};

listenerRouteChange(() => {
  getBreadcrumb();
}, true);
</script>

<style scoped lang="scss">
.el-breadcrumb {
  padding-left: 15px;
}
</style>
