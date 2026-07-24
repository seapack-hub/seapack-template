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

// ===== 关联助手 =====
export interface SceneAgentHandlers {
  onEdit: (row: any) => void
  onDelete: (row: any) => void
}

export function createSceneAgentColumns(handlers: SceneAgentHandlers) {
  return [
    { prop: 'agentName', label: '助手名称', minWidth: 140 },
    { prop: 'agentCode', label: '助手编码', minWidth: 120 },
    { prop: 'isDefault', label: '类型', minWidth: 90, align: 'center' as const, slotName: 'isDefault' },
    { prop: 'sortOrder', label: '排序', minWidth: 70, align: 'center' as const },
    {
      columnType: 'operate', label: '操作', width: 120, fixed: 'right',
      buttons: [
        { type: 'primary', label: '编辑', size: 'small', renderType: 'link', click: ({ row }: any) => handlers.onEdit(row) },
        { type: 'danger', label: '删除', size: 'small', renderType: 'link', popconFirm: { title: '确认删除该关联助手？' }, click: ({ row }: any) => handlers.onDelete(row) },
      ],
    },
  ]
}

// ===== 关联知识库 =====
export interface SceneKnowledgeHandlers {
  onDelete: (row: any) => void
}

export function createSceneKnowledgeColumns(handlers: SceneKnowledgeHandlers) {
  return [
    { prop: 'knowledgeName', label: '知识库名称', minWidth: 160 },
    { prop: 'enabled', label: '状态', minWidth: 70, align: 'center' as const, slotName: 'enabled' },
    {
      columnType: 'operate', label: '操作', width: 80, fixed: 'right',
      buttons: [
        { type: 'danger', label: '删除', size: 'small', renderType: 'link', popconFirm: { title: '确认删除该关联知识库？' }, click: ({ row }: any) => handlers.onDelete(row) },
      ],
    },
  ]
}

// ===== 部署位置 =====
export interface SceneDeploymentHandlers {
  onEdit: (row: any) => void
  onDelete: (row: any) => void
}

export function createSceneDeploymentColumns(handlers: SceneDeploymentHandlers) {
  return [
    { prop: 'moduleKey', label: '前端模块', minWidth: 120 },
    { prop: 'positionKey', label: '位置', minWidth: 140 },
    { prop: 'isDefault', label: '默认', minWidth: 70, align: 'center' as const, slotName: 'isDefault' },
    { prop: 'status', label: '状态', minWidth: 70, align: 'center' as const, slotName: 'status' },
    {
      columnType: 'operate', label: '操作', width: 120, fixed: 'right',
      buttons: [
        { type: 'primary', label: '编辑', size: 'small', renderType: 'link', click: ({ row }: any) => handlers.onEdit(row) },
        { type: 'danger', label: '删除', size: 'small', renderType: 'link', popconFirm: { title: '确认删除该部署？' }, click: ({ row }: any) => handlers.onDelete(row) },
      ],
    },
  ]
}

// ===== Agent 运行配置 =====
export interface SceneAgentConfigHandlers {
  onEdit: (row: any) => void
  onDelete: (row: any) => void
}

export function createSceneAgentConfigColumns(handlers: SceneAgentConfigHandlers) {
  return [
    { prop: 'agentName', label: '助手', minWidth: 120 },
    { prop: 'model', label: '模型', minWidth: 110, slotName: 'model' },
    { prop: 'temperature', label: '温度', minWidth: 70, align: 'center' as const, slotName: 'temperature' },
    { prop: 'maxTokens', label: '最大Token', minWidth: 90, align: 'center' as const },
    { prop: 'outputFormat', label: '输出格式', minWidth: 90, align: 'center' as const },
    { prop: 'contextLimit', label: '上下文上限', minWidth: 100, align: 'center' as const },
    {
      columnType: 'operate', label: '操作', width: 120, fixed: 'right',
      buttons: [
        { type: 'primary', label: '编辑', size: 'small', renderType: 'link', click: ({ row }: any) => handlers.onEdit(row) },
        { type: 'danger', label: '删除', size: 'small', renderType: 'link', popconFirm: { title: '确认删除该运行配置？' }, click: ({ row }: any) => handlers.onDelete(row) },
      ],
    },
  ]
}
