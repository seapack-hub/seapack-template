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

// ===== 编排管理 =====
export interface OrchestrationHandlers {
  onEdit: (row: any) => void
  onDelete: (row: any) => void
  onCopy: (row: any) => void
  onToggleStatus: (row: any) => void
  onSteps: (row: any) => void
}

export function createOrchestrationColumns(handlers: OrchestrationHandlers) {
  return [
    { prop: 'name', label: '编排名称', minWidth: 140 },
    { prop: 'code', label: '编码', minWidth: 120 },
    { prop: 'strategy', label: '执行策略', minWidth: 100, align: 'center' as const, slotName: 'strategy' },
    { prop: 'status', label: '状态', minWidth: 70, align: 'center' as const, slotName: 'status' },
    { prop: 'description', label: '描述', minWidth: 180, showOverflowTooltip: true },
    { prop: 'createdAt', label: '创建时间', minWidth: 160 },
    {
      columnType: 'operate', label: '操作', width: 160, fixed: 'right',
      buttons: [
        { type: 'success', label: '步骤', size: 'small', renderType: 'link', click: ({ row }: any) => handlers.onSteps(row) },
        { type: 'primary', label: '编辑', size: 'small', renderType: 'link', click: ({ row }: any) => handlers.onEdit(row) },
        { type: 'info', label: '复制', size: 'small', renderType: 'link', click: ({ row }: any) => handlers.onCopy(row) },
        { type: 'warning', label: '启停', size: 'small', renderType: 'link', click: ({ row }: any) => handlers.onToggleStatus(row) },
        { type: 'danger', label: '删除', size: 'small', renderType: 'link', popconFirm: { title: '确认删除该编排？' }, click: ({ row }: any) => handlers.onDelete(row) },
      ],
    },
  ]
}

// ===== 编排步骤 =====
export interface OrchestrationStepHandlers {
  onEdit: (row: any) => void
  onDelete: (row: any) => void
}

export function createOrchestrationStepColumns(handlers: OrchestrationStepHandlers) {
  return [
    { prop: 'stepIndex', label: '序号', width: 60, align: 'center' as const },
    { prop: 'stepName', label: '步骤名称', minWidth: 140 },
    { prop: 'agentName', label: '执行Agent', minWidth: 120 },
    { prop: 'inputMapping', label: '输入映射', minWidth: 160, showOverflowTooltip: true, slotName: 'inputMapping' },
    { prop: 'retryCount', label: '重试', width: 60, align: 'center' as const },
    { prop: 'status', label: '状态', minWidth: 70, align: 'center' as const, slotName: 'status' },
    {
      columnType: 'operate', label: '操作', width: 120, fixed: 'right',
      buttons: [
        { type: 'primary', label: '编辑', size: 'small', renderType: 'link', click: ({ row }: any) => handlers.onEdit(row) },
        { type: 'danger', label: '删除', size: 'small', renderType: 'link', popconFirm: { title: '确认删除该步骤？' }, click: ({ row }: any) => handlers.onDelete(row) },
      ],
    },
  ]
}
