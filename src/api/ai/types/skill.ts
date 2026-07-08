/**
 * 技能管理 - 类型定义
 *
 * 包含原 skillExecution.ts 中的执行日志类型（已合并）
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
  /** 图标 SVG 文件名 */
  icon?: string
  /** 描述 */
  description?: string
  /** 系统提示词模板，支持 {{variable}} 插值 */
  promptTemplate?: string
  /** LLM 温度参数 0-2 */
  temperature?: number
  /** 最大输出 token 数 */
  maxTokens?: number
  /** 输出格式：markdown/json/text/html */
  outputFormat?: string
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
  /** 状态筛选（可选） */
  status?: number
  /** 关键词搜索（名称/编码） */
  keyword?: string
}

/**
 * 技能输入参数（向后兼容，用于直接执行技能时的参数定义）
 *
 * 新设计中参数（变量）已迁移至 ai_template_variable 表，归属提示词模板。
 * 此类型保留用于：
 *   1. 直接执行技能（不经过 Agent）时的参数声明
 *   2. SkillBindingInfo 中聚合展示
 * 新增/编辑参数请使用 PromptTemplateAPI 的变量管理接口。
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

/** 技能-模块绑定实体 */
export interface SkillBinding {
  id?: number
  skillId?: number
  /** 模块标识，对应 config/modules.ts 的 key */
  moduleKey: string
  /** 模块内位置 */
  position?: string
  /** 展示配置 JSON */
  config?: Record<string, any>
  /** 状态：1启用 0禁用 */
  status?: number
}

/** 技能执行请求体，对应后端 SkillExecuteRequest */
export interface SkillExecuteRequest {
  /** 技能参数键值对 */
  params: Record<string, any>
  /** 用户补充消息，附加在 prompt_template 之后 */
  userMessage?: string
}

/** 技能绑定的完整信息（含技能详情和参数定义），供批量查询接口返回 */
export interface SkillBindingInfo {
  /** 技能 ID */
  skillId: number
  /** 技能名称 */
  skillName: string
  /** 技能编码 */
  skillCode: string
  /** 系统提示词模板 */
  promptTemplate?: string
  /** LLM 温度参数 */
  temperature?: number
  /** 最大输出 token 数 */
  maxTokens?: number
  /** 输出格式 */
  outputFormat?: string
  /** 模块标识 */
  moduleKey: string
  /** 模块内位置 */
  position: string
  /** 状态：1启用 0禁用 */
  status: number
  /** 展示配置 JSON */
  config?: Record<string, any>
  /** 技能的参数定义列表 */
  params: SkillParam[]
}

/** 统一 AI 执行结果，消费方据此处理插入/替换/预览 */
export interface AiExecutionResult {
  /** 是否执行成功 */
  success: boolean
  /** 主输出内容 */
  content: string
  /** 内容类型，消费方根据此决定插入方式 */
  contentType: 'markdown' | 'html' | 'text' | 'json'
  /** 技能名称 */
  skillName: string
  /** 技能 ID */
  skillId: number
  /** 执行日志 ID */
  executionLogId?: number
  /** 执行耗时（毫秒） */
  elapsedMs: number
  /** 扩展元数据（JSON 格式时存放结构化内容） */
  meta?: Record<string, any>
}

// ===== 调试日志 =====

/** 调试日志实体 */
export interface SkillDebugLog {
  id?: number
  skillId?: number
  skillName?: string
  skillCode?: string
  /** 输入参数 */
  inputParams?: Record<string, any>
  /** 用户补充指令 */
  userMessage?: string
  /** 原始提示词模板（含 {{变量}}） */
  rawPromptTemplate?: string
  /** 变量替换后的完整 Prompt */
  renderedPrompt?: string
  /** 发送给 LLM 的完整请求体 */
  llmRequestBody?: Record<string, any>
  /** LLM 返回的原始响应体 */
  llmResponseBody?: Record<string, any>
  /** 实际调用的模型 */
  llmModel?: string
  /** 提示词 Token 数 */
  tokensPrompt?: number
  /** 补全 Token 数 */
  tokensCompletion?: number
  /** 总耗时（毫秒） */
  durationMs?: number
  /** LLM 调用耗时（毫秒） */
  durationLlmMs?: number
  /** 最终输出结果 */
  outputResult?: string
  /** 状态 */
  status?: string
  /** 错误信息 */
  errorMessage?: string
  createdBy?: number
  createdAt?: string
}

/** 调试执行请求 */
export interface SkillDebugRequest {
  params: Record<string, any>
  userMessage?: string
}

/** 调试执行响应 */
export interface SkillDebugResponse {
  /** 最终输出 */
  output: string
  /** 渲染后的 Prompt */
  renderedPrompt: string
  /** 原始模板 */
  rawPromptTemplate: string
  /** LLM 请求体 */
  llmRequestBody: Record<string, any>
  /** LLM 响应体 */
  llmResponseBody: Record<string, any>
  /** 模型 */
  llmModel: string
  /** Token 数 */
  tokensPrompt: number
  tokensCompletion: number
  /** 总耗时 */
  durationMs: number
  /** LLM 调用耗时 */
  durationLlmMs: number
  /** 日志 ID */
  debugLogId: number
}

// ===== 执行日志（原 skillExecution.ts） =====

/** 技能执行日志实体 */
export interface SkillExecutionLog {
  id: number
  /** 技能ID */
  skillId: number
  /** 技能编码（冗余） */
  skillCode?: string
  /** 来源模块 */
  moduleKey?: string
  /** 输入参数 JSON */
  inputParams?: Record<string, any>
  /** 输出结果 */
  outputResult?: string
  /** 提示词 token 数 */
  tokensPrompt?: number
  /** 补全 token 数 */
  tokensCompletion?: number
  /** 耗时（毫秒） */
  durationMs?: number
  /** 状态：success/fail/timeout */
  status: string
  /** 错误信息 */
  errorMessage?: string
  /** 执行人ID */
  createdBy?: number
  /** 执行时间 */
  createdAt: string
}

/** 执行日志分页查询参数 */
export interface ExecutionLogQuery {
  pageNum: number
  pageSize: number
  /** 技能ID筛选 */
  skillId?: number
  /** 状态筛选 */
  status?: string
  /** 关键词搜索 */
  keyword?: string
}
