import type { TableColumnCtx } from 'element-plus';

declare global {
  //表格作用域插槽类型
  interface ScopeType {
    row: Record<string, any>;
    column: TableColumnCtx;
    $index: number;
    rowIndex: number;
    columnIndex: number;
    rowId: string | number;
  };

    /**
   * 下拉选项数据类型
   */
  interface OptionType {
    /** 值 */
    value: string | number;
    /** 文本 */
    label: string;
    /** 子列表  */
    children?: OptionType[];
  };

   /**
   * 分页查询参数
   */
  interface PageQuery {
    pageNum: number;
    pageSize: number;
  }

    /**
   * 分页响应对象
   */
  interface PageResult<T> {
    /** 数据列表 */
    list: T;
    /** 总数 */
    total: number;
  }

  /**
   * AI 执行结果（对应后端 AiExecuteResult）
   */
  interface AiExecuteResult {
    /** 渲染后的完整 Prompt（变量替换后） */
    renderedPrompt: string;
    /** LLM 生成的输出内容 */
    output: string;
    /** 提示词消耗的 Token 数 */
    tokensPrompt: number;
    /** 补全生成的 Token 数 */
    tokensCompletion: number;
    /** 执行耗时（毫秒） */
    durationMs: number;
  }
}

export {};
