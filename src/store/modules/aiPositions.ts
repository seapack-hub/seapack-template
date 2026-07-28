/**
 * aiPositions — AI 助手位置缓存 Store
 *
 * 职责：
 *   1. 应用初始化时全量加载所有启用的位置
 *   2. 按 moduleKey 建立索引，支持快速查询
 *   3. 供 DeploymentFormDialog、SceneCard 等组件消费
 *
 * 替代原 aiPositions.ts 硬编码配置，位置数据来源于后端数据库。
 */
import { defineStore } from 'pinia'
import { PositionAPI, type AiPosition } from '@/api/ai/position'

export const useAiPositionsStore = defineStore('aiPositions', () => {
  /** 全量位置列表 */
  const positions = ref<AiPosition[]>([])
  const loaded = ref(false)
  const loading = ref(false)

  /** 按 moduleKey 分组的索引 */
  const positionsByModule = computed(() => {
    const map = new Map<string, AiPosition[]>()
    for (const p of positions.value) {
      if (!map.has(p.moduleKey)) map.set(p.moduleKey, [])
      map.get(p.moduleKey)!.push(p)
    }
    return map
  })

  /** 所有已启用的模块列表（去重） */
  const moduleOptions = computed(() => {
    const seen = new Map<string, string>()
    for (const p of positions.value) {
      if (!seen.has(p.moduleKey)) {
        // 模块标签取第一个位置的 label 前缀，或直接用 moduleKey
        seen.set(p.moduleKey, p.label.split('-')[0] || p.moduleKey)
      }
    }
    return Array.from(seen.entries()).map(([key, label]) => ({ key, label }))
  })

  /**
   * 全量加载（懒加载，仅首次有效）
   * 应用启动时调用一次，后续从缓存读取
   */
  async function fetchAllPositions(force = false) {
    if (loaded.value && !force) return
    loading.value = true
    try {
      const res = await PositionAPI.list({ status: 1 })
      positions.value = res || []
      loaded.value = true
    } finally {
      loading.value = false
    }
  }

  /** 强制刷新 */
  async function refreshPositions() {
    loaded.value = false
    positions.value = []
    await fetchAllPositions(true)
  }

  /**
   * 根据 moduleKey 获取该模块下的所有位置
   */
  function getByModule(moduleKey: string): AiPosition[] {
    return positionsByModule.value.get(moduleKey) || []
  }

  /**
   * 根据 moduleKey + positionKey 获取单个位置
   */
  function getByKey(moduleKey: string, positionKey: string): AiPosition | undefined {
    return positions.value.find(p => p.moduleKey === moduleKey && p.positionKey === positionKey)
  }

  /**
   * 根据 moduleKey + positionKey 获取位置 label
   * 未找到时返回 positionKey 本身
   */
  function getLabel(moduleKey: string, positionKey: string): string {
    const found = getByKey(moduleKey, positionKey)
    return found?.label || positionKey
  }

  /**
   * 将绑定列表按 moduleKey 分组
   * 复用原 aiPositions.ts 的 groupBindingsByModule 功能
   */
  function groupByModule<T extends { moduleKey: string }>(items: T[]): Map<string, T[]> {
    const map = new Map<string, T[]>()
    for (const item of items) {
      const key = item.moduleKey
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(item)
    }
    return map
  }

  return {
    positions,
    loaded,
    loading,
    positionsByModule,
    moduleOptions,
    fetchAllPositions,
    refreshPositions,
    getByModule,
    getByKey,
    getLabel,
    groupByModule,
  }
})
