/**
 * AI 助手位置管理 - 类型定义
 */

/** AI 助手位置实体 */
export interface AiPosition {
  id?: number
  /** 前端模块标识，如 blogsManagement、stockFund */
  moduleKey: string
  /** 模块内位置标识，如 editor-toolbar、detail-toolbar */
  positionKey: string
  /** 位置显示名称，如 "文章编辑器工具栏" */
  label: string
  /** 位置描述 */
  description?: string
  /** 关联前端组件名（可选） */
  component?: string
  /** 状态：1启用 0禁用 */
  status?: number
  /** 排序号 */
  sortOrder?: number
  createdAt?: string
  updatedAt?: string
}

/** AI 助手位置分页查询参数 */
export interface AiPositionQuery {
  pageNum: number
  pageSize: number
  /** 模块标识筛选 */
  moduleKey?: string
  /** 状态筛选 */
  status?: number
  /** 关键词搜索（label/positionKey） */
  keyword?: string
}
