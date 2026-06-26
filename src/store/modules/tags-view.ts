/**
 * tags-view —— 多标签导航栏状态管理（Pinia store）
 *
 * 职责：
 *   1. 按模块分组管理已访问的标签页（visitedViews），
 *      切换模块时只展示当前模块的标签
 *   2. 管理需要 keep-alive 缓存的组件名称列表（cachedViews），
 *      同样按模块分组
 *   3. 固定标签（affix）按模块分组存储，只注入所属模块，不可关闭
 *
 * 数据模型：
 *   moduleVisitedViews: Record<模块名, TagsView[]>
 *   moduleCachedViews:  Record<模块名, string[]>
 *   affixViewsMap:      Record<模块名, TagsView[]>
 *   currentModule:      当前活跃模块名
 */

import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { type RouteLocationNormalized } from 'vue-router';

export type TagsView = Partial<RouteLocationNormalized>;

/** 非模块页面的默认分组 key（如 /login, /errorPage） */
const DEFAULT_MODULE = '__default__';

export const useTagsViewStore = defineStore('tags-view', () => {

  // ========== 状态 ==========

  /** 按模块分组的访问标签页 */
  const moduleVisitedViews = ref<Record<string, TagsView[]>>({})
  /** 按模块分组的缓存组件名列表 */
  const moduleCachedViews = ref<Record<string, string[]>>({})
  /** 当前活跃模块名 */
  const currentModule = ref<string>(DEFAULT_MODULE)
  /** 按模块分组的固定标签列表（不可关闭，只注入所属模块） */
  const affixViewsMap = ref<Record<string, TagsView[]>>({})

  // ========== 工具函数 ==========

  /**
   * 从路由路径中提取模块名
   * @example '/stockFund/stock/stockQuote' → 'stockFund'
   */
  function getModuleFromPath(path?: string): string {
    if (!path) return DEFAULT_MODULE
    const seg = path.split('/').filter(Boolean)
    return seg[0] || DEFAULT_MODULE
  }

  // ========== 计算属性 ==========

  /** 当前模块的标签页列表 */
  const currentModuleViews = computed(() => moduleVisitedViews.value[currentModule.value] || [])
  /** 当前模块的缓存组件名列表 */
  const currentModuleCaches = computed(() => moduleCachedViews.value[currentModule.value] || [])

  /** 获取指定模块的固定标签列表 */
  function getAffixViews(moduleName?: string): TagsView[] {
    const mod = moduleName || currentModule.value
    return affixViewsMap.value[mod] || []
  }

  /** 全量固定标签聚合（所有模块合并，用于兼容旧引用） */
  const affixViews = computed(() => {
    const all: TagsView[] = []
    Object.values(affixViewsMap.value).forEach(v => all.push(...v))
    return all
  })

  /** 全量标签页聚合（所有模块合并） */
  const allVisitedViews = computed(() => {
    const all: TagsView[] = []
    Object.values(moduleVisitedViews.value).forEach(v => all.push(...v))
    return all
  })

  /** 全量缓存组件名聚合（所有模块合并） */
  const allCachedViews = computed(() => {
    const all: string[] = []
    Object.values(moduleCachedViews.value).forEach(v => all.push(...v))
    return all
  })

  /**
   * 兼容旧引用名，让使用 visitedViews / cachedViews 的代码无需改动
   * 但实际操作应使用 module 分组方法
   */
  const visitedViews = allVisitedViews
  const cachedViews = allCachedViews

  // ========== 模块切换 ==========

  /**
   * 切换当前模块上下文
   * 首次进入某模块时用固定标签初始化其标签列表
   */
  function switchModule(moduleName: string) {
    if (moduleName === currentModule.value) return
    currentModule.value = moduleName

    if (!moduleVisitedViews.value[moduleName]) {
      moduleVisitedViews.value[moduleName] = []
    }

    const views = moduleVisitedViews.value[moduleName]
    const affix = affixViewsMap.value[moduleName] || []

    // 移除非当前模块的固定标签（防止 initTags 等旧逻辑污染）
    const affixPaths = new Set(affix.map(v => v.path))
    const cleaned = views.filter(v => !v.meta?.affix || affixPaths.has(v.path))

    // 确保当前模块的固定标签存在且排在最前面
    const existingPaths = new Set(cleaned.map(v => v.path))
    const missingAffix = affix.filter(v => !existingPaths.has(v.path))
    moduleVisitedViews.value[moduleName] = [...missingAffix, ...cleaned]
  }

  // ========== 新增 ==========

  /** 注册固定标签，按模块分组去重存储 */
  function addAffixView(view: TagsView) {
    const mod = getModuleFromPath(view.path)
    if (!affixViewsMap.value[mod]) {
      affixViewsMap.value[mod] = []
    }
    if (affixViewsMap.value[mod].some(v => v.path === view.path)) return
    affixViewsMap.value[mod].push(view)
  }

  /**
   * 向当前模块添加标签页
   * 如果已有相同 path 的标签则用新路由替换（保留 query 参数变化）
   */
  function addVisitedView(view: TagsView) {
    const mod = currentModule.value
    if (!moduleVisitedViews.value[mod]) {
      moduleVisitedViews.value[mod] = [...(affixViewsMap.value[mod] || [])]
    }
    const views = moduleVisitedViews.value[mod]
    const idx = views.findIndex(v => v.path === view.path)
    if (idx !== -1) {
      if (views[idx].fullPath !== view.fullPath) views[idx] = { ...view }
    } else {
      views.push(view)
    }
  }

  /**
   * 向当前模块添加组件缓存
   * 只有 name 为字符串的路由才可被 keep-alive 缓存
   */
  function addCacheView(view: TagsView) {
    if (typeof view.name !== 'string') return
    const mod = currentModule.value
    if (!moduleCachedViews.value[mod]) moduleCachedViews.value[mod] = []
    if (!moduleCachedViews.value[mod].includes(view.name)) {
      moduleCachedViews.value[mod].push(view.name)
    }
  }

  // ========== 删除 ==========

  /** 从当前模块移除指定标签页 */
  function delVisitedView(view: TagsView) {
    const mod = currentModule.value
    const views = moduleVisitedViews.value[mod]
    if (!views) return
    const idx = views.findIndex(v => v.path === view.path)
    if (idx !== -1) views.splice(idx, 1)
  }

  /** 从当前模块移除指定组件的缓存 */
  function delCachedView(view: TagsView) {
    if (typeof view.name !== 'string') return
    const mod = currentModule.value
    const names = moduleCachedViews.value[mod]
    if (!names) return
    const idx = names.indexOf(view.name)
    if (idx !== -1) names.splice(idx, 1)
  }

  // ========== 删除其他 ==========

  /**
   * 保留当前标签和固定标签，关闭当前模块的其他所有标签
   */
  function delOtherVisitedViews(view: TagsView) {
    const mod = currentModule.value
    const views = moduleVisitedViews.value[mod]
    if (!views) return
    moduleVisitedViews.value[mod] = views.filter(
      v => v.meta?.affix || v.path === view.path
    )
  }

  /**
   * 清除当前模块除当前组件外的所有缓存
   */
  function delOtherCachedViews(view: TagsView) {
    if (typeof view.name !== 'string') return
    const mod = currentModule.value
    const idx = moduleCachedViews.value[mod]?.indexOf(view.name)
    if (idx !== undefined && idx !== -1) {
      moduleCachedViews.value[mod] = moduleCachedViews.value[mod].slice(idx, idx + 1)
    } else {
      if (moduleCachedViews.value[mod]) moduleCachedViews.value[mod] = []
    }
  }

  // ========== 删除全部 ==========

  /** 关闭当前模块所有非固定标签 */
  function delAllVisitedView() {
    const mod = currentModule.value
    if (!moduleVisitedViews.value[mod]) return
    moduleVisitedViews.value[mod] = moduleVisitedViews.value[mod].filter(v => v.meta?.affix)
  }

  /** 清空当前模块的所有组件缓存 */
  function delAllCachedView() {
    const mod = currentModule.value
    if (moduleCachedViews.value[mod]) moduleCachedViews.value[mod] = []
  }

  // ========== 导出 ==========

  return {
    visitedViews,
    cachedViews,
    currentModuleViews,
    currentModuleCaches,
    currentModule,
    moduleVisitedViews,
    moduleCachedViews,
    affixViews,
    getAffixViews,
    getModuleFromPath,
    switchModule,
    addAffixView,
    addVisitedView,
    addCacheView,
    delVisitedView,
    delCachedView,
    delOtherVisitedViews,
    delOtherCachedViews,
    delAllVisitedView,
    delAllCachedView,
  }
})
