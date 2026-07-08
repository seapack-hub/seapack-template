/**
 * 场景管理 — 表格列配置
 */

/** 场景列表列 */
export const SCENE_LIST_COLUMNS = [
  { prop: 'name', label: '场景名称', minWidth: 140 },
  { prop: 'code', label: '编码', minWidth: 120 },
  { prop: 'description', label: '描述', minWidth: 200, showOverflowTooltip: true },
  { prop: 'moduleKey', label: '前端模块', width: 120 },
  { prop: 'useCount', label: '使用次数', width: 90, align: 'center' as const },
  { prop: 'createdAt', label: '创建时间', width: 160 },
]

/** 场景关联助手列 */
export const SCENE_AGENT_COLUMNS = [
  { prop: 'agentName', label: '助手名称', minWidth: 140 },
  { prop: 'agentCode', label: '助手编码', minWidth: 120 },
  { prop: 'isDefault', label: '类型', width: 90, align: 'center' as const },
  { prop: 'sortOrder', label: '排序', width: 70, align: 'center' as const },
]

/** 场景关联知识库列 */
export const SCENE_KNOWLEDGE_COLUMNS = [
  { prop: 'knowledgeName', label: '知识库名称', minWidth: 160 },
  { prop: 'enabled', label: '状态', width: 70, align: 'center' as const },
]
