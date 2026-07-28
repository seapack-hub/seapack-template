/**
 * useSceneBindings — 场景绑定查询 composable（替代 useAiBindings）
 *
 * 从 sceneBindings Store 中按 moduleKey + positionKey 过滤出
 * 该位置已启用的场景绑定列表，包含绑定的 Agent 信息。
 *
 * 本 composable 是纯响应式的（无副作用），不触发任何 API 请求。
 * 全量绑定数据由应用登录时（SliderDialog.vue）通过
 * sceneBindingsStore.fetchAllBindings() 加载并缓存。
 *
 * 当 moduleKey 为空字符串时，返回空绑定列表（用于 AiAssistant
 * 在未配置 aiPosition 的页面降级为纯 LLM 模式）。
 *
 * @example
 *   const { bindings, loading } = useSceneBindings('stockFund', 'detail-toolbar')
 *   const { bindings } = useSceneBindings('', '')  // 空模式，返回 []
 */
import { computed, type MaybeRef, toValue } from 'vue'
import { useSceneBindingsStore } from '@/store/modules/sceneBindings'
import type { SceneBindingInfo } from '@/api/ai/scene'

export function useSceneBindings(moduleKey: MaybeRef<string>, positionKey: MaybeRef<string>) {

  console.log('useSceneBindings--moduleKey, positionKey:', toValue(moduleKey), toValue(positionKey))
  const store = useSceneBindingsStore()

  /** 是否为空模式（moduleKey 为空时返回空列表） */
  const isEmpty = computed(() => !toValue(moduleKey))

  /** 该位置的所有绑定（含禁用），参数变化时自动重新过滤 */
  const allBindings = computed<SceneBindingInfo[]>(() => {
    const mk = toValue(moduleKey)
    const pk = toValue(positionKey)
    if (!mk) return []
    return store.getByModuleAndPosition(mk, pk)
  })

  console.log('allBindings:所有的绑定：', allBindings.value)
  /** 仅启用的绑定 */
  const activeBindings = computed<SceneBindingInfo[]>(() => {
    return allBindings.value.filter(b => b.status === 1)
  })

  return {
    bindings: activeBindings,
    loading: computed(() => isEmpty.value ? false : store.loading),
    loaded: computed(() => isEmpty.value ? true : store.loaded),
    refresh: () => { if (!isEmpty.value) store.refreshBindings() },
  }
}
