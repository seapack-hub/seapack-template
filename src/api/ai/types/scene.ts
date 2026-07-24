/**
 * 场景管理 - 类型定义
 */

/** 场景实体 */
export interface Scene {
  id?: number
  name: string
  code: string
  icon?: string
  coverColor?: string
  description?: string
  /** 1公开 0私有 */
  isPublic?: number
  /** 状态：1启用 0禁用 */
  status?: number
  sortOrder?: number
  useCount?: number
  createdBy?: number
  createdAt?: string
  updatedAt?: string
  /** 部署信息（查询时由后端聚合填充） */
  deployments?: SceneDeployment[]
}

/** 场景部署配置（场景→模块+位置的 M:N 映射） */
export interface SceneDeployment {
  id?: number
  sceneId?: number
  /** 前端模块标识，对应 config/modules.ts 的 key */
  moduleKey: string
  /** 模块内位置标识，对应 aiPositions.ts 的 position */
  positionKey: string
  /** 部署配置 JSON（按钮文案、图标、tooltip 等） */
  config?: Record<string, any>
  /** 是否该位置的默认场景 */
  isDefault?: number
  sortOrder?: number
  status?: number
  createdAt?: string
  updatedAt?: string
}

/** 场景级 Agent 运行配置 */
export interface SceneAgentConfig {
  id?: number
  sceneId?: number
  agentId?: number
  /** 助手名称（JOIN 返回） */
  agentName?: string
  /** 覆盖模型编码，NULL 使用 Agent 默认 */
  model?: string | null
  /** 覆盖温度，NULL 使用 Agent 默认 */
  temperature?: number | null
  /** 最大输出 Token，NULL 使用 Agent 默认 */
  maxTokens?: number | null
  /** 场景级追加 System Prompt */
  systemPrompt?: string | null
  /** 输出格式 */
  outputFormat?: string
  /** 上下文窗口上限 */
  contextLimit?: number
  createdAt?: string
  updatedAt?: string
}

/** 场景绑定查询返回（聚合 deployment + agent + knowledge） */
export interface SceneBindingInfo {
  sceneId: number
  sceneName: string
  sceneCode: string
  moduleKey: string
  positionKey: string
  agentId: number
  agentName: string
  agentCode: string
  deploymentConfig?: Record<string, any>
  isDefault?: number
  status: number
  knowledgeIds?: number[]
  /** 场景级 Agent 配置覆盖 */
  agentModel?: string
  agentTemperature?: number
  agentMaxTokens?: number
  agentSystemPrompt?: string
  agentOutputFormat?: string
  agentContextLimit?: number
}

/** 场景关联助手 */
export interface SceneAgent {
  id?: number
  sceneId?: number
  agentId?: number
  agentName?: string
  agentCode?: string
  /** 1=默认助手 0=普通 */
  isDefault?: number
  sortOrder?: number
  createdAt?: string
}

/** 场景关联知识库 */
export interface SceneKnowledge {
  id?: number
  sceneId?: number
  knowledgeId?: number
  knowledgeName?: string
  enabled?: number
  createdAt?: string
}

/** 场景分页查询参数 */
export interface SceneQuery {
  pageNum: number
  pageSize: number
  status?: number
  keyword?: string
}
