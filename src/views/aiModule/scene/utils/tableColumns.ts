/**
 * 场景管理 — 表格列配置
 */

/** 场景列表列 */
export const SCENE_LIST_COLUMNS = [
  { prop: 'name', label: '场景名称', minWidth: 140 },
  { prop: 'code', label: '编码', minWidth: 120 },
  { prop: 'description', label: '描述', minWidth: 200, showOverflowTooltip: true },
  { prop: 'useCount', label: '使用次数', minWidth: 90, align: 'center' as const },
  { prop: 'createdAt', label: '创建时间', minWidth: 160 },
]

/** 场景关联助手列 */
export const SCENE_AGENT_COLUMNS = [
  { prop: 'agentName', label: '助手名称', minWidth: 140 },
  { prop: 'agentCode', label: '助手编码', minWidth: 120 },
  { prop: 'isDefault', label: '类型', minWidth: 90, align: 'center' as const },
  { prop: 'sortOrder', label: '排序', minWidth: 70, align: 'center' as const },
]

/** 场景关联知识库列 */
export const SCENE_KNOWLEDGE_COLUMNS = [
  { prop: 'knowledgeName', label: '知识库名称', minWidth: 160 },
  { prop: 'enabled', label: '状态', minWidth: 70, align: 'center' as const },
]

/** 场景部署列 */
export const SCENE_DEPLOYMENT_COLUMNS = [
  { prop: 'moduleKey', label: '前端模块', minWidth: 120 },
  { prop: 'positionKey', label: '位置', minWidth: 140 },
  { prop: 'isDefault', label: '默认', minWidth: 70, align: 'center' as const },
  { prop: 'status', label: '状态', minWidth: 70, align: 'center' as const },
]

/** 场景级 Agent 配置列 */
export const SCENE_AGENT_CONFIG_COLUMNS = [
  { prop: 'agentName', label: '助手', minWidth: 120 },
  { prop: 'model', label: '模型', minWidth: 110 },
  { prop: 'temperature', label: '温度', minWidth: 70, align: 'center' as const },
  { prop: 'maxTokens', label: '最大Token', minWidth: 90, align: 'center' as const },
  { prop: 'outputFormat', label: '输出格式', minWidth: 90, align: 'center' as const },
  { prop: 'contextLimit', label: '上下文上限', minWidth: 100, align: 'center' as const },
]
