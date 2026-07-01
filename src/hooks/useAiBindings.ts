/**
 * useAiBindings — AI 技能绑定查询 composable
 *
 * 消费方传入 moduleKey + position，自动从 aiSkillBindings Store 中过滤出
 * 该位置已启用的技能绑定列表。Store 在首次调用时自动加载全量数据。
 *
 * @example
 *   const { bindings, loading, loaded } = useAiBindings('blogsManagement', 'editor-toolbar')
 *   bindings.value 即为该位置所有启用状态下的技能绑定
 */
import { computed, onMounted } from 'vue'
import { useAiSkillBindingsStore } from '@/store/modules/aiSkillBindings'
import type { SkillBindingInfo } from '@/api/ai/skill'

export function useAiBindings(moduleKey: string, position: string) {
  const store = useAiSkillBindingsStore()

  // 组件挂载时确保 Store 已加载
  onMounted(() => {
    store.fetchAllBindings()
  })

  /** 该位置的所有绑定（含禁用状态的） */
  const allBindings = computed<SkillBindingInfo[]>(() => {
    return store.getByModuleAndPosition(moduleKey, position)
  })

  /** 仅启用的绑定（status === 1） */
  const activeBindings = computed<SkillBindingInfo[]>(() => {
    return allBindings.value.filter(b => b.status === 1)
  })

  return {
    /** 启用的技能绑定列表 */
    bindings: activeBindings,
    /** 是否正在加载 */
    loading: computed(() => store.loading),
    /** 是否已加载完成 */
    loaded: computed(() => store.loaded),
    /** 强制刷新 */
    refresh: () => store.refreshBindings(),
  }
}
