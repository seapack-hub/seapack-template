/**
 * useRouteAiPosition — 从当前路由 meta 中提取 AI 位置信息
 *
 * 路由 meta 中声明 aiPosition 后，AiAssistant 可自动识别
 * 当前页面对应的 moduleKey + positionKey，从而加载场景绑定。
 *
 * @example
 *   路由配置
 *   meta: {
 *     aiPosition: { moduleKey: 'blogsManagement', positionKey: 'editor-toolbar' }
 *   }
 *
 *   组件中使用
 *   const { aiPosition } = useRouteAiPosition()
 */
import { computed } from 'vue'
import { useRoute } from 'vue-router'

/** 路由 meta 中 aiPosition 的类型定义 */
export interface AiPositionMeta {
  /** 前端模块标识，对应 aiPositions.ts 中的 moduleKey */
  moduleKey: string
  /** 模块内位置标识，对应 aiPositions.ts 中的 positionKey */
  positionKey: string
}

export function useRouteAiPosition() {
  const route = useRoute()

  /** 当前路由声明的 AI 位置，未配置时为 null */
  const aiPosition = computed<AiPositionMeta | null>(() => {
    const raw = route.meta?.aiPosition
    if (raw && typeof raw === 'object' && 'moduleKey' in raw && 'positionKey' in raw) {
      return raw as AiPositionMeta
    }
    return null
  })

  /** 当前路由是否配置了 AI 位置 */
  const hasAiPosition = computed(() => aiPosition.value !== null)

  return { aiPosition, hasAiPosition }
}
