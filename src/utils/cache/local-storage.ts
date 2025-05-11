import CacheKey from '@/constants/cache-key.ts';
import { type TagsView } from '@/store/modules/tags-view.ts';

//#region 标签栏
export const getVisitedViews = () => {
  const json = localStorage.getItem(CacheKey.VISITED_VIEWS);
  //双问号后面接的就是默认值,json 为空默认为空数组
  return JSON.parse(json ?? '[]') as TagsView[];
};
export const setVisitedViews = (views: TagsView[]) => {
  views.forEach((view) => {
    // 删除不必要的属性，防止 JSON.stringify 处理到循环引用
    delete view.matched;
    delete view.redirectedFrom;
  });
  localStorage.setItem(CacheKey.VISITED_VIEWS, JSON.stringify(views));
};
export const getCachedViews = () => {
  const json = localStorage.getItem(CacheKey.CACHED_VIEWS);
  //双问号后面接的就是默认值,json 为空默认为空数组
  return JSON.parse(json ?? '[]') as string[];
};
export const setCachedViews = (views: string[]) => {
  localStorage.setItem(CacheKey.CACHED_VIEWS, JSON.stringify(views));
};
//#endregion
