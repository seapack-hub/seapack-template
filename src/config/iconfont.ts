/**
 * Iconfont 图标注册表
 *
 * 从 iconfont.json 中读取图标元数据，供 IconPicker 展示和搜索 SVG 图标。
 * iconfont.json 由 iconfont.cn 生成，需手动下载后放入 src/assets/iconfont/。
 *
 * @see src/assets/iconfont/README.md 更新步骤
 */

import iconfontData from '@/assets/iconfont/iconfont.json'

export interface IconfontGlyph {
  /** Iconfont 内部 ID */
  icon_id: string
  /** 图标中文名称，用于搜索和展示 */
  name: string
  /** CSS class 名，也是 Symbol ID 后缀 */
  font_class: string
  /** unicode 编码 */
  unicode: string
}

/** 所有图标元数据 */
export const ICONFONT_GLYPHS: IconfontGlyph[] = (iconfontData as any).glyphs || []

/** 图标 font_class 名集合（用于快速判断） */
export const ICONFONT_NAMES: Set<string> = new Set(ICONFONT_GLYPHS.map(g => g.font_class))

/** 是否为 Iconfont 图标 */
export function isIconfontIcon(name?: string): boolean {
  return !!name && ICONFONT_NAMES.has(name)
}

/** 按 font_class 查询图标元数据 */
export function getIconfontGlyph(fontClass: string): IconfontGlyph | undefined {
  return ICONFONT_GLYPHS.find(g => g.font_class === fontClass)
}

/** 搜索 Iconfont 图标（按中文名或 font_class） */
export function searchIconfontGlyphs(keyword: string): IconfontGlyph[] {
  if (!keyword.trim()) return ICONFONT_GLYPHS
  const kw = keyword.toLowerCase()
  return ICONFONT_GLYPHS.filter(
    g => g.name.includes(kw) || g.font_class.toLowerCase().includes(kw),
  )
}
