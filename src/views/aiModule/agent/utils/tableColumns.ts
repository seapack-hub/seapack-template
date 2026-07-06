/**
 * Agent 管理 — 表格列配置
 */

/** Agent 列表列 */
export const AGENT_LIST_COLUMNS = [
  { prop: 'name', label: '助手名称', minWidth: 140 },
  { prop: 'code', label: '编码', minWidth: 120 },
  { prop: 'modelCode', label: '模型', width: 120 },
  { prop: 'description', label: '描述', minWidth: 200, showOverflowTooltip: true },
  { prop: 'useCount', label: '使用次数', width: 90, align: 'center' as const },
  { prop: 'version', label: '版本', width: 80, align: 'center' as const },
  { prop: 'createdAt', label: '创建时间', width: 160 },
]

/** Agent 关联提示词模板列 */
export const AGENT_PROMPT_COLUMNS = [
  { prop: 'templateName', label: '模板名称', minWidth: 140 },
  { prop: 'templateCode', label: '模板编码', minWidth: 120 },
  { prop: 'isPrimary', label: '类型', width: 80, align: 'center' as const },
  { prop: 'enabled', label: '状态', width: 70, align: 'center' as const },
  { prop: 'sortOrder', label: '排序', width: 70, align: 'center' as const },
]

/** Agent 关联技能列 */
export const AGENT_SKILL_COLUMNS = [
  { prop: 'skillName', label: '技能名称', minWidth: 140 },
  { prop: 'skillCode', label: '技能编码', minWidth: 120 },
  { prop: 'isPrimary', label: '类型', width: 80, align: 'center' as const },
  { prop: 'enabled', label: '状态', width: 70, align: 'center' as const },
  { prop: 'sortOrder', label: '排序', width: 70, align: 'center' as const },
]

/** Agent 关联知识库列 */
export const AGENT_KNOWLEDGE_COLUMNS = [
  { prop: 'knowledgeName', label: '知识库名称', minWidth: 160 },
  { prop: 'retrievalCount', label: '检索片段数', width: 100, align: 'center' as const },
  { prop: 'enabled', label: '状态', width: 70, align: 'center' as const },
  { prop: 'sortOrder', label: '排序', width: 70, align: 'center' as const },
]
