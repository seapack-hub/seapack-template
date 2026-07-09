<!--
  Icon — 统一图标组件

  容器始终以 size 为宽高，图标居中显示。
  无论图标是否存在，容器始终占有指定大小，保证布局稳定。

  自动识别渲染方式（按优先级）：
    1. EP 图标   — 通过 <el-icon><component :is="..." /></el-icon> 渲染
    2. SVG 精灵   — 通过 <svg><use :href="#icon-{name}" /></svg> 渲染
    3. 缺失占位   — 灰色方块

  特性：
    - 默认 color="currentColor"，自动继承父元素文本色
    - 支持数字 size 自动转 px
    - 容器始终占满 size × size，图标不存在时也保留空间

  用法：
    <Icon name="user" :size="20" />
    <Icon name="Search" ep />
    <Icon name="edit" color="#409eff" />

  @see iconRegistry.ts — EP 图标名称注册表
-->
<template>
  <span class="icon-box" :style="boxStyle">
    <el-icon v-if="type === 'ep'" :size="innerSize" :color="computedColor">
      <component :is="epComponent" />
    </el-icon>
    <svg
      v-else-if="type === 'svg'"
      class="icon-svg"
      :style="{ width: innerSize, height: innerSize, color: computedColor }"
    >
      <use :href="`#icon-${name}`" />
    </svg>
    <span v-else class="icon-placeholder" :style="{ width: innerSize, height: innerSize }" />
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { isEPIcon, getEPIconName } from '@/config/iconRegistry'

const props = withDefaults(defineProps<{
  /** 图标名称：EP 图标名或 SVG 精灵文件名 */
  name: string
  /** 图标尺寸，数字自动转为 px，作为容器宽高 */
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

/** 数字 → px 字符串 */
function toPx(v: string | number): string {
  return typeof v === 'number' ? `${v}px` : v
}

/** 容器宽高 = size */
const boxStyle = computed(() => ({
  width: toPx(props.size),
  height: toPx(props.size),
}))

/** 内部图标尺寸：使用容器内可用空间 */
const innerSize = computed(() => toPx(props.size))

const computedColor = computed(() => props.color || 'currentColor')

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
.icon-box {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  vertical-align: middle;
}

.icon-svg {
  display: inline-block;
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
-->
<style lang="scss">
.icon-svg use {
  fill: inherit !important;
}
</style>
