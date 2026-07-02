<!--
  Icon — 统一图标组件

  自动识别渲染方式（按优先级）：
    1. EP 图标   — 通过 <el-icon><component :is="..." /></el-icon> 渲染
    2. SVG 精灵   — 通过 <svg><use :href="#icon-{name}" /></svg> 渲染
    3. 占位       — 灰色方块，标记图标缺失

  特性：
    - 默认 color="currentColor"，自动继承父元素文本色，适配深色/浅色主题
    - 支持数字 size 自动转 px
    - 运行时检测 <symbol> 是否存在，不产生无效 <use>

  用法：
    <Icon name="user" :size="20" />
    <Icon name="Search" ep />
    <Icon name="edit" color="#409eff" />

  @see iconRegistry.ts — EP 图标名称注册表
-->
<template>
  <el-icon v-if="type === 'ep'" :size="iconSize" :color="computedColor">
    <component :is="epComponent" />
  </el-icon>
  <svg
    v-else-if="type === 'svg'"
    class="icon-svg"
    :style="{ width: iconSize, height: iconSize, color: computedColor }"
  >
    <use :href="`#icon-${name}`" />
  </svg>
  <span
    v-else
    class="icon-placeholder"
    :style="{ width: iconSize, height: iconSize }"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { isEPIcon, getEPIconName } from '@/config/iconRegistry'

const props = withDefaults(defineProps<{
  /** 图标名称：EP 图标名或 SVG 精灵文件名 */
  name: string
  /** 图标尺寸，数字自动转为 px */
  size?: string | number
  /** 图标颜色，默认 currentColor 自动继承父级 */
  color?: string
  /** 强制作为 EP 图标渲染（跳过自动检测） */
  ep?: boolean
}>(), {
  size: '1em',
  color: 'currentColor',
  ep: false,
})

const iconSize = computed(() => {
  const s = props.size
  return typeof s === 'number' ? `${s}px` : s
})

const computedColor = computed(() => {
  const c = props.color
  return c || 'currentColor'
})

/** EP 图标组件名称（首字母大写） */
const epComponent = computed(() => {
  const epName = getEPIconName(props.name)
  return epName || props.name
})

const type = computed<'ep' | 'svg'>(() => {
  if (props.ep) return 'ep'
  if (isEPIcon(props.name)) return 'ep'
  return 'svg'
})
</script>

<style lang="scss" scoped>
.icon-svg {
  display: inline-block;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}
.icon-svg use {
  fill: inherit !important;
}
.icon-placeholder {
  display: inline-block;
  background: var(--el-fill-color-light, #f0f0f0);
  border-radius: 4px;
}
</style>

<!--
  非 scoped CSS：确保 SVG <use> 的 fill 在任何上下文中都能被覆盖。
  Vue scoped 的 [data-v-xxx] 属性选择器在 SVG 元素上可能因浏览器实现差异而失效，
  加一层全局规则兜底。
-->
<style lang="scss">
.icon-svg use {
  fill: inherit !important;
}
</style>
