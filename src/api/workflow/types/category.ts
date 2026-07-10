/** 工作流分类 */
export interface WorkflowCategory {
  id?: number
  name: string
  parentId?: number
  sortOrder?: number
  status?: number

  // 非数据库字段（树形结构辅助）
  children?: WorkflowCategory[]
  childCount?: number
  parentName?: string
}
