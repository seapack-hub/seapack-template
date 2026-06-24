import { onUnmounted } from 'vue'

// 大屏数据轮询刷新 hook
// 自动在组件卸载时清理定时器，避免内存泄漏
export function useAutoRefresh(callback: () => void, interval = 5000) {
  let timer: ReturnType<typeof setInterval> | null = null

  const start = () => {
    stop()
    timer = setInterval(callback, interval)
  }

  const stop = () => {
    if (timer !== null) {
      clearInterval(timer)
      timer = null
    }
  }

  onUnmounted(stop)

  return { start, stop }
}
