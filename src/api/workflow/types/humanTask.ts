/** 人工任务 */
export interface HumanTask {
  id?: number
  instanceId: number
  nodeId: string
  nodeLogId?: number

  // 任务类型
  taskType: string

  // 审批人配置
  assigneeType?: string
  assigneeIds?: number[]
  assigneeExpression?: string

  // 任务内容
  title?: string
  description?: string
  content?: Record<string, any>

  // 任务状态
  status?: number

  // 审核结果
  action?: string
  result?: Record<string, any>
  comment?: string

  // 超时策略
  timeoutMinutes?: number
  timeoutAction?: string

  // 转办信息
  delegatedTo?: number
  delegatedAt?: string

  // 时间信息
  dueAt?: string
  startedAt?: string
  completedAt?: string
  createdAt?: string

  // 关联字段（查询返回）
  workflowName?: string
  workflowId?: number
}

/** 标注记录 */
export interface AnnotationRecord {
  id?: number
  taskId: number
  instanceId?: number
  nodeLogId?: number

  contentId?: string
  contentType?: string
  annotationType?: string

  label?: string
  score?: number
  content?: string
  metadata?: Record<string, any>

  annotatedBy?: number
  annotatedByName?: string
  annotatedAt?: string
}

/** 反馈记录 */
export interface FeedbackRecord {
  id?: number
  taskId?: number
  instanceId?: number
  nodeLogId?: number
  sessionId?: number

  feedbackType: string

  originalOutput?: string
  correctedOutput?: string
  reason?: string
  rating?: number

  skillId?: number
  modelCode?: string

  createdBy?: number
  createdByName?: string
  createdAt?: string
}

/** 人工任务查询参数 */
export interface HumanTaskQuery {
  keyword?: string
  taskType?: string
  status?: number
  instanceId?: number
  pageNum: number
  pageSize: number
}
