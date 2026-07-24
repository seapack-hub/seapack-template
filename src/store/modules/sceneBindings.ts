/**
 * 场景绑定 — Pinia store（替代 aiSkillBindings）
 *
 * 职责：
 *   1. 应用初始化时全量加载所有场景绑定（含 Agent 信息）
 *   2. 按 moduleKey + position 建立索引
 *   3. 供业务模块通过 useSceneBindings 获取绑定的 Agent
 */
import { defineStore } from 'pinia'
import { SceneAPI, type SceneBindingInfo } from '@/api/ai/scene'

export const useSceneBindingsStore = defineStore('sceneBindings', () => {
  const bindings = ref<SceneBindingInfo[]>([])
  const loaded = ref(false)
  const loading = ref(false)

  /** 按 `${moduleKey}:${positionKey}` 建立索引 */
  const bindingsIndex = computed(() => {
    const map = new Map<string, SceneBindingInfo[]>()
    for (const item of bindings.value) {
      const key = `${item.moduleKey}:${item.positionKey || ''}`
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(item)
    }
    return map
  })

  /** 根据模块标识和位置过滤 */
  function getByModuleAndPosition(moduleKey: string, positionKey?: string): SceneBindingInfo[] {
    const key = `${moduleKey}:${positionKey || ''}`
    return bindingsIndex.value.get(key) || []
  }

  /** 全量加载（懒加载，仅首次有效） */
  async function fetchAllBindings(force = false) {
    if (loaded.value && !force) return
    loading.value = true
    try {
      const res = await SceneAPI.getAllBindings()
      bindings.value = res || []
      loaded.value = true
    } finally {
      loading.value = false
    }
  }

  /** 强制刷新 */
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
