<template>
  <!--
    叶子路由：children 为 undefined（原始 RouteRecordRaw）或 []（RouteRecordNormalized）均视为无子路由
    使用 ?.length 兼容两种结构：undefined?.length → undefined → !undefined → true；[].length → 0 → !0 → true
  -->
  <template v-if="!item.children?.length">
    <Link :to="resolvePath(item.path)">
      <el-menu-item :index="resolvePath(item.path)">
        <SPIcon :name="item.meta?.icon" size="20px"></SPIcon>
        <template #title>
          <span class="menu-text">{{ item.meta?.description || '未知' }}</span>
        </template>
      </el-menu-item>
    </Link>
  </template>
  <template v-else>
    <el-sub-menu :index="resolvePath(item.path)">
      <template #title>
        <SPIcon :name="item.meta.icon" size="20px"></SPIcon>
        <span class="menu-text">{{ item.meta.description || '未知' }}</span>
      </template>
      <side-bar-item
        v-for="(step, index) in item.children"
        :key="index"
        :item="step"
        :base-path="resolvePath(item.path)"
      ></side-bar-item>
    </el-sub-menu>
  </template>
</template>

<script setup lang="ts">
import Link from './Link.vue';

const props = defineProps({
  basePath: {
    type: String,
    default: ''
  },
  item: {
    type: Object,
    default: () => {}
  }
});

function resolvePath(toPath: string): string {
  if (!toPath) return '';
  if (toPath.startsWith('/')) return toPath;
  if (props.basePath) {
    const base = props.basePath.endsWith('/') ? props.basePath.slice(0, -1) : props.basePath;
    return `${base}/${toPath}`;
  }
  return toPath;
}
</script>

<style scoped lang="scss">
.menu-text {
  margin-left: 10px;
}
</style>
