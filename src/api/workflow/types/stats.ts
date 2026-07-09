/** 工作流执行统计 */
export interface WorkflowStats {
  id?: number
  workflowId: number
  workflowName?: string
  statDate: string

  totalRuns?: number
  successCount?: number
  failedCount?: number
  runningCount?: number

  avgDurationMs?: number
  maxDurationMs?: number
  minDurationMs?: number

  totalTokens?: number

  humanTasksCount?: number
  humanTasksAvgMinutes?: number
}

/** 统计查询参数 */
export interface StatsQuery {
  workflowId?: number
  startDate?: string
  endDate?: string
}

/** 总览统计 */
export interface StatsOverview {
  totalWorkflows: number
  totalInstances: number
  runningInstances: number
  todayInstances: number
  successRate: number
  avgDurationMs: number
}
