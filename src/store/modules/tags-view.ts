import { ref } from 'vue';
import { defineStore } from 'pinia';
import { type RouteLocationNormalized } from 'vue-router';
import { useSettingsStore } from '@/store/modules/settings.ts';
import { getVisitedViews, getCachedViews } from '@/utils/cache/local-storage';

/**
 * TagsView —— 标签页（tags-view）路由状态管理
 *
 * 职责：
 *   1. 管理已打开的标签页列表（visitedViews），用于顶部多标签导航栏渲染
 *   2. 管理需要 keep-alive 缓存的组件名称列表（cachedViews）
 *   3. 支持增、删、删其他、删全部等操作，affix 标记的标签页不可被关闭
 *
 * 使用 Pinia 组合式 API（setup store）写法
 */
export type TagsView = Partial<RouteLocationNormalized>;
export const useTagsViewStore = defineStore('tags-view', () => {
  // 从 settings store 中读取是否开启标签页缓存
  const { cacheTagsView } = useSettingsStore();

  // ========== 状态 ==========

  // 已访问的标签页列表：每个元素是一个简化版的路由对象
  // 如果 cacheTagsView 为 true，则从 localStorage 中恢复历史记录
  const visitedViews = ref<TagsView[]>(cacheTagsView ? getVisitedViews() : []);

  // 需要 keep-alive 缓存的组件 name 列表
  // 只有当 cacheTagsView 为 true 时才从 localStorage 恢复
  const cachedViews = ref<string[]>(cacheTagsView ? getCachedViews() : []);

  // ========== 新增 ==========

  /**
   * 添加新标签页到 visitedViews
   * 如果已存在相同 path 的标签页，则用新路由替换旧路由（保留 query 参数变化）
   * @param view 当前激活的路由对象
   */
  const addVisitedView = (view: TagsView) => {
    // 查找是否已存在相同 path 的标签页
    const index = visitedViews.value.findIndex((v) => v.path === view.path);
    if (index !== -1) {
      // 已存在：如果 fullPath 不同（query 参数有变化），则替换为最新路由
      // 防止 query 参数丢失，如 /user?id=1 → /user?id=2
      visitedViews.value[index].fullPath !== view.fullPath &&
        (visitedViews.value[index] = { ...view });
    } else {
      // 不存在：新增标签页
      visitedViews.value.push(view);
    }
  };

  /**
   * 添加组件到缓存列表（cachedViews）
   * 只有具备 name 的路由且未重复时才添加
   * @param view 当前激活的路由对象
   */
  const addCacheView = (view: TagsView) => {
    // name 必须是非空字符串，Symbol 类型无法用于 keep-alive include
    if (typeof view.name !== 'string') return;
    // 已存在则跳过，避免重复
    if (cachedViews.value.includes(view.name)) return;
    // 加入缓存列表
    cachedViews.value.push(view.name);
  };

  // ========== 删除 ==========

  /**
   * 从 visitedViews 中移除指定标签页
   * @param view 要关闭的标签页路由
   */
  const delVisitedView = (view: TagsView) => {
    const index = visitedViews.value.findIndex((v) => v.path === view.path);
    if (index !== -1) visitedViews.value.splice(index, 1);
  };

  /**
   * 从 cachedViews 中移除指定组件的缓存
   * @param view 要清除缓存的标签页路由
   */
  const delCachedView = (view: TagsView) => {
    if (typeof view.name !== 'string') return;
    const index = cachedViews.value.indexOf(view.name);
    if (index !== -1) cachedViews.value.splice(index, 1);
  };

  // ========== 删除其他 ==========

  /**
   * 移除除当前标签页和固定标签页（affix）之外的所有标签页
   * @param view 当前激活的标签页
   */
  const delOtherVisitedViews = (view: TagsView) => {
    visitedViews.value = visitedViews.value.filter((item) => {
      // 保留：标记为 affix（固定的）的标签页 + 当前标签页
      return item.meta?.affix || view.path === item.path;
    });
  };

  /**
   * 清除除当前组件之外的所有缓存
   * @param view 当前激活的标签页
   */
  const delOtherCachedViews = (view: TagsView) => {
    if (typeof view.name !== 'string') return;
    const index = cachedViews.value.indexOf(view.name);
    if (index !== -1) {
      // 只保留当前组件这一个缓存
      cachedViews.value = cachedViews.value.slice(index, index + 1);
    } else {
      // 当前组件不在缓存列表中，清空全部
      cachedViews.value = [];
    }
  };

  // ========== 删除全部 ==========

  /**
   * 删除所有非固定标签页（保留 meta.affix 为 true 的标签页）
   */
  const delAllVisitedView = () => {
    visitedViews.value = visitedViews.value.filter((tag) => tag.meta?.affix);
  };

  /**
   * 清空所有组件缓存
   */
  const delAllCachedView = () => {
    cachedViews.value = [];
  };

  // ========== 导出 ==========

  return {
    visitedViews,
    cachedViews,
    addVisitedView,
    addCacheView,
    delVisitedView,
    delCachedView,
    delOtherVisitedViews,
    delOtherCachedViews,
    delAllVisitedView,
    delAllCachedView,
  };
});
