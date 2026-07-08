/**
 * 通用分页类型定义
 *
 * 注意：PageQuery 和 PageResult 同时在 global.d.ts 中作为 ambient 类型声明，
 * 供现有 API 文件无需显式 import 即可使用。
 * 本文件提供显式导出，供新代码或需要明确类型来源的场景使用。
 */

/** 分页查询参数 */
export interface PageQuery {
  pageNum: number
  pageSize: number
}

/** 分页响应对象 */
export interface PageResult<T> {
  /** 数据列表 */
  list: T
  /** 总数 */
  total: number
}

/**
 * AI 执行结果（对应后端 AiExecuteResult）
 *
 * 用于 promptTemplate.preview() 和 skill.execute() 的返回类型。
 * 注意区分 AiExecutionResult（skill.ts）— 那是经过前端处理后的统一结果格式。
 */
export interface AiExecuteResult {
  /** 渲染后的完整 Prompt（变量替换后） */
  renderedPrompt: string
  /** LLM 生成的输出内容 */
  output: string
  /** 提示词消耗的 Token 数 */
  tokensPrompt: number
  /** 补全生成的 Token 数 */
  tokensCompletion: number
  /** 执行耗时（毫秒） */
  durationMs: number
}
