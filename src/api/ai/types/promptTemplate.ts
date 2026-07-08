/**
 * 提示词模板管理 - 类型定义
 */

/** 提示词模板实体 */
export interface PromptTemplate {
  id?: number
  /** 模板名称 */
  name: string
  /** 模板编码，唯一标识 */
  code: string
  /** 模板类型：1=系统预设 2=用户自定义 */
  type?: number
  /** 分类：stock_analysis / content_gen / data_qa / general */
  category?: string
  /** 模板正文，支持 {{变量名}} 占位符 */
  content: string
  /** 变量定义 */
  variables?: TemplateVariable[]
  /** 描述 */
  description?: string
  /** 输出格式：markdown/json/text/html */
  outputFormat?: string
  /** 版本号 */
  version?: string
  /** 被引用次数 */
  useCount?: number
  /** 状态：1启用 0禁用 */
  status?: number
  createdBy?: number
  createdAt?: string
  updatedAt?: string
}

/** 模板变量定义 */
export interface TemplateVariable {
  id?: number
  templateId?: number
  /** 变量名，对应 content 中的 {{var_name}} */
  varName: string
  /** 显示标签，如"股票代码" */
  label: string
  /** 变量类型：string/number/boolean/select/date */
  varType: string
  /** 是否必填：1是 0否 */
  required?: number
  /** 默认值 */
  defaultValue?: string
  /** select 类型选项列表 */
  options?: { label: string; value: string }[]
  /** 输入提示 */
  placeholder?: string
  /** 排序号 */
  sortOrder?: number
}

/** 分页查询参数 */
export interface PromptTemplateQuery {
  pageNum: number
  pageSize: number
  /** 分类筛选 */
  category?: string
  /** 状态筛选 */
  status?: number
  /** 关键词搜索（名称/编码） */
  keyword?: string
}

/** 执行预览请求 */
export interface PromptPreviewRequest {
  /** 模板 ID */
  templateId: number
  /** 变量值键值对 */
  params: Record<string, any>
  /** 用户补充消息 */
  userMessage?: string
}
