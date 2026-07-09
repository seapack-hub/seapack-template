/** 工作流分类 */
export interface WorkflowCategory {
  id?: number
  name: string
  parentId?: number
  sortOrder?: number
  status?: number
  children?: WorkflowCategory[]
}
