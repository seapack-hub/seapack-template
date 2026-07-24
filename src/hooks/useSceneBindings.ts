/**
 * useSceneBindings — 场景绑定查询 composable（替代 useAiBindings）
 *
 * 传入 moduleKey + position，从 sceneBindings Store 中过滤出
 * 该位置已启用的场景绑定列表，包含绑定的 Agent 信息。
 *
 * @example
 *   const { bindings, loading } = useSceneBindings('stockFund', 'detail-toolbar')
 */
import { computed, onMounted } from 'vue'
import { useSceneBindingsStore } from '@/store/modules/sceneBindings'
import type { SceneBindingInfo } from '@/api/ai/scene'

export function useSceneBindings(moduleKey: string, positionKey: string) {
  const store = useSceneBindingsStore()

  onMounted(() => {
    store.fetchAllBindings()
  })

  /** 该位置的所有绑定（含禁用） */
  const allBindings = computed<SceneBindingInfo[]>(() => {
    return store.getByModuleAndPosition(moduleKey, positionKey)
  })

  /** 仅启用的绑定 */
  const activeBindings = computed<SceneBindingInfo[]>(() => {
    return allBindings.value.filter(b => b.status === 1)
  })

  return {
    bindings: activeBindings,
    loading: computed(() => store.loading),
    loaded: computed(() => store.loaded),
    refresh: () => store.refreshBindings(),
  }
}
