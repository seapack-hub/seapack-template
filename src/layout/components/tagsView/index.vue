<template>
  <div class="tags-view-container">
    <ScrollPane class="tags-view-wrapper">
      <RouterLink
        v-for="(tag, index) in tagsViewStore.visitedViews"
        :key="index"
        :to="tag.path"
        class="tags-view-item"
        :class="{ active: isActive(tag) }"
        @contextmenu.prevent="openMenu(tag, $event)"
      >
        {{ tag.meta?.description }}
        <el-icon v-if="!isAffix(tag)" size="12" @click.prevent.stop="closeSelectedTag(tag)">
          <Close />
        </el-icon>
      </RouterLink>
    </ScrollPane>
    <ul v-show="visible" class="contextmenu" :style="{ left: left + 'px', top: top + 'px' }">
      <li @click="refreshSelectedTag(selectedTag)">刷新</li>
      <li v-if="!isAffix(selectedTag)" @click="closeSelectedTag(selectedTag)">关闭</li>
      <li @click="closeOtherTag">关闭其他</li>
      <li @click="closeAllTags(selectedTag)">关闭所有</li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { getCurrentInstance, onMounted, ref, watch } from 'vue';
import { type RouteLocationNormalized, type RouteRecordRaw, RouterLink, useRoute, useRouter } from 'vue-router';
import { type TagsView, useTagsViewStore } from '@/store/modules/tags-view.ts';
import { usePermissionStore } from '@/store/modules/permission.ts';
import { useRouteListener } from '@/hooks/useRouteListener.ts';
import ScrollPane from '@/layout/components/tagsView/ScrollPane.vue';
import { Close } from '@element-plus/icons-vue';
import path from 'path-browserify';
const route = useRoute();
const router = useRouter();
const tagsViewStore = useTagsViewStore();
const permissionStore = usePermissionStore();
const { listenerRouteChange } = useRouteListener();
/** getCurrentInstance() 是 Vue 3 中的一个函数，
 * 用于获取当前正在执行的 Vue 组件实例的上下文信息。
 * 这是一个非常有用的工具，因为它允许你访问组件的属性、方法以及其他相关信息。
 */
//const instance = getCurrentInstance();
/** 右侧菜单的状态 **/
const visible = ref(false);
/** 右键菜单的top位置 **/
const top = ref(0);
/** 右键菜单的left位置 **/
const left = ref(0);
/** 正在右键操作的标签页 **/
const selectedTag = ref<TagsView>({});
/** 固定的标签页 **/
let affixTags: TagsView[] = [];

/**
 * 判断标签页是否固定
 */
const isAffix = (tag: TagsView) => {
  return tag.meta?.affix;
};
/**
 * 筛选出固定标签页
 * @param routes
 * @param basePath
 */
const filterAffixTags = (routes: RouteRecordRaw[], basePath = '/') => {
  const tags: TagsView[] = [];
  routes.forEach((route) => {
    if (isAffix(route)) {
      const tagPath = path.resolve(basePath, route.path);
      tags.push({
        fullPath: tagPath,
        path: tagPath,
        name: route.name,
        meta: { ...route.meta }
      });
    }
    if (route.children) {
      const childTags = filterAffixTags(route.children, route.path);
      tags.push(...childTags);
    }
  });
  return tags;
};

/**
 * 初始化标签页
 */
const initTags = () => {
  affixTags = filterAffixTags(permissionStore.routes);
  for (const tag of affixTags) {
    tag.name && tagsViewStore.addVisitedView(tag);
  }
};

/**
 * 添加标签页
 * @param route
 */
const addTags = (route: RouteLocationNormalized) => {
  if (route.name) {
    tagsViewStore.addVisitedView(route);
    tagsViewStore.addCacheView(route);
  }
};

/**
 * 导航到最后一个标签页
 * @param visitedViews
 * @param view
 */
const toLastView = (visitedViews: TagsView[], view: TagsView) => {
  //获取最后一个标签页,slice 返回一个索引和另一个索引之间的数据(不改变原数组)
  const lastView = visitedViews.slice(-1)[0];
  const fullPath = lastView?.fullPath;
  //路径存在则，跳转
  if (fullPath !== undefined) {
    router.push(fullPath);
  } else {
    // 如果路径全部都关闭了，重定向到主页
    // 重新加载主页
    router.push({ path: '/redirect' + view.path, query: view.query });
  }
};
/**
 * 关闭当前点击的标签页
 * @param view
 */
const closeSelectedTag = (view: TagsView) => {
  tagsViewStore.delVisitedView(view);
  tagsViewStore.delCachedView(view);
  isActive(view) && toLastView(tagsViewStore.visitedViews, view);
};

/**
 * 打开右键面板
 * @param tag
 * @param e
 */
const openMenu = (tag: TagsView, e: MouseEvent) => {
  left.value = e.clientX;
  top.value = e.clientY;
  // 显示面板
  visible.value = true;
  // 更新当前正在右键操作的标签页
  selectedTag.value = tag;
};

/**
 * 判断标签页是否激活
 * @param view
 */
const isActive = (view: TagsView) => {
  return view.path === route.path;
};

/** 关闭右键菜单面板 */
const closeMenu = () => {
  visible.value = false;
};

/**
 * 刷新
 * @param view
 */
const refreshSelectedTag = (view: TagsView) => {
  tagsViewStore.delCachedView(view);
  router.replace({ path: view.path, query: view.query });
};

/**
 * 关闭其他标签页
 */
const closeOtherTag = () => {
  const fullPath = selectedTag.value.fullPath;
  if (fullPath != route.path && fullPath !== undefined) {
    router.push(fullPath);
  }
  tagsViewStore.delOtherVisitedViews(selectedTag.value);
  tagsViewStore.delOtherCachedViews(selectedTag.value);
};

/**
 * 关闭所有标签页
 * @param view
 */
const closeAllTags = (view: TagsView) => {
  tagsViewStore.delAllVisitedView();
  tagsViewStore.delAllCachedView();
  //如果活跃中的是固定标签页，不用导航到最后一页
  if (affixTags.some((tag) => tag.path === route.path)) return;
  toLastView(tagsViewStore.visitedViews, view);
};

watch(visible, (value) => {
  value ? document.body.addEventListener('click', closeMenu) : document.body.removeEventListener('click', closeMenu);
});

onMounted(() => {
  initTags();
  listenerRouteChange(async (route) => {
    addTags(route);
  }, true);
});
</script>

<style scoped lang="scss">
.tags-view-container {
  height: var(--tags-view-height);
  width: 100%;
  .tags-view-wrapper {
    .tags-view-item {
      display: inline-block;
      position: relative;
      cursor: pointer;
      height: 26px;
      line-height: 26px;
      color: var(--tags-view-text-color);
      border: 1px solid var(--tags-view-tag-border-color);
      border-radius: 2px;
      background-color: var(--tags-view-tag-bg-color);
      padding: 0 8px 0 4px;
      font-size: 12px;
      text-decoration: none;
      margin-left: 5px;
      margin-top: 4px;
      &:first-of-type {
        margin-left: 5px;
      }
      &:last-of-type {
        margin-right: 5px;
      }
      &.active {
        background-color: var(--tags-view-tag-active-bg-color);
        color: var(--tags-view-tag-active-text-color);
        border-color: var(--tags-view-tag-active-border-color);
      }
      .el-icon {
        border-radius: 50%;
        margin-top: -2px;
        vertical-align: middle;
        &:hover {
          background-color: var(--tags-view-tag-icon-hover-bg-color);
          color: var(--tags-view-tag-icon-hover-color);
        }
      }
    }
  }

  .contextmenu {
    margin: 0;
    z-index: 3000;
    position: absolute;
    list-style-type: none;
    padding: 5px 0;
    border-radius: 4px;
    font-size: 12px;
    color: var(--tags-view-contextmenu-text-color);
    background-color: var(--tags-view-contextmenu-bg-color);
    box-shadow: var(--tags-view-contextmenu-box-shadow);
    li {
      margin: 0;
      padding: 7px 16px;
      cursor: pointer;
      &:hover {
        color: var(--tags-view-contextmenu-hover-text-color);
        background-color: var(--tags-view-contextmenu-hover-bg-color);
      }
    }
  }
}
</style>
