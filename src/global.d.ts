import type { TableColumnCtx } from 'element-plus';

declare global {
  //分页返回体
  type PageListType<T, K> = {
    list: T[];
    total: number;
    size: number;
    current: number;
    orders: K[];
    optimizeCountSql: boolean;
    isSearchCount: boolean;
    hitCount: boolean;
    countId: string;
    maxLimit: number;
  };

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
  }
}

export {};
