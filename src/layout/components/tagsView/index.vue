<!--
  tagsView —— 多标签导航栏

  功能：
    1. 显示当前模块已访问的页面标签，支持点击切换、关闭、刷新
    2. 按模块分组存储标签，切换模块时只显示当前模块的标签
    3. 右键菜单提供"刷新 / 关闭 / 关闭其他 / 关闭所有"操作
    4. 固定标签（affix）按所属模块分组，只注入当前模块且不可关闭

  模块分组机制：
    - visitedViews 按模块名（路由路径第一段）分组存储在 moduleVisitedViews 中
    - 切换模块时通过 switchModule() 切换当前展示的标签组
    - 关闭操作只影响当前模块的标签
-->
<template>
  <div class="tags-view-container">
    <!-- 当前模块名称标识 -->
    <div v-if="moduleLabel" class="module-label">{{ moduleLabel }}</div>
    <ScrollPane class="tags-view-wrapper">
      <!-- 遍历当前模块的已访问标签页 -->
      <RouterLink
        v-for="(tag, index) in displayViews"
        :key="index"
        :to="tag.path || ''"
        class="tags-view-item"
        :class="{ active: isActive(tag) }"
        @contextmenu.prevent="openMenu(tag, $event)"
      >
        {{ tag.meta?.description }}
        <!-- 非固定标签显示关闭按钮 -->
        <el-icon v-if="!isAffix(tag)" size="12" @click.prevent.stop="closeSelectedTag(tag)">
          <Close />
        </el-icon>
      </RouterLink>
    </ScrollPane>
    <!-- 右键菜单 -->
    <ul v-show="visible" class="contextmenu" :style="{ left: left + 'px', top: top + 'px' }">
      <li @click="refreshSelectedTag(selectedTag)">刷新</li>
      <li v-if="!isAffix(selectedTag)" @click="closeSelectedTag(selectedTag)">关闭</li>
      <li @click="closeOtherTag">关闭其他</li>
      <li @click="closeAllTags(selectedTag)">关闭所有</li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { type RouteLocationNormalized, type RouteRecordRaw, RouterLink, useRoute, useRouter } from 'vue-router';
import { type TagsView, useTagsViewStore } from '@/store/modules/tags-view.ts';
import { usePermissionStore } from '@/store/modules/permission.ts';
import { useRouteListener } from '@/hooks/useRouteListener.ts';
import ScrollPane from '@/layout/components/tagsView/ScrollPane.vue';
import { Close } from '@element-plus/icons-vue';
import path from 'path-browserify';
import { MODULE_DEFS } from '@/config/modules';

const route = useRoute();
const router = useRouter();
const tagsViewStore = useTagsViewStore();
const permissionStore = usePermissionStore();
const { listenerRouteChange } = useRouteListener();

/** 右键菜单是否可见 */
const visible = ref(false);
/** 右键菜单位置 */
const top = ref(0);
const left = ref(0);
/** 右键选中的标签页 */
const selectedTag = ref<TagsView>({});

/** 模块名 → 中文名映射，用于标签栏左侧的模块标识 */
const moduleLabelMap: Record<string, string> = {}
MODULE_DEFS.forEach(m => { moduleLabelMap[m.key] = m.title })

/** 当前路由所属模块名（从路径第一段提取） */
const currentModule = computed(() => tagsViewStore.getModuleFromPath(route.path))
/** 模块中文标识文字 */
const moduleLabel = computed(() => moduleLabelMap[currentModule.value])
/** 当前模块的标签页列表（由 store 按模块分组提供） */
const displayViews = computed(() => tagsViewStore.currentModuleViews)

/** 判断是否为固定标签（不可关闭） */
const isAffix = (tag: TagsView) => !!tag.meta?.affix;

/**
 * 递归从路由树中提取所有标记为 affix 的固定标签
 * @param routes 路由树
 * @param basePath 父路由路径，用于拼接完整路径
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
 * 初始化固定标签：从路由树中提取并按模块注册到 store
 * 固定标签只在所属模块中显示
 */
const initTags = () => {
  const affixTags = filterAffixTags(permissionStore.routes);
  for (const tag of affixTags) {
    tagsViewStore.addAffixView(tag);
  }
};

/**
 * 路由变化时添加标签页到当前模块
 */
const addTags = (r: RouteLocationNormalized) => {
  if (r.name) {
    tagsViewStore.addVisitedView(r);
    tagsViewStore.addCacheView(r);
  }
};

/**
 * 关闭标签后导航到最后一个可见标签
 * 如果没有剩余标签则跳转到 redirect 路径
 */
const toLastView = (views: TagsView[], view: TagsView) => {
  const lastView = views.slice(-1)[0];
  if (lastView?.fullPath) {
    router.push(lastView.fullPath);
  } else {
    router.push({ path: '/redirect' + view.path, query: view.query });
  }
};

/** 关闭指定的标签页（仅当前模块） */
const closeSelectedTag = (view: TagsView) => {
  tagsViewStore.delVisitedView(view);
  tagsViewStore.delCachedView(view);
  isActive(view) && toLastView(tagsViewStore.currentModuleViews, view);
};

/** 打开右键菜单 */
const openMenu = (tag: TagsView, e: MouseEvent) => {
  left.value = e.clientX;
  top.value = e.clientY;
  visible.value = true;
  selectedTag.value = tag;
};

/** 判断标签是否处于激活状态 */
const isActive = (view: TagsView) => view.path === route.path;

/** 关闭右键菜单 */
const closeMenu = () => { visible.value = false; };

/** 刷新标签页：清除组件缓存后重新加载 */
const refreshSelectedTag = (view: TagsView) => {
  tagsViewStore.delCachedView(view);
  router.replace({ path: view.path, query: view.query });
};

/** 关闭当前模块除选中标签外的所有标签 */
const closeOtherTag = () => {
  const fullPath = selectedTag.value.fullPath;
  if (fullPath != route.path && fullPath !== undefined) {
    router.push(fullPath);
  }
  tagsViewStore.delOtherVisitedViews(selectedTag.value);
  tagsViewStore.delOtherCachedViews(selectedTag.value);
};

/** 关闭当前模块的所有非固定标签 */
const closeAllTags = (view: TagsView) => {
  tagsViewStore.delAllVisitedView();
  tagsViewStore.delAllCachedView();
  if (tagsViewStore.getAffixViews().some((tag) => tag.path === route.path)) return;
  toLastView(tagsViewStore.currentModuleViews, view);
};

/** 模块切换时通知 store 切换标签上下文 */
watch(currentModule, (newMod) => {
  tagsViewStore.switchModule(newMod)
})

/** 右键菜单显隐时注册/移除全局点击关闭监听 */
watch(visible, (value) => {
  value ? document.body.addEventListener('click', closeMenu) : document.body.removeEventListener('click', closeMenu);
});

onMounted(() => {
  initTags();
  tagsViewStore.switchModule(currentModule.value);
  listenerRouteChange((r) => {
    addTags(r);
  }, true);
});
</script>

<style scoped lang="scss">
.tags-view-container {
  height: var(--tags-view-height);
  width: 100%;
  display: flex;
  align-items: center;

  /* 左侧模块名称标识 */
  .module-label {
    flex-shrink: 0;
    padding: 0 12px;
    height: 26px;
    line-height: 26px;
    font-size: 12px;
    font-weight: 600;
    color: var(--el-color-primary);
    background: rgba(64, 158, 255, 0.08);
    border-right: 1px solid var(--tags-view-tag-border-color);
    margin-right: 4px;
    white-space: nowrap;
  }

  /* 标签滚动区域 */
  .tags-view-wrapper {
    flex: 1;
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
      /* 激活状态高亮 */
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

  /* 右键上下文菜单 */
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
