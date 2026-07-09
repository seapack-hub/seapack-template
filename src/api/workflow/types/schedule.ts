/** 工作流调度 */
export interface WorkflowSchedule {
  id?: number
  workflowId: number
  workflowName?: string
  name?: string
  description?: string

  // 调度配置
  scheduleType: string
  cronExpression?: string
  intervalSeconds?: number
  scheduledTime?: string

  // 输入参数
  inputParams?: Record<string, any>

  // 状态
  status?: number
  lastRunAt?: string
  nextRunAt?: string
  runCount?: number

  // 元数据
  createdBy?: number
  createdByName?: string
  createdAt?: string
  updatedAt?: string
}

/** 调度查询参数 */
export interface ScheduleQuery {
  keyword?: string
  status?: number
  workflowId?: number
  pageNum: number
  pageSize: number
}
