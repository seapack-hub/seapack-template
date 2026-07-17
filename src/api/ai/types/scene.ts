/**
 * 场景管理 - 类型定义
 */

/** 场景实体 */
export interface Scene {
  id?: number
  /** 场景名称 */
  name: string
  /** 场景编码，唯一标识 */
  code: string
  /** 图标 */
  icon?: string
  /** 卡片渐变色 */
  coverColor?: string
  /** 场景描述 */
  description?: string
  /** 关联前端模块 */
  moduleKey?: string
  /** 模块内位置（如 detail-toolbar, editor-toolbar） */
  position?: string
  /** 1公开 0私有 */
  isPublic?: number
  /** 状态：1启用 0禁用 */
  status?: number
  /** 排序号 */
  sortOrder?: number
  /** 使用次数 */
  useCount?: number
  createdBy?: number
  createdAt?: string
  updatedAt?: string
}

/** 场景关联的完整信息（聚合 Agent + Knowledge） */
export interface SceneBindingInfo {
  sceneId: number
  sceneName: string
  sceneCode: string
  moduleKey: string
  position: string
  /** 默认 Agent */
  agentId: number
  agentName: string
  agentCode: string
  /** 场景配置（按钮文案等） */
  config?: Record<string, any>
  status: number
  /** 关联知识库 IDs */
  knowledgeIds?: number[]
}

/** 场景关联助手 */
export interface SceneAgent {
  id?: number
  sceneId?: number
  agentId?: number
  /** 助手名称（JOIN 返回） */
  agentName?: string
  /** 助手编码（JOIN 返回） */
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
  /** 知识库名称（JOIN 返回） */
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
