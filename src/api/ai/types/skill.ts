/**
 * 技能管理 - 类型定义
 *
 * 仅保留技能基础实体、查询参数和参数定义。
 * 绑定（SkillBinding）、执行（AiExecutionResult）、调试（SkillDebugLog）、
 * 日志（SkillExecutionLog）等类型已迁移至 Scene/Agent 体系。
 */

/** 技能实体 */
export interface Skill {
  id?: number
  /** 所属分类ID */
  categoryId?: number
  /** 分类名称（只读） */
  categoryName?: string
  /** 技能名称 */
  name: string
  /** 技能编码 */
  code: string
  /** 图标 */
  icon?: string
  /** 描述 */
  description?: string
  /** 技能类型：tool/rag/hybrid */
  skillType?: string
  /** API 端点 */
  endpoint?: string
  /** 超时时间（毫秒） */
  timeoutMs?: number
  /** 输入参数 JSON Schema */
  inputSchema?: string
  /** 当前版本号 */
  version?: string
  /** 状态：1启用 0禁用 */
  status?: number
  /** 排序号 */
  sortOrder?: number
  /** 使用次数 */
  useCount?: number
  createdAt?: string
  updatedAt?: string
}

/** 技能分页查询参数 */
export interface SkillQuery {
  pageNum: number
  pageSize: number
  /** 分类ID（可选） */
  categoryId?: number
  /** 技能类型筛选（可选） */
  skillType?: string
  /** 状态筛选（可选） */
  status?: number
  /** 关键词搜索（名称/编码） */
  keyword?: string
}

/**
 * 技能输入参数
 *
 * 参数（变量）归属提示词模板，由 PromptTemplateAPI 管理。
 * 此类型保留用于 SkillParamEditor 展示。
 */
export interface SkillParam {
  id?: number
  skillId?: number
  paramName: string
  label: string
  paramType: string
  required?: number
  defaultValue?: string
  options?: { label: string; value: string }[]
  placeholder?: string
  sortOrder?: number
}
