import { ref, onMounted, onUnmounted } from 'vue'

// 大屏自适应缩放 hook
// 基于设计稿宽高（默认 1920x1080）与当前窗口宽高，计算最小缩放比
// 配合 ScreenFrame 组件的 transform:scale 实现等比缩放

interface ScaleOptions {
  designWidth?: number
  designHeight?: number
}

export function useScreenScale(options: ScaleOptions = {}) {
  const { designWidth = 1920, designHeight = 1080 } = options
  const scale = ref(1)

  const updateScale = () => {
    const w = window.innerWidth
    const h = window.innerHeight
    // 取宽高比的最小值，确保完整显示
    scale.value = Math.min(w / designWidth, h / designHeight)
  }

  onMounted(updateScale)
  onUnmounted(() => {})
  window.addEventListener('resize', updateScale)

  return { scale, designWidth, designHeight }
}
