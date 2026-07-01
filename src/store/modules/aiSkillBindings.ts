/**
 * AI 技能绑定 — Pinia store
 *
 * 职责：
 *   1. 在应用初始化时全量加载所有模块绑定（含技能详情和参数定义）
 *   2. 按 moduleKey + position 建立索引，供全局任意组件按需过滤
 *   3. 提供刷新机制（技能管理后台修改绑定后调用）
 *
 * 消费方通过 useAiBindings(moduleKey, position) composable 获取过滤后的数据
 */
import { defineStore } from 'pinia'
import { SkillAPI, type SkillBindingInfo } from '@/api/ai/skill'

export const useAiSkillBindingsStore = defineStore('aiSkillBindings', () => {
  /** 所有绑定（含技能和参数详情） */
  const bindings = ref<SkillBindingInfo[]>([])
  /** 是否已加载 */
  const loaded = ref(false)
  /** 加载状态 */
  const loading = ref(false)

  /** 按 `${moduleKey}:${position}` 建立的索引 */
  const bindingsIndex = computed(() => {
    const map = new Map<string, SkillBindingInfo[]>()
    for (const item of bindings.value) {
      const key = `${item.moduleKey}:${item.position || ''}`
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(item)
    }
    return map
  })

  /**
   * 根据模块标识和位置过滤绑定列表
   * @param moduleKey 模块标识，对应 config/modules.ts 的 key
   * @param position  模块内位置，如 'editor-toolbar' / 'sidebar'
   */
  function getByModuleAndPosition(moduleKey: string, position?: string): SkillBindingInfo[] {
    const key = `${moduleKey}:${position || ''}`
    return bindingsIndex.value.get(key) || []
  }

  /**
   * 全量加载所有绑定（懒加载，仅首次有效）
   * @param force 是否强制重新加载（跳过 loaded 检查）
   */
  async function fetchAllBindings(force = false) {
    if (loaded.value && !force) return
    loading.value = true
    try {
      const res = await SkillAPI.getAllBindings()

      //对应值  元素值 params 中的 options 
      //options: "[{\"label\": \"技术教程\", \"value\": \"技术教程\"}, {\"label\": \"经验分享\", \"value\": \"经验分享\"}, {\"label\": \"行业分析\", \"value\": \"行业分析\"}, {\"label\": \"产品介绍\", \"value\": \"产品介绍\"}]"
      bindings.value = res || []
      loaded.value = true
    } finally {
      loading.value = false
    }
  }

  /** 强制刷新（技能管理后台修改绑定后调用） */
  async function refreshBindings() {
    loaded.value = false
    bindings.value = []
    await fetchAllBindings(true)
  }

  return {
    bindings,
    loaded,
    loading,
    bindingsIndex,
    getByModuleAndPosition,
    fetchAllBindings,
    refreshBindings,
  }
})
