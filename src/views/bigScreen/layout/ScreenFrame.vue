<template>
  <!-- 自适应缩放容器：固定 1920x1080 设计尺寸，通过 CSS transform scale 等比缩放 -->
  <div
    class="screen-frame"
    :style="{
      width: designWidth + 'px',
      height: designHeight + 'px',
      transform: `scale(${scale})`,
      transformOrigin: 'left top',
      '--primary': primaryColor,
      '--accent': accentColor,
      '--text': textColor,
      '--text-sec': textSecondary,
      '--border': borderColor,
      '--card-bg': cardBg,
      background: bgColor,
    }"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { useScreenScale } from '../composables/useScreenScale'
import type { ScreenTheme } from '../config/styles'
import { computed } from 'vue'

interface Props {
  theme?: ScreenTheme     // 当前主题对象，影响所有 CSS 变量
  designWidth?: number    // 设计稿宽度（px），默认 1920
  designHeight?: number   // 设计稿高度（px），默认 1080
}

const props = withDefaults(defineProps<Props>(), {
  theme: undefined,
  designWidth: 1920,
  designHeight: 1080,
})

const { scale } = useScreenScale({
  designWidth: props.designWidth,
  designHeight: props.designHeight,
})

const t = computed(() => props.theme)

// 将主题色提取为独立的 computed，注入到 CSS 变量中，方便子组件通过 var() 引用
const primaryColor = computed(() => t.value?.primaryColor ?? '#00d4ff')
const accentColor = computed(() => t.value?.accentColor ?? '#3a7bd5')
const textColor = computed(() => t.value?.textColor ?? '#ffffff')
const textSecondary = computed(() => t.value?.textSecondary ?? 'rgba(255,255,255,0.65)')
const borderColor = computed(() => t.value?.borderColor ?? 'rgba(0,212,255,0.25)')
const cardBg = computed(() => t.value?.cardBg ?? 'rgba(0,212,255,0.05)')
const bgColor = computed(() => t.value?.bgColor ?? '#0a0e17')
</script>

<style lang="scss" scoped>
.screen-frame {
  position: relative;
  overflow: hidden;
  transform-origin: left top;
}
</style>
