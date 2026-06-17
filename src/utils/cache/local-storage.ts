/**
 * local-storage —— 标签页（tags-view）的 localStorage 持久化工具
 *
 * 将已打开的标签页列表和 keep-alive 缓存列表序列化到 localStorage，
 * 实现浏览器刷新后恢复上一次的标签页状态。
 * 仅在 settings.cacheTagsView 开启时生效。
 */

import CacheKey from '@/constants/cache-key.ts';
import { type TagsView } from '@/store/modules/tags-view.ts';

//#region 标签栏

/**
 * 从 localStorage 中读取已访问的标签页列表
 *
 * @returns 反序列化后的 TagsView 数组，无数据时返回空数组
 */
export const getVisitedViews = () => {
  const json = localStorage.getItem(CacheKey.VISITED_VIEWS);
  // ?? 为空（null/undefined）时兜底为空数组，避免 JSON.parse 报错
  return JSON.parse(json ?? '[]') as TagsView[];
};

/**
 * 将已访问的标签页列表持久化到 localStorage
 *
 * 存储前会剔除路由对象中的 matched 和 redirectedFrom 属性，
 * 这两个属性包含循环引用，JSON.stringify 无法处理会导致报错。
 *
 * @param views 当前标签页列表
 */
export const setVisitedViews = (views: TagsView[]) => {
  views.forEach((view) => {
    // 删除不必要的属性，防止 JSON.stringify 处理到循环引用
    delete view.matched;
    delete view.redirectedFrom;
  });
  localStorage.setItem(CacheKey.VISITED_VIEWS, JSON.stringify(views));
};

/**
 * 从 localStorage 中读取缓存的组件名称列表
 *
 * @returns 组件 name 字符串数组，无数据时返回空数组
 */
export const getCachedViews = () => {
  const json = localStorage.getItem(CacheKey.CACHED_VIEWS);
  return JSON.parse(json ?? '[]') as string[];
};

/**
 * 将缓存的组件名称列表持久化到 localStorage
 *
 * @param views 组件 name 字符串数组
 */
export const setCachedViews = (views: string[]) => {
  localStorage.setItem(CacheKey.CACHED_VIEWS, JSON.stringify(views));
};

//#endregion
