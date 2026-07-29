import { ref, onMounted, onUnmounted, nextTick, type Ref } from 'vue'

interface UseAutoScrollOptions {
  /** 距离底部多远算"在底部"，默认 100px */
  threshold?: number
  /** 是否启用自动滚动，默认 true */
  enabled?: Ref<boolean> | boolean
}

interface UseAutoScrollReturn {
  /** 绑定到滚动容器的 ref（外部传入时使用） */
  containerRef: Ref<HTMLElement | null>
  /** 是否处于自动滚动状态（用户在底部） */
  isAtBottom: Ref<boolean>
  /** 立即滚动到底部（无动画，用于流式更新） */
  scrollToBottom: () => void
  /** 平滑滚动到底部（有动画，用于用户交互） */
  scrollToBottomSmooth: () => void
}

/**
 * 智能自动滚动 composable
 *
 * 功能：
 * 1. 内容变化时自动滚动到底部（无动画，响应流式更新）
 * 2. 用户向上滚动时暂停自动滚动
 * 3. 用户滚动回底部时自动恢复
 * 4. 提供平滑动画版本用于用户交互
 *
 * @example
 * ```vue
 * <script setup>
 * import { useAutoScroll } from '@/hooks/useAutoScroll'
 *
 * const messageContainer = ref<HTMLElement>()
 * const { containerRef, scrollToBottom } = useAutoScroll(messageContainer)
 *
 * // 监听内容变化时调用 scrollToBottom()
 * watch(content, () => scrollToBottom())
 * </script>
 *
 * <template>
 *   <div ref="containerRef" class="message-list">
 *     <!-- 内容 -->
 *   </div>
 * </template>
 * ```
 */
export function useAutoScroll(
  externalRef?: Ref<HTMLElement | null>,
  options: UseAutoScrollOptions = {}
): UseAutoScrollReturn {
  const { threshold = 100, enabled = true } = options

  const internalRef = ref<HTMLElement | null>(null)
  const containerRef = externalRef || internalRef

  const isAtBottom = ref(true)

  // 获取当前启用状态
  const isEnabled = () => {
    if (typeof enabled === 'boolean') return enabled
    return enabled.value
  }

  // 判断是否在底部
  function checkIfAtBottom() {
    const el = containerRef.value
    if (!el) return

    const distanceToBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    isAtBottom.value = distanceToBottom <= threshold
  }

  // 滚动事件处理
  function handleScroll() {
    checkIfAtBottom()
  }

  // 立即滚动到底部（无动画，用于流式更新）
  function scrollToBottom() {
    if (!isEnabled()) return

    nextTick(() => {
      const el = containerRef.value
      if (!el) return

      // 直接设置 scrollTop，无动画，确保流式更新时滚动跟得上
      el.scrollTop = el.scrollHeight
    })
  }

  // 平滑滚动到底部（有动画，用于用户交互）
  function scrollToBottomSmooth() {
    if (!isEnabled()) return

    nextTick(() => {
      const el = containerRef.value
      if (!el) return

      el.scrollTo({
        top: el.scrollHeight,
        behavior: 'smooth'
      })
    })
  }

  // 绑定滚动事件，并初始化滚动位置
  onMounted(() => {
    const el = containerRef.value
    if (el) {
      el.addEventListener('scroll', handleScroll, { passive: true })
      // 初始检查
      checkIfAtBottom()
      // 初始化时滚动到底部（处理已有内容的情况）
      // 使用 setTimeout 确保 DOM 已完全渲染
      setTimeout(() => {
        scrollToBottom()
      }, 0)
    }
  })

  onUnmounted(() => {
    const el = containerRef.value
    if (el) {
      el.removeEventListener('scroll', handleScroll)
    }
  })

  return {
    containerRef,
    isAtBottom,
    scrollToBottom,
    scrollToBottomSmooth
  }
}
