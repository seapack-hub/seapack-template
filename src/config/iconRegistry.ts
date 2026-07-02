/**
 * 图标名称注册表
 *
 * 统一管理项目中所有 Element Plus 图标名称和 SVG 图标名称。
 * 消费方通过 isEPIcon() 判断传入名称属于哪类图标，再由 <Icon> 组件统一渲染。
 *
 * @see Icon 组件 src/components/Icon/index.vue
 */

import * as ElementPlusIcons from '@element-plus/icons-vue'

/** 所有 Element Plus 图标名（大驼峰），如 'Search', 'ArrowDown' */
export const EP_ICON_NAMES: Set<string> = new Set(Object.keys(ElementPlusIcons))

/**
 * 判断指定名称是否为 Element Plus 图标（大小写不敏感）
 * - 'search' → true（匹配 Search）
 * - 'Search' → true
 * - 'user-custom' → false（非 EP 图标）
 */
export function isEPIcon(name?: string): boolean {
  if (!name) return false
  if (EP_ICON_NAMES.has(name)) return true
  // 首字母转大写后重试，兼容 icon="search" 这种字符串 prop 写法
  const capitalized = name.charAt(0).toUpperCase() + name.slice(1)
  return EP_ICON_NAMES.has(capitalized)
}

/**
 * 获取 EP 图标组件名
 * 传入 'search' → 返回 'Search'；传入 'Search' → 返回 'Search'
 */
export function getEPIconName(name: string): string | undefined {
  if (EP_ICON_NAMES.has(name)) return name
  const capitalized = name.charAt(0).toUpperCase() + name.slice(1)
  return EP_ICON_NAMES.has(capitalized) ? capitalized : undefined
}
