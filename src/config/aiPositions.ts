/**
 * AI 功能位置注册表
 *
 * 集中声明所有支持 AI 功能的「模块:位置」组合，作为唯一可信源。
 * 后端管理员配置绑定时从此注册表选择位置，前端消费方据此渲染按钮/菜单。
 *
 * @see SceneBindingDialog  管理员配置绑定时位置下拉来源于此
 * @see ArticleEdit         博客编辑器按钮组根据此注册表 + bindings 动态渲染
 */
import type { SceneBindingInfo } from '@/api/ai/scene'

export interface AiPosition {
  /** 模块标识，对应 MODULE_DEFS.key */
  moduleKey: string
  /** 模块内唯一的位置标识 */
  position: string
  /** 管理员看到的可读名称 */
  label: string
  /** 该位置用途说明 */
  description: string
  /** 参考组件路径（方便开发定位） */
  component?: string
}

export const AI_POSITIONS: AiPosition[] = [
  {
    moduleKey: 'blogsManagement',
    position: 'editor-toolbar',
    label: '文章编辑器工具栏',
    description: '文章编辑页顶部工具栏按钮区，用于 AI 写作、续写、润色等',
    component: 'ArticleEdit',
  },
  {
    moduleKey: 'stockFund',
    position: 'detail-toolbar',
    label: '股票详情工具栏',
    description: '股票详情页顶部操作栏，用于 AI 分析建议',
  },
  {
    moduleKey: 'aiModule',
    position: 'chat-sidebar',
    label: 'AI 聊天侧边栏',
    description: 'AI 对话页侧边栏，用于切换客服/知识库等模式',
  },
  {
    moduleKey: 'blogsManagement',
    position: 'settings-drawer',
    label: '文章设置抽屉',
    description: '文章编辑页右侧设置抽屉，用于 AI 生成标题、摘要等',
    component: 'ArticleSettingsDrawer',
  },
  {
    moduleKey: 'aiModule',
    position: 'skill-editor',
    label: '技能编辑器',
    description: 'AI 技能管理编辑弹窗，用于 AI 辅助编写提示词模板',
    component: 'SkillFormDialog',
  },
  {
    moduleKey: 'blogsManagement',
    position: 'project-editor',
    label: '项目编辑器',
    description: '博客项目编辑页，用于 AI 生成项目描述等',
    component: 'ProjectEdit',
  },
]

/** 根据 moduleKey 过滤该模块下的所有位置 */
export function getPositionsByModule(moduleKey: string): AiPosition[] {
  return AI_POSITIONS.filter(p => p.moduleKey === moduleKey)
}

/** 根据 moduleKey + position 获取位置可读标签 */
export function getPositionLabel(moduleKey: string, position: string): string {
  const found = AI_POSITIONS.find(p => p.moduleKey === moduleKey && p.position === position)
  return found?.label || position
}

/** 根据 position 获取位置可读标签（无需 moduleKey，但 position 需全局唯一） */
export function getPositionLabelByPosition(position: string): string {
  const found = AI_POSITIONS.find(p => p.position === position)
  return found?.label || position
}

/** 将绑定列表转换为按 moduleKey 分组的 Map，方便消费方按模块渲染 */
export function groupBindingsByModule(bindings: SceneBindingInfo[]): Map<string, SceneBindingInfo[]> {
  const map = new Map<string, SceneBindingInfo[]>()
  for (const b of bindings) {
    const key = b.moduleKey
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(b)
  }
  return map
}
